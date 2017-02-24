#!/usr/bin/env node
var liskjs = require("lisk-js");
var crypto = require("crypto");
var figlet = require("figlet");
var colors = require("colors");
var request = require("request");
var asciichart = require ('asciichart');
var chart = require ('chart');
var cliSpinners = require('cli-spinners');
var Table = require('ascii-table');
var ora = require('ora');
var cowsay = require('cowsay');
var async = require('async');
var vorpal = require("vorpal")();

var server;
var network;

var networks = {
  testnet: {
    nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
    peers: [
      "13.69.159.242:7000",
      "40.68.34.176:7000",
      "52.165.40.188:7000",
      "13.82.31.30:7000",
      "13.91.61.2:7000"
    ]
  },
  mainnet: {
    nethash: "ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511",
    peers: [
      "52.187.55.110:8000",
      "51.140.181.131:8000",
      "13.73.116.99:8000"
    ]
  }
};

function findEnabledPeers(cb){
  var peers=[];
  getFromServer('http://'+server+'/peer/list', function(err, response, body){

    if(err){
      self.log(colors.red("Can't get peers from network: " + err));
      return cb(peers);
    }
    else {
      var respeers = JSON.parse(body).peers.map(function(peer){
        return peer.ip+":"+peer.port;
      });
      async.each(respeers, function(peer, cb){
        getFromServer('http://'+peer+'/api/blocks/getHeight', function(err, response, body){
          if(body != "Forbidden"){
            peers.push(peer);
          }
          cb();
        });
      },function(err){
        return cb(peers);
      });
    }
  });
}

function getNetworkFromNethash(nethash){
  for(var n in networks){
    if(networks[n].nethash == nethash){
      return n;
    }
  }
  return null;
}

function postTransaction(transaction, cb){
  request(
    {
      url: 'http://'+server+'/peer/transactions',
      headers: {
        nethash: network.nethash,
        version: '1.0.0',
        port:1
      },
      method: 'POST',
      json: true,
      body: {transaction:transaction}
    },
    cb
  );
}

function getFromServer(api, cb){
  request(
    {
      url: api,
      headers: {
        nethash: network.nethash,
        version: '1.0.0',
        port:1
      }
    },
    cb
  );
}


vorpal
  .command('connect testnet', 'Connect to testnet')
  .action(function(args, callback) {
		var self = this;
    network=networks.testnet;
    server=network.peers[Math.floor(Math.random()*1000)%network.peers.length];
    findEnabledPeers(function(peers){
      if(peers.length>0){
        server=peers[0];
        networks.testnet.peers=peers;
      }
    });
    getFromServer('http://'+server+'/peer/height', function(err, response, body){
      self.log("Node: " + server + ", height: " + JSON.parse(body).height);
      self.delimiter('lisk testnet>');
      callback();
    });
  });

vorpal
  .command('connect mainnet', 'Connect to testnet')
  .action(function(args, callback) {
		var self = this;
    network=networks.mainnet;
    server=network.peers[Math.floor(Math.random()*1000)%network.peers.length];
    findEnabledPeers(function(peers){
      if(peers.length>0){
        server=peers[0];
        networks.mainnet.peers=peers;
      }
    });
    getFromServer('http://'+server+'/peer/height', function(err, response, body){
      self.log("Node: " + server + ", height: " + JSON.parse(body).height);
      self.delimiter('lisk mainnet>');
      callback();
    });
  });

vorpal
  .command('connect node <url>', 'Connect to a server. For example "connect node 5.39.9.251:4000"')
  .action(function(args, callback) {
		var self = this;
    server=args.url;
    request.get('http://'+server+'/api/blocks/getNethash', function(err, response, body){
      if(err){
        self.log(colors.red("Failed to connect to server "+server+" - "+err));
        server=null;
        self.delimiter('lisk>');
        return callback();
      }
      var nethash = JSON.parse(body).nethash;
      var networkname = getNetworkFromNethash(nethash);
      network = networks[networkname];
      self.log("Connected to network " + nethash + colors.green(" ("+networkname+")"));
      self.delimiter('lisk '+server+'>');
      getFromServer('http://'+server+'/peer/height', function(err, response, body){
        self.log("Node height ", JSON.parse(body).height);
      });
      callback();
    });
  });

vorpal
  .command('disconnect', 'Disconnect from server or network')
  .action(function(args, callback) {
		var self = this;
    self.log("Disconnected from "+server);
    self.delimiter('lisk>');
    server=null;
    network=null;
    callback();
  });

vorpal
  .command('network stats', 'Get stats from network')
  .action(function(args, callback) {
    var self = this;
    if(!server){
      self.log("Please connect to node or network before");
      return callback();
    }
		getFromServer('http://'+server+'/peer/list', function(err, response, body){
      if(err){
        self.log(colors.red("Can't get peers from network: " + err));
        return callback();
      }
      else {
        var peers = JSON.parse(body).peers.map(function(peer){
          return peer.string;
        });
        self.log("Checking "+peers.length+" peers");
        var spinner = ora({text:"0%",spinner:"shark"}).start();
        var heights={};
        var delays={};
        var count=0;
        async.eachLimit(peers, 1, function(peer, cb){
          var delay=new Date().getTime();
          getFromServer('http://'+server+'/peer/height', function(err, response, body){
            delay=new Date().getTime()-delay;
            if(delays[delay]){
              delays[delay]++;
            }
            else{
              delays[delay]=1;
            }
            count++;
            spinner.text=Math.floor(100*count/peers.length)+"%";
            if(err){
              return cb();
            }
            else{
              var height=JSON.parse(body).height;
              if(heights[height]){
                heights[height]++;
              }
              else{
                heights[height]=1;
              }
              return cb();
            }
          });
        },function(err){
          spinner.stop();
          self.log("Finished");
          self.log(heights);
          self.log(colors.green(figlet.textSync("delays")));
          self.log(colors.green(chart(Object.values(delays),{
            width: 80,
            height: 20,
            pointChar: '█',
            negativePointChar: '░'
          })));
        });
      }
    });
    callback();
  });

vorpal
  .command('account status <address>', 'Get account status')
  .action(function(args, callback) {
    var self = this;
    if(!server){
      self.log("please connect to node or network before");
      return callback();
    }
    var address=args.address;
    request.get('http://'+server+'/api/accounts?address='+address, function(err, response, body){
      if(body=="Forbidden"){
        self.log("API is disabled on this server");
        return callback();
      }
      var a = JSON.parse(body).account;
      if(!a){
        self.log("Unknown on the blockchain");
        return callback();
      }
      for(var i in a){
        if(!a[i] || a[i].length==0) delete a[i];
      }
      delete a.unconfirmedSignature;
      delete a.secondSignature;
      delete a.address;
      var table = new Table();
      table.setHeading(Object.keys(a));
      table.addRow(Object.values(a));
      self.log(table.toString());
      request.get('http://'+server+'/api/delegates/get/?publicKey='+a.publicKey, function(err, response, body){
        var body = JSON.parse(body);
        if(body.success){
          var delegate=body.delegate;
          delete delegate.address;
          delete delegate.publicKey;
          table = new Table("Delegate");
          table.setHeading(Object.keys(delegate));
          table.addRow(Object.values(delegate));
          self.log(table.toString());
        }

        callback();
      });
    });
  });

vorpal
  .command('account send <amount> <recipient>', 'Send <amount> lisk to <recipient>')
  .action(function(args, callback) {
		var self = this;
    if(!server){
      self.log("please connect to node or network before");
      return callback();
    }
    return this.prompt({
      type: 'password',
      name: 'passphrase',
      message: 'passphrase: ',
    }, function(result){
      if (result.passphrase) {
        var transaction = liskjs.transaction.createTransaction(args.recipient, parseInt(args.amount*100000000), result.passphrase);
        postTransaction(transaction, function(err, response, body){
          if(body.success && body.transactionId){
            self.log(colors.green("Transaction sent successfully with id "+body.transactionId));
          }
          else{
            self.log(colors.red("Failed to send transaction: "+body.message));
          }
          return callback();
        });
      } else {
        self.log('Aborted.');
        return callback();
      }
    });
  });

vorpal
  .command('account delegate <username>', 'Register new delegate with <username> ')
  .action(function(args, callback) {
		var self = this;
    if(!server){
      self.log("please connect to node or network before");
      return callback();
    }
    return this.prompt({
      type: 'password',
      name: 'passphrase',
      message: 'passphrase: ',
    }, function(result){
      if (result.passphrase) {
        var transaction = liskjs.delegate.createDelegate(result.passphrase, args.username);
        postTransaction(transaction, function(err, response, body){
          if(body.success){
            self.log(colors.green("Transaction sent successfully with id "+body.transactionIds[0]));
          }
          else{
            self.log(colors.red("Failed to send transaction: "+body.error));
          }
          callback();
        });
      } else {
        self.log('Aborted.');
        callback();
      }
    });
  });

vorpal
  .command('account create', 'Generate a new random cold account')
  .action(function(args, callback) {
		var self = this;
    var passphrase = require("bip39").generateMnemonic();
		self.log("Seed    - private:",passphrase);
		self.log("Address - public :",liskjs.crypto.getAddress(liskjs.crypto.getKeys(passphrase).publicKey));
		callback();
  });

vorpal
  .command('tip [amount]', 'tip <amount> lisk to fixcrypt for this awesome tool! (default 5 Lisk)')
  .action(function(args, callback) {
    var self = this;
    args.amount = args.amount || 5;
    self.log("Sending "+args.amount+" lisk to fixcrypt (7136766316744460715L)?");
    return this.prompt({
      type: 'password',
      name: 'passphrase',
      message: 'passphrase (leave empty to abort): ',
    }, function(result){
      if (result.passphrase) {
        var transaction = liskjs.transaction.createTransaction("7136766316744460715L", parseInt(args.amount*100000000), result.passphrase);
        var tempserver = server;
        var tempnetwork = network;
        network=networks.mainnet;
        server=network.peers[Math.floor(Math.random()*1000)%network.peers.length];
        postTransaction(transaction, function(err, response, body){
          if(body.success && body.transactionId){
            self.log(colors.green(figlet.textSync("Thanks!")));
            self.log(colors.green("Thanks bro, happy you like this tool!"));
          }
          else{
            self.log(colors.red("Oops, something got wrong: "+body.message));
          }
          return callback();
        });
      } else {
        self.log('Aborted.');
        return callback();
      }
    });
  });

var sharkspinner;
vorpal
  .command("shark", "No you don't want to use this command")
  .action(function(args, callback) {
		var self = this;
    self.log(colors.red(figlet.textSync("shark")));
    sharkspinner = ora({text:"Watch out!",spinner:"shark"}).start();
    callback();
  });

vorpal
  .command("sparka")
  .hidden()
  .action(function(args, callback) {
    var time = 0;
    var self=this;
    sharkspinner && sharkspinner.stop();
    ["tux","meow","bunny","cower","dragon-and-cow"].forEach(function(spark){
      setTimeout(function(){
        self.log(cowsay.say({text:"SPAAAAARKKKAAAAAAA!", f:spark}));
  		}, time++*1000);
    });

    callback();
  });

vorpal.history('lisk-client');

vorpal.log(colors.cyan(figlet.textSync("Lisk Client","Slant")));

vorpal
  .delimiter('lisk>')
  .show();

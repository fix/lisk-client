# lisk-client
Powerful CLI client for lisk blockchain

# Installation
You need to have node installed. Then
```
$> npm install -g fix/lisk-client
$> lisk-client
    __    _      __      _________            __
   / /   (_)____/ /__   / ____/ (_)__  ____  / /_
  / /   / / ___/ //_/  / /   / / / _ \/ __ \/ __/
 / /___/ (__  ) ,<    / /___/ / /  __/ / / / /_  
/_____/_/____/_/|_|   \____/_/_/\___/_/ /_/\__/  

lisk> help

  Commands:

    help [command...]                  Provides help for a given command.
    exit                               Exits application.
    connect testnet                    Connect to testnet
    connect mainnet                    Connect to testnet
    connect node <url>                 Connect to a server. For example "connect node 5.39.9.251:4000"
    disconnect                         Disconnect from server or network
    network stats                      Get stats from network
    account status <address>           Get account status
    account send <amount> <recipient>  Send <amount> lisk to <recipient>
    account delegate <username>        Register new delegate with <username>
    account create                     Generate a new random cold account
    tip [amount]                       tip <amount> lisk to fixcrypt for this awesome tool! (default 5 Lisk)
```


```
lisk> account create
Seed    - private: spring bench orchard random car tower tide flame nation distance warfare game
Address - public : 9387025876232311237L
```

```
lisk> connect mainnet
Node: 13.73.116.99:8000, height: 2165735
lisk mainnet>
```
```
lisk mainnet> account status 7136766316744460715L
.-------------------------------------------------------------------------------------------------------.
| unconfirmedBalance |    balance    |                            publicKey                             |
|--------------------|---------------|------------------------------------------------------------------|
| 3507363469165      | 3507363469165 | a5f9cb7cde4bdc56d888c1864763436fbbc1cb0870dd9e0c08756ab0b4620744 |
'-------------------------------------------------------------------------------------------------------'
.----------------------------------------------------------------------------------------------.
|                                           Delegate                                           |
|----------------------------------------------------------------------------------------------|
| username |       vote       | producedblocks | missedblocks | rate | approval | productivity |
|----------|------------------|----------------|--------------|------|----------|--------------|
| fixcrypt | 1131161654090808 |           7062 |          204 |   30 |    10.92 |        97.19 |
'----------------------------------------------------------------------------------------------'
```

```
lisk mainnet> network stats
Checking 100 peers
Finished
{ '2165768': 81, '2165769': 19 }
      _      _                 
   __| | ___| | __ _ _   _ ___
  / _` |/ _ \ |/ _` | | | / __|
 | (_| |  __/ | (_| | |_| \__ \
  \__,_|\___|_|\__,_|\__, |___/
                     |___/     


  34 .                                                                      
     .     █                                                                
     .     █                                                                
     .     █                                                                
     .     █                                                                
     .   █ █                                                                
     .   █ █                                                                
     .   █ █                                                                
     .   █ █                                                                
     .   █ █                                                                
     .   █ █ █                                                              
     .   █ █ █       █                                                      
     . █ █ █ █ █ █ █ █ █   █                                                
   0 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             
```

# License
Copyright © 2017 ARK.io | Copyright © 2017 FX Thoorens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## INSTRUCTION TO START PROJECT

### 1. Download ubuntu 16.04 (ubuntu-16.04.6-desktop-amd64.iso):  

http://releases.ubuntu.com/16.04/ 
  
### 2. Install it on a Virtual Machine:  

   At the step "File location and size" choose **15GB or more instead of 10GB** !  
https://brb.nci.nih.gov/seqtools/installUbuntu.html

### 3. Install composer:  

(When following instructions from hyperledger website I put the exact commands I used in case it has changed) 

+ ##### Install curl

  ```sudo apt-get install curl```

+ ##### Instruction to install pre-requisites (https://hyperledger.github.io/composer/latest/installing/installing-prereqs) 
  ```
  curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh  
  chmod u+x prereqs-ubuntu.sh  
  ./prereqs-ubuntu.sh  
  ```

  ###### Close and reopen terminal to apply changes !

+ ##### Instruction to install the development environment (https://hyperledger.github.io/composer/latest/installing/development-tools.html) 
  ```
  npm install -g composer-cli@0.20  
  npm install -g composer-rest-server@0.20  
  npm install -g generator-hyperledger-composer@0.20  
  npm install -g yo  
  npm install -g composer-playground@0.20
  ```  
  ```
  mkdir ~/fabric-dev-servers && cd ~/fabric-dev-servers  
  curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz  
  tar -xvf fabric-dev-servers.tar.gz  
  cd ~/fabric-dev-servers  
  export FABRIC_VERSION=hlfv12  
  ```
  This is not in hyperledger instructions but it might be needed to execute downloadFabric.sh: `sudo chmod 666 /var/run/docker.sock`
  ```
  cd ~/fabric-dev-servers  
  export FABRIC_VERSION=hlfv12  
  ./downloadFabric.sh  
  ./startFabric.sh
  ./createPeerAdminCard.sh
  ```
#### 4. Create network (https://hyperledger.github.io/composer/latest/tutorials/developer-tutorial)
+ ##### Use yo to generate a buisness network
  ```
  yo hyperledger-composer:businessnetwork
  
  Welcome to the business network generator
  ? Business network name: tutorial-network
  ? Description: first network
  ? Author name:  clement
  ? Author email: clem.labonne@laposte.net
  ? License: Apache-2.0
  ? Namespace: org.example.biznet
  ? Do you want to generate an empty template network? No: generate a populated sample network
  ```
+ ##### Replace the network structure by our own one
  Download the `tutorial-network/` folder in order to replace `models/org.example.biznet.cto`, `lib/logic.js` & `permissions.acl` files and to get the custom-app files:
  
    In an other folder :
    ```
    git clone https://github.com/C7ement/hyperledgerComposerNetwork.git
    ```
    Copy `tutorial-network/` folder and paste it in `~/fabric-dev-servers/`.
    When asked to, merge or replace the files and directories.
    composer archive create -t dir -n .


+ ##### Deploy the network
  ```
  cd ~/fabric-dev-servers/tutorial-network  
  composer archive create -t dir -n .  
  composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna  
  composer network start --networkName tutorial-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card  
  ```
  ```
  composer-rest-server
  ? Enter the name of the business network card to use: admin@tutorial-network
  ? Specify if you want namespaces in the generated REST API: never use namespaces
  ? Specify if you want to use an API key to secure the REST API: No
  ? Specify if you want to enable authentication for the REST API using Passport: No
  ? Specify if you want to enable the explorer test interface: No
  ? Specify a key if you want to enable dynamic logging: 
  ? Specify if you want to enable event publication over WebSockets: Yes
  ? Specify if you want to enable TLS security for the REST API: No
  ```
    
#### 5. To redeploy network after structure modification 
  Delete tutorial-network@0.0.1.bna & networkadmin.card
  ```
  cd ~/fabric-dev-servers  
  ./teardownFabric.sh
  ./teardownAllDocker.sh
  ./teardownAllDocker.sh
  ```
  1 then 2
  ```
  export FABRIC_VERSION=hlfv12  
  ./downloadFabric.sh  
  ./startFabric.sh
  ./createPeerAdminCard.sh
  cd ~/fabric-dev-servers/tutorial-network  
  composer archive create -t dir -n .  
  composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna  
  composer network start --networkName tutorial-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card  
  composer-rest-server
  admin@tutorial-network
  ```

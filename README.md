## INSTRUCTION TO START PROJECT

1. Download ubuntu 16.04 (ubuntu-16.04.6-desktop-amd64.iso):  

http://releases.ubuntu.com/16.04/  
  
2. Install it on a Virtual Machine:  

At the step "File location and size" choose **15GB or more instead of 10GB** ! 
https://brb.nci.nih.gov/seqtools/installUbuntu.html  

3. Install composer:  

   + Install curl
(When following instructions from hyperledger website I put the exact commands I used in it has changed) 

   + Install curl

        sudo apt-get install curl

   + Instruction to too install pre-requisites (https://hyperledger.github.io/composer/latest/installing/installing-prereqs) 

        curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh  
        chmod u+x prereqs-ubuntu.sh  
        ./prereqs-ubuntu.sh  
    
**Close and reopen terminal to apply changes !**

   + Instruction install the development environment (https://hyperledger.github.io/composer/latest/installing/development-tools.html) 
  
        npm install -g composer-cli@0.20  
        npm install -g composer-rest-server@0.20  
        npm install -g generator-hyperledger-composer@0.20  
        npm install -g yo  
        npm install -g composer-playground@0.20  

        mkdir ~/fabric-dev-servers && cd ~/fabric-dev-servers  
        curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz  
        tar -xvf fabric-dev-servers.tar.gz  
        cd ~/fabric-dev-servers  
        export FABRIC_VERSION=hlfv12  
        ./downloadFabric.sh

        cd ~/fabric-dev-servers  
        export FABRIC_VERSION=hlfv12  
        ./startFabric.sh  
        ./createPeerAdminCard.sh  

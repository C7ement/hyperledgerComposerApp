                                        INSTRUCTION TO START PROJECT

1. Download ubuntu 16.04 (ubuntu-16.04.6-desktop-amd64.iso):  

http://releases.ubuntu.com/16.04/  
  
2. Install it on a Virtual Machine:  

! You need more thqn 10GB of memory so at the step "File location and size" choose 15GB instead of 10GB !  
https://brb.nci.nih.gov/seqtools/installUbuntu.html  

3. Install composer:  

(When following instructions from hyperledger website I put the exact commands I used in it has changed) 

Install curl

    sudo apt-get install curl

Instruction to too set up environment (https://hyperledger.github.io/composer/latest/installing/installing-prereqs) 

    curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh  
    chmod u+x prereqs-ubuntu.sh  
    ./prereqs-ubuntu.sh  
    
! Close and reopen terminal to apply changes !

Instruction to too set up environment (https://hyperledger.github.io/composer/latest/installing/development-tools.html) 
  
    npm install -g composer-cli@0.20  
    npm install -g composer-rest-server@0.20  
    npm install -g generator-hyperledger-composer@0.20  
    npm install -g yo  

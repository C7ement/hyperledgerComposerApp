const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

let cardname = "admin@tutorial-network";
class UserRegistry {

    constructor() {
        this.bizNetworkConnection = new BusinessNetworkConnection();
    }

    init() {
        return this.bizNetworkConnection.connect(cardname).then((businessNetworkDefinition) => {
            this.factory = businessNetworkDefinition.getFactory();
            return this.bizNetworkConnection.getParticipantRegistry('org.example.biznet.User');
        }, onRejected).then((userRegistry) => {
            this.userRegistry = userRegistry;
            return Promise.resolve();
        }, onRejected);
    }

    addUser(userId) {
        console.log('Getting user registry.');
        return this.userRegistry.exists(userId).then((exist) => {
            if (exist) {
                console.log("User already exists. Id: " + userId);
                return Promise.reject("Err: User already exists. Id: " + userId);
            } else {
                let user = this.factory.newResource('org.example.biznet','User',userId);
                return this.userRegistry.add(user);
            }
        }, onRejected);
    }

    removeUser(userId) {
        console.log('Getting user registry.');
        return this.userRegistry.exists(userId).then((exist) => {
            if (exist) {
                return this.userRegistry.remove(userId);
            } else {
                console.log('User does not exist.');
                return Promise.reject("Err: "+userId+" does not exist.");
            }
        }, onRejected);
    }

    removeAllUsers() {
        console.log('Getting user registry.');
        return this.userRegistry.getAll().then( (resources) => {
            return this.userRegistry.removeAll(resources);
        }, onRejected);
    }

    getUser(userId) {
        console.log('Getting user : '+userId);
        return this.userRegistry.get(userId);
    }

    getUserTable() {
        return this.userRegistry.resolveAll().then((resources) => {
            let table = [];
            for (let res of resources) {
                table.push(res.userId);
            }
            return Promise.resolve(table);
        }, onRejected);
    }


}
function onRejected (err) {
    console.error('Promise rejected', err);
}

module.exports = UserRegistry;

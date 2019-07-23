const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const Table = require('cli-table');

let cardname = "admin@tutorial-network";

class UserRegistry {

    constructor() {
        this.bizNetworkConnection = new BusinessNetworkConnection();
    }

    async init() {
        this.businessNetworkDefinition = await this.bizNetworkConnection.connect(cardname);
    }

    async addUser(userId) {
        console.log('Getting user registry.');
        this.userRegistry = await this.bizNetworkConnection.getParticipantRegistry('org.example.biznet.User');
        let factory = this.businessNetworkDefinition.getFactory();
        let user = factory.newResource('org.example.biznet','User',userId);
        await this.userRegistry.add(user);
    }

    async getUser(userId) {
        console.log('Getting user : '+userId);
        this.userRegistry = await this.bizNetworkConnection.getParticipantRegistry('org.example.biznet.User');
        return await this.userRegistry.get(userId);
    }

    async getUserTable() {

        try {
            let userRegistry = await this.bizNetworkConnection.getAssetRegistry('org.example.biznet.User');

            let aResources = await userRegistry.resolveAll();
            let table = new Table({
                head: ['UserId']
            });
            let arrayLength = aResources.length;

            for (let i = 0; i < arrayLength; i++) {

                let tableLine = [];
                tableLine.push(aResources[i].userId);
                table.push(tableLine);
            }
            return table;
        } catch(error) {
            console.error("Error getting user table", error);
        }
    }
}

module.exports = UserRegistry;

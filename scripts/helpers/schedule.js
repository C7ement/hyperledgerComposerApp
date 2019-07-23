const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

let cardname = "admin@tutorial-network";

class Schedule{

    constructor() {
        this.bizNetworkConnection = new BusinessNetworkConnection();
    }

    async init() {
        this.businessNetworkDefinition = await this.bizNetworkConnection.connect(cardname);
    }

    async addSchedule(scheduleId, userId, value) {


        requirejs(["schedule.js)"], function (schedule_registry) {

            let scheduleRegistry = await this.bizNetworkConnection.getAssetRegistry('org.example.biznet.Schedule');
            console.log('Getting schedule registry.');

            let factory = this.businessNetworkDefinition.getFactory();
            let schedule = factory.newResource('org.example.biznet', 'Schedule', scheduleId);
            schedule.user = factory.newRelationship('org.example.biznet', 'User', userId);
            schedule.value = value;
            await scheduleRegistry.add(schedule);
        });
    }
/*
    async getScheduleTable() {

        try {
            let scheduleRegistry = await this.bizNetworkConnection.getAssetRegistry('org.example.biznet.Schedule');

            let aResources = await scheduleRegistry.resolveAll();
            let table = new Table({
                head: ['ScheduleId', 'UserId', 'Value']
            });
            let arrayLength = aResources.length;

            for (let i = 0; i < arrayLength; i++) {

                let tableLine = [];
                tableLine.push(aResources[i].scheduleId);
                tableLine.push(aResources[i].user.userId);
                tableLine.push(aResources[i].value);
                table.push(tableLine);
            }
            return table;
        } catch(error) {
            console.error("Error getting schedule table", error);
        }
    }*/
}

module.exports = Schedule;

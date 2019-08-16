const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

let cardname = "admin@tutorial-network";
const onRejected = function(err) {
    console.error('Promise rejected aggregated-demand-registry.js', err);
    process.exit(1);
};
class AggregatedDemandRegistry{

    constructor() {
        this.bizNetworkConnection = new BusinessNetworkConnection();
    }

    init() {
        return this.bizNetworkConnection.connect(cardname).then((businessNetworkDefinition) => {
            this.businessNetworkDefinition = businessNetworkDefinition;
            this.factory = businessNetworkDefinition.getFactory();
            return this.bizNetworkConnection.getAssetRegistry('org.example.biznet.AggregatedDemand');
        }, onRejected).then((aggregatedDemandRegistry) => {
            this.aggregatedDemandRegistry = aggregatedDemandRegistry;
            return Promise.resolve();
        }, onRejected);
    }

    addAggregatedDemand(date, value, participantCount) {
        console.log('Getting aggregated demand registry.');
        return this.aggregatedDemandRegistry.exists(date).then((exist) => {
            if (exist) {
                console.log("Aggregated Demand already exists.");
                return Promise.rejected("Err: Aggregated Demand exists.");
            } else {
                let aggregatedDemand = this.factory.newResource('org.example.biznet','AggregatedDemand',date);
                aggregatedDemand.value = value;
                aggregatedDemand.participantCount = participantCount;
                return this.aggregatedDemandRegistry.add(aggregatedDemand);
            }
        });
    }

    removeAllAggregatedDemand() {
        console.log('Getting schedule registry.');
        return this.aggregatedDemandRegistry.getAll().then((resources) => {
            return this.aggregatedDemandRegistry.removeAll(resources);
        }, onRejected);
    }

    getAllAggregatedDemand() {
        return this.aggregatedDemandRegistry.resolveAll().then((resources) => {
            let data = [];

            for (let res of resources) {
                let sched = {};
                sched.date = res.date;
                sched.value = res.value;
                sched.participantCount = res.participantCount;
                data.push(sched);
            }
            return Promise.resolve(data);
        }, onRejected);
    }
    getAggregatedDemand(date) {
        return this.aggregatedDemandRegistry.get(date);
    }

}

module.exports = AggregatedDemandRegistry;

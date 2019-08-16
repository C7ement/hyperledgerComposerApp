const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const CsvFileManager = require('./csv-file-manager');
const UserRegistry = require('./user-registry');
const ScheduleRegistry = require('./schedule-registry');
const AggregatedDemandRegistry = require('./aggregated-demand-registry');

function newUser(user) {
    console.log("New user request : " + user[0]);
    return userRegistry.addUser(user[0])
        .then(function() {
            console.log("User '" + user[0] + "' added.");
            return Promise.resolve();
        }, onRejected);
}

const onRejected = function(err) {
    console.error('Promise rejected', err);
};

let userRegistry = new UserRegistry();
let scheduleRegistry = new ScheduleRegistry();
let aggregatedDemandRegistry = new AggregatedDemandRegistry();

const csv=require('csvtojson');

let demand = {}, schedules = [];
let selectedDate = '01/01';
Promise.all([
    userRegistry.init(),
    scheduleRegistry.init(),
    aggregatedDemandRegistry.init()])
    .then(() => {
        return Promise.all([
            userRegistry.removeAllUsers(),
            scheduleRegistry.removeAllSchedules(),
            aggregatedDemandRegistry.removeAllAggregatedDemand()]);
    }, onRejected)
    .then(() => {
        return Promise.all([
            newUser(["User0"]),
            newUser(["User1"]),
            newUser(["User2"])]);
    }, onRejected)
    .then(()=>{
        let promises = [];
        for (let i=0; i<3; i++) {
            promises.push(csv().fromFile('./data/forecast'+i+'.csv'));
        }
        return new CsvFileManager().getDemandAllUsersOneDay(selectedDate);
    }, onRejected)
    .then((demand)=> {
        let aggregatedDemand = [];
            aggregatedDemand.length = 24;
            aggregatedDemand.fill(0);
            for (let user in demand) {
                console.log(demand[user].length);
                for (let t in demand[user]) {
                    aggregatedDemand[t] += demand[user][t];
                }
            }
        console.log(aggregatedDemand);
        return aggregatedDemandRegistry.addAggregatedDemand(selectedDate, aggregatedDemand, demand.length)
    }, onRejected)
    .then(()=> {
        console.log('Aggregated demand added successfully.');
    }, onRejected);

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const UserRegistry = require('./user-registry');
const ScheduleRegistry = require('./schedule-registry');


const onResolved = function() { process.exit(0); };
const onRejected = function(err) {
    console.error('Promise rejected', err);
    process.exit(1);
};


let userRegistry = new UserRegistry();
let scheduleRegistry = new ScheduleRegistry();

/*
userRegistry.init()
    .then(function() {return userRegistry.addUser("user0")}, onRejected)
    .then(onResolved, onRejected);
*/
/*

scheduleRegistry.init()
    .then(function() {
       return scheduleRegistry.addSchedule("sched0", "user0", [-10.2,1.20,7.07]);
    }, onRejected)
    .then(onResolved, onRejected);
*/


scheduleRegistry.init()
    .then(function() {
        return scheduleRegistry.getScheduleTable();
    }, onRejected)
    .then(function(table) {
        console.log(table.toString());
        process.exit(0);
    }, onRejected);

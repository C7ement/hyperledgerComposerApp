const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const UserRegistry = require('./user-registry');
const ScheduleRegistry = require('./schedule-registry');

function newUser(user) {
    console.log("New user request : " + user[0]);
    return userRegistry.addUser(user[0])
        .then(function() {
            console.log("User '" + user[0] + "' added.");
            return Promise.resolve();
        }, onRejected);
}

function newSchedule(schedule) {
    console.log("New schedule request : " + schedule[0] +" "+ schedule[1] +" "+ schedule[2] +" "+ eval(schedule[3]));
    return scheduleRegistry.addSchedule(schedule[0], schedule[1], schedule[2], eval(schedule[3]))
        .then(function() {
            console.log("Schedule '" + schedule[0] + "' added.");
            return Promise.resolve();
        }, onRejected);
}


const onRejected = function(err) {
    console.error('Promise rejected', err);
};

let userRegistry = new UserRegistry();
let scheduleRegistry = new ScheduleRegistry();

const csvFilePath='./data/day0.csv';
const csv=require('csvtojson');


userRegistry.init().then(()=>{
    return scheduleRegistry.init();
}, onRejected)
    .then( () => {
        newUser(["User0"]).then(()=>{
            return newUser(["User1"]).then(()=>{
                csv({ noheader:true })
                    .fromFile(csvFilePath)
                    .then((jsonArray)=>{
                        for (let i in jsonArray) {
                            let array = [];
                            for(let j in jsonArray[i]){
                                array.push(eval(jsonArray[i][j]));
                            }
                            newSchedule(["Schedule"+i,"User"+i%2,""+Math.floor(i/2),array]);
                        }
                    }, onRejected);
            })
        }, onRejected);
    });

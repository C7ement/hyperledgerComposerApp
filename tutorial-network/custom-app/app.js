const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const UserRegistry = require('./user-registry');
const ScheduleRegistry = require('./schedule-registry');
const AggregatedDemand = require('./aggregated-demand-registry');

////// Express Server :
const express = require('express');
let app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

let htmlPath = path.join(__dirname, 'webclient');
app.use(express.static(htmlPath));

io.on('connection', (socket) => {

    // USER
    socket.on('new user', (user) => {
        console.log("New user request : " + user[0]);
        userRegistry.addUser(user[0])
            .then(() => {
                console.log("User '" + user[0] + "' added.");
                sendUsers();
            }, onRejected);
    });

    socket.on('remove User', (userId) => {
        console.log("Removing user : " + userId );
        userRegistry.removeUser(userId)
            .then(() => {
                console.log("User '" + userId + "' removed.");
                sendUsers();
            }, onRejected);
    });

    socket.on('remove all users', () => {
        console.log("Removing all users");
        userRegistry.removeAllUsers()
            .then(() => {
                console.log("All users removed.");
                sendUsers();
            }, onRejected);
    });

    // SCHEDULE
    socket.on('new schedule', (schedule) => {
        console.log("New schedule request : " + schedule[0] +" "+ schedule[1] +" "+ schedule[2] +" "+ eval(schedule[3]));
        scheduleRegistry.addSchedule(schedule[0], schedule[1], schedule[2], eval(schedule[3]))
            .then(() => {
                console.log("Schedule '" + schedule[0] + "' added.");
                sendSchedules();
            }, onRejected);
    });

    socket.on('remove Schedule', (scheduleId) => {
        console.log("Removing schedule : " + scheduleId );
        scheduleRegistry.removeSchedule(scheduleId)
            .then(() => {
                console.log("Schedule '" + scheduleId + "' removed.");
                sendSchedules();
            }, onRejected);
    });

    socket.on('remove all schedules', () => {
        console.log("Removing all schedules");
        scheduleRegistry.removeAllSchedules()
            .then(() => {
                console.log("All schedules removed.");
                sendSchedules();
            }, onRejected);
    });


    socket.on('update Schedule', (scheduleId, value) => {
        console.log("modify value of "+scheduleId+" to "+value);
        scheduleRegistry.updateSchedule(scheduleId, eval(value))
            .then(() => {
                console.log(scheduleId+" modified to "+value);
                sendSchedules();
            }, onRejected);
    });
    sendUsers();
    sendSchedules();
    sendAggregatedDemand();
    sendAllTransactions();
});

let userRegistry = new UserRegistry();
let scheduleRegistry = new ScheduleRegistry();
let aggregatedDemand = new AggregatedDemand();



Promise.all([userRegistry.init(),
            scheduleRegistry.init(),
            aggregatedDemand.init()])
    .then( () => {
        server.listen(3003, () => {
            console.log('listening on port 3003');
        });
    }, onRejected);


function onRejected (err) {
    console.error('Promise rejected', err);
}

function sendSchedules() {
    scheduleRegistry.getScheduleTable()
        .then((table) => {
            io.sockets.emit("update Schedule", table);
        }, onRejected);
}

function sendUsers() {
    userRegistry.getUserTable()
        .then((table) => {
            io.sockets.emit("update User", table);
        }, onRejected);
}

function sendAllTransactions() {
    aggregatedDemand.getAllAggregatedDemand()
        .then((table) => {
            io.sockets.emit("update Aggregated Demand", table);
        }, onRejected);
}

function sendAggregatedDemand() {
    scheduleRegistry.getAllTransactions()
        .then((table) => {
            io.sockets.emit("update All Transactions", table);
        }, onRejected);
}


const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const UserRegistry = require('./user-registry');
const ScheduleRegistry = require('./schedule-registry');

////// Express Server :
const express = require('express');
let app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

let htmlPath = path.join(__dirname, 'webclient');
app.use(express.static(htmlPath));

io.on('connection', function(socket) {

    socket.on('new user', (userId) => {
        console.log("New user request : " + userId);
        userRegistry.init()
            .then(function() {return userRegistry.addUser(userId)}, onRejected)
            .then(onResolved, onRejected);
    });

    socket.on('new schedule', (scheduleId, userId, value) => {
        console.log("New schedule request : " + scheduleId + " " + userId + " " + value);

        scheduleRegistry.init()
            .then(function() {
                return scheduleRegistry.addSchedule(scheduleId, userId, eval(value));
            }, onRejected)
            .then(onResolved, onRejected);
    });

});

server.listen(3001, function(){
    console.log('listening on port 3001');
});
//////

const onResolved = function() {  };
const onRejected = function(err) {
    console.error('Promise rejected', err);
    process.exit(1);
};


let userRegistry = new UserRegistry();
let scheduleRegistry = new ScheduleRegistry();

/*
*/
/*

scheduleRegistry.init()
    .then(function() {
       return scheduleRegistry.addSchedule("sched0", "user0", [-10.2,1.20,7.07]);
    }, onRejected)
    .then(onResolved, onRejected);


scheduleRegistry.init()
    .then(function() {
        return scheduleRegistry.getScheduleTable();
    }, onRejected)
    .then(function(table) {
        console.log(table.toString());
        process.exit(0);
    }, onRejected);

*/

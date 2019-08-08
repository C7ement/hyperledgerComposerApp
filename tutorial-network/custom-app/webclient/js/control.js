let socket;


window.onload = function(){
    socket = io.connect();
};

function removeAllSchedules() {
    socket.emit("remove all schedules");
}

function removeAllUsers() {
    socket.emit("remove all users");
}

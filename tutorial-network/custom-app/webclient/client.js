let socket;

function newUser()  {
    socket.emit("new user" ,document.getElementById("newUserId").value);
}
function newSchedule()  {
    let scheduleId = document.getElementById("newSchedId").value;
    let userId = document.getElementById("newSchedUserId").value;
    let value = document.getElementById("newSchedValue").value;
    socket.emit("new schedule" , scheduleId, userId, value);
}

window.onload = function(){
    socket = io.connect();
};

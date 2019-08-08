let socket;

function newUser()  {
    let newUser = document.getElementById("userInput");
    let user = [];
    for (let input of newUser.childNodes) {
        user.push(input.childNodes[0].value);
    }
    socket.emit("new user" ,user);
}
function newSchedule()  {
    let newSchedule = document.getElementById("scheduleInput");
    let schedule = [];
    for (let input of newSchedule.childNodes) {
        schedule.push(input.childNodes[0].value);
    }
    socket.emit("new schedule" , schedule);
}

function remove(entity, id) {
    entity = "remove " + entity;
    socket.emit(entity, id);
}

function edit(id) {
    let tr = document.getElementById("schedID_"+id);
    let value, btnSend, btnDel;
    for (let td of tr.childNodes) {
        if (td.className === "value") {
            value = td;
        } else if (td.className === "edit") {
            btnSend = td;
        } else if (td.className === "delete") {
            btnDel = td;
        }
    }
    value.innerHTML = '<input id="schedID_'+id+'_value" type="text" class="form-control"/>';
    btnDel.innerHTML = '<button onclick="modifySchedule(\''+id+'\')" type="submit" class="btn btn-light"><img src="../images/send.png" width="20px"/></button>';
    btnSend.innerHTML = '<button onclick="displayTables()" type="submit" class="btn btn-light"><img src="../images/edit.svg" width="20px"/></button>';
}

function modifySchedule(id) {
    let value = document.getElementById("schedID_"+id+"_value").value;
    socket.emit("update Schedule", id, value);
}

window.onload = function(){
    socket = io.connect();
    socket.on("update User", (userData) => {
        this.userData = userData;
        if (this.userData!=null && this.scheduleData!=null) {
            displayTables();
        }
    });
    socket.on("update Schedule", (scheduleData) => {
        this.scheduleData = scheduleData;
        if (this.userData!=null && this.scheduleData!=null) {
            displayTables();
        }
    });
};



function displayTables() {
    let userData = this.userData;
    let scheduleData = this.scheduleData;
    let table, html;

    //Users
    table = document.getElementById("userTable");
    html = '<thead> <tr>';
    html += '<th>UserID</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    for (let userId of userData) {
        html += '<tr>';
        html += '<td>' + userId + '</td>';
        html += '<td> <button onclick="remove(\'User\', \''+userId+'\')" type="submit" class="btn btn-light"><img src="../images/delete.png" width="20px"/></button></td>';
        html += '</tr>';
    }
    html += '<tr id=userInput>';
    html += '<td><input type="text" class="form-control"></td>';
    html += '<td><button onclick="newUser()" type="submit" class="btn btn-light"><img src="../images/send.png" width="20px"/></button></td>';
    html += '</tr>';
    html += '</tbody>';
    table.innerHTML = html;

    //Schedules
    table = document.getElementById("scheduleTable");
    html = '<thead> <tr>';
        html += '<th>ID</th><th>UserID</th><th>Date</th><th>Value</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    let cleanedData = scheduleData.data.map( (schedule) => {
        schedule.value = schedule.value.map( (value) => {
            return " "+value.toString().substring(0,4);
        });
        return schedule;
    });
    for (let schedule of cleanedData) {
        html += '<tr id="schedID_'+schedule.id+'">';
        html += '<td>' + schedule.id + '</td>';
        html += '<td>' + schedule.userId + '</td>';
        html += '<td>' + schedule.date + '</td>';
        html += '<td class="value">[' + schedule.value + ' ]</td>';
        html += '<td class="edit"> <button onclick="edit(\''+schedule.id+'\')" type="submit" class="btn btn-light"><img src="../images/edit.svg" width="20px"/></button></td>';
        html += '<td class="delete"> <button onclick="remove(\'Schedule\', \''+schedule.id+'\')" type="submit" class="btn btn-light"><img src="../images/delete.png" width="20px"/></button></td>';
        html += '</tr>';
    }
    html += '<tr id=scheduleInput>';
    html += '<td><input type="text" class="form-control"></td>';
    html += '<td><select class="form-control">';
    for (let userId of userData) {
        html += '<option>'+userId+'</option>';
    }
    html += '</td>';
    html += '<td><input type="text" class="form-control"/></td>';
    html += '<td><input type="text" class="form-control"/></td>';
    html += '<td><button onclick="newSchedule()" type="submit" class="btn btn-light"><img src="../images/send.png" width="20px"/></button></td>';
    html += '</tr>';
    html += '</tbody>';
    table.innerHTML = html;


}


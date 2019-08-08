let socket;


window.onload = function(){
    socket = io.connect();
    socket.on("update Schedule", (scheduleData) => {
        this.scheduleData = scheduleData;
            displayTable1("1");
            displayTable2("User0","1");
    });
};



function displayTable1(daySelected) {

    let scheduleData = this.scheduleData;
    let table, html;

    //Schedules
    table = document.getElementById("table1");
    html = '<table style="display: inline;" class="table table-hover table-sm m-3"><thead class="thead-light "> <tr>';
    html += '<th>Day</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    let days = scheduleData.data.map( (value) => {
        return value.date;
    }).filter( (elem, index, self) => {
        return index === self.indexOf(elem);
    });
    days.sort((a, b) => { return eval(a)>eval(b)});
    for (let day of days) {
        if(day === daySelected) {
            html += '<tr><td onclick="displayTable1(\''+day+'\')"><b>' + day + '</b></td></tr>';
        } else {
            html += '<tr><td onclick="displayTable1(\''+day+'\')">' + day + '</td></tr>';
        }
    }
    html += '</tbody>';
    html += '</tr></thead></table>';


    html += '<table style="display: inline;" class="table table-sm m-3"><thead class="thead-light"> <tr>';
    html += '<th>User</th>';
    html += '<th>Schedule ID</th>';
    html += '<th>Value</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    let schedules = scheduleData.data.filter( (elem) => {
        return elem.date === daySelected;
    });
    schedules.sort((a, b) => { return a.userId>b.userId;});
    for (let schedule of schedules) {
        html += '<tr>';
        html += '<td>' + schedule.userId + '</td>';
        html += '<td>' + schedule.id + '</td>';
        html += '<td><canvas id="tab1_'+schedule.id+'" ></canvas></td>';
        html += '</tr>';
    }
    html += '</tbody></table>';
    table.innerHTML = html;
    for (let schedule of schedules) {
        addHistogram("tab1_"+schedule.id,schedule.value);
    }

}
function displayTable2(userSelected, daySelected) {


    let scheduleData = this.scheduleData;
    let table, html;

    //Day
    table = document.getElementById("table2");
    html = '<table style="display: inline;" class="table table-hover table-sm m-3"><thead class="thead-light "> <tr>';
    html += '<th>Day</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    let days = scheduleData.data.map( (value) => {
        return value.date;
    }).filter( (value, index, self) => {
        return index === self.indexOf(value);
    });
    days.sort((a, b) => { return eval(a)>eval(b)});
    for (let day of days) {
        if(day === daySelected) {
            html += '<tr><td onclick="displayTable2(\''+userSelected+'\',\''+day+'\')"><b>' + day + '</b></td></tr>';
        } else {
            html += '<tr><td onclick="displayTable2(\''+userSelected+'\',\''+day+'\')">' + day + '</td></tr>';
        }
    }
    html += '</tbody>';
    html += '</tr></thead></table>';

    //User
    table = document.getElementById("table2");
    html += '<table style="display: inline;" class="table table-hover table-sm m-3"><thead class="thead-light "> <tr>';
    html += '<th>User</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    let users = scheduleData.data.map( (value) => {
        return value.userId;
    }).filter( (elem, index, self) => {
        return index === self.indexOf(elem);
    });
    days.sort((a, b) => { return eval(a)>eval(b)});
    for (let user of users) {
        if(user === userSelected) {
            html += '<tr><td onclick="displayTable2(\''+user+'\',\''+daySelected+'\')"><b>' + user + '</b></td></tr>';
        } else {
            html += '<tr><td onclick="displayTable2(\''+user+'\',\''+daySelected+'\')">' + user + '</td></tr>';
        }
    }
    html += '</tbody>';
    html += '</tr></thead></table>';
    let added;
    added = scheduleData.addAsset.filter( (elem) => {
        return (elem.resources[0].date === daySelected) && (elem.resources[0].user.userId === userSelected);
    });
    if (added.length >1) {
        console.log("Added.length > 1");
        let maxTimestamp = Math.max.apply(null,added.map(function(elem) {
            return Number(new Date(elem.timestamp));
        }));
        added = added.find(function(elem){ return Number(new Date(elem.timestamp)) === maxTimestamp; });
    } else {
        added = added[0];
    }
    let addedTime = added.timestamp;
    html += '<table style="display: inline;" class="table table-sm m-3"><thead class="thead-light"> <tr>';
    html += '<th>Value</th>';
    html += '<th>Time</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    let schedules = [];
    schedules.push({value: added.resources[0].value, time: added.timestamp});
    let updates = scheduleData.updateAsset.filter( (update) => {
        console.log(update.timestamp);
        return (update.schedule.date === daySelected) && (update.schedule.user.userId === userSelected) && (update.timestamp > addedTime);
    });
    for (let update of updates) {
        schedules.push({value: update.newValue, time: update.timestamp});
    }
    for (let i in schedules) {
        html += '<tr>';
        html += '<td><canvas id="tab2_'+i+'" ></canvas></td>';
        let d = new Date(schedules[i].time);
        html += '<td>'+d.getHours()+':'+d.getMinutes()+'</td>';
        html += '</tr>';
    }
    html += '</tbody></table>';

    table.innerHTML = html;
    for (let i in schedules) {
        addHistogram("tab2_"+i, schedules[i].value);
    }
}


function addHistogram(id, value) {
    let ctx = document.getElementById(id).getContext('2d');
    let labels = [];
    for (let i=0; i<24; i++) {
        labels.push(i.toString());
    }
    //let background = value.map
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: value,
                backgroundColor: 'rgba(255, 99, 132, 0.4)'
            }]
        },
        options: {
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.yLabel;
                    }
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 1.0,
                    display: false
                }],
                yAxes: [{
                    ticks: {
                        display: false,
                        suggestedMin: -1,
                        suggestedMax: 1
                    },
                }]
            }
        }
    });

}

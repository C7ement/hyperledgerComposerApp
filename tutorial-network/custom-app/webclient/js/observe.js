let socket;


window.onload = function(){
    socket = io.connect();
    socket.on("update Schedule", (scheduleData) => {
        this.scheduleData = scheduleData;
        displayTable1("01/01");
        if (this.aggregatedDemand != null) {
            displayTable2("01/01");
        }
    });
    socket.on("update Aggregated Demand", (aggregatedDemand) => {
        this.aggregatedDemand = aggregatedDemand;
        if (this.scheduleData != null) {
            displayTable2("01/01");
        }
    });
    socket.on("update All Transactions", (transactions)=>{
        displayTransactionHistory(transactions);
    });
};



function displayTransactionHistory(transactions) {

    let table, html;
    console.log(transactions);
    //Schedules
    table = document.getElementById("tableHistorian");

    html = `
        <table style="display: inline;" class="table table-hover table-sm m-3"><thead class="thead-light ">
            <thead>
                <tr>
                    <th class="text-center">Date</th>
                    <th class="text-center">Time</th>
                    <th class="text-center">Transaction Type</th>
                    <th class="text-center">Info</th>
                </tr>
            </thead>
            <tbody>`;

    transactions.forEach((tr)=>{
        let type;
        let info;
        switch (tr.type) {
            case 'org.hyperledger.composer.system.StartBusinessNetwork':
                type = 'Start Business Network';
                break;
            case 'org.hyperledger.composer.system.AddParticipant':
                type = 'Add Participant';
                info = tr.data.resources[0].userId;
                break;
            case 'org.hyperledger.composer.system.IssueIdentity':
                type = 'IssueI dentity';
                break;
            case 'org.hyperledger.composer.system.AddAsset':
                type = 'Asset Added';
                info = tr.data.resources[0].scheduleId;
                break;
            case 'org.hyperledger.composer.system.RemoveAsset':
                type = 'Asset Removed';
                info = tr.data.resourceIds;
                break;
            case 'org.example.biznet.ScheduleUpdate':
                type = 'Schedule Updated';
                info = tr.data.schedule.scheduleId;
                break;
            case 'org.hyperledger.composer.system.ActivateCurrentIdentity':
                type = 'Activate Current Identity';
                break;
            case 'org.hyperledger.composer.system.RemoveParticipant':
                type = 'Remove Participant';
                info = tr.data.resourceIds;
                break;
            default:
                break
        }
        if (!info) {
            info = ``;
        }
        let d = new Date(tr.data.timestamp);
        let date = addZero(d.getDay())+`.`+addZero(d.getMonth())+`.`+d.getFullYear();

        let time = d.getHours()+`:`+addZero(d.getMinutes())+`:`+addZero(d.getSeconds());

        html += `
            <tr>
                <td class="text-center">`+date+`</td>
                <td class="text-center">`+time+`</td>
                <td class="text-center">`+type+`</td>
                <td class="text-center">`+info+`</td>
            </tr>`;
    });

    html += `
    </tbody>
</table>`;
    table.innerHTML = html;
}

function displayTable1(daySelected) {

    let scheduleData = this.scheduleData;
    let table, html;

    //Schedules
    table = document.getElementById("table1");
    html = `<table style="display: inline;" class="table table-hover table-sm m-3"><thead class="thead-light "> <tr>
            <th>Day</th>
            </tr></thead>
            <tbody>`;
    let days = scheduleData.data.map( (value) => {
        return value.date;
    }).filter( (elem, index, self) => {
        return index === self.indexOf(elem);
    });
    days.sort((a, b) => { return eval(a)>eval(b)});
    for (let day of days) {
        if(day === daySelected) {
            html += `<tr><td onclick="displayTable1('`+day+`')"><b>` + day + `</b></td></tr>`;
        } else {
            html += `<tr><td onclick="displayTable1('`+day+`')">` + day + `</td></tr>`;
        }
    }
    html += `</tbody>
            </tr></thead></table>`;


    html += `
        <table style="display: inline;" class="table table-sm m-3"><thead class="thead-light"> <tr>
            <th>User</th>
            <th>Schedule ID</th>
            <th>Value</th>
        </tr></thead>
        <tbody>`;
    let schedules = scheduleData.data.filter( (elem) => {
        return elem.date === daySelected;
    });
    schedules.sort((a, b) => { return a.userId>b.userId;});
    for (let schedule of schedules) {
        html += `<tr>
        <td>`+ schedule.userId + `</td>
        <td>`+ schedule.id + `</td>
        <td><canvas id="tab1_`+schedule.id+`" ></canvas></td>
        </tr>`;
    }
    html += `</tbody></table>`;
    table.innerHTML = html;
    for (let schedule of schedules) {
        addHistogram("tab1_"+schedule.id,schedule.value);
    }

}
function displayTable2(daySelected) {


    let scheduleData = this.scheduleData;
    let schedulesPerUser = {};
    let table, html =``;
    let dayTable;
    let scheduleTable;
    let demandTable;


    //Day
    table = document.getElementById("table2");
    dayTable = `
        <table style="display: inline;" class="table table-hover table-sm m-3"><thead class="thead-light "> 
            <thead>
                <tr>
                    <th>Day</th>
                </tr>
            </thead>
            <tbody>
`;
    let days = scheduleData.data.map( (value) => {
        return value.date;
    }).filter( (value, index, self) => {
        return index === self.indexOf(value);
    });
    days.sort((a, b) => eval(a)>eval(b));
    for (let day of days) {
        if(day === daySelected) {
            dayTable += `<tr><td onclick="displayTable2('`+day+`')"><b>` + day + `</b></td></tr>`;
        } else {
            dayTable += `<tr><td onclick="displayTable2('`+day+`')">` + day + `</td></tr>`;
        }
    }
    dayTable += `
            </tbody>
        </table>
`;

    //User
    let users = scheduleData.data.map( (value) => {
        return value.userId;
    }).filter( (elem, index, self) => {
        return index === self.indexOf(elem);
    });
    days.sort((a, b) => eval(a)>eval(b));


    let demandUpdates = [];
    let demandOneDay = getDemandUpdates(daySelected);

    let schedulesHead = ``;

    let lines = [];
    for (let user of users) {

        schedulesHead += `<th class="text-center">`+user+`</th>`;
        console.log(user);
        let added;
        added = scheduleData.addAsset.filter( elem => {
            if ( ! elem.resources[0].user) return false;
            return (elem.resources[0].date === daySelected) && (elem.resources[0].user.userId === user)
        });
        if (added != null && added.length >1) {
            console.log("Added.length > 1");
            let maxTimestamp = Math.max.apply(null,added.map(function(elem) {
                return Number(new Date(elem.timestamp));
            }));
            added = added.find( elem => Number(new Date(elem.timestamp)) === maxTimestamp );
        } else if (added != null) {
            added = added[0];
        }

        let schedules = [];
        if (added != null) {
            let addedTime = added.timestamp;
            schedules.push({value: added.resources[0].value, time: added.timestamp, s: added.resources[0].s_endOfDay, difference: added.resources[0].diffrenceWithPreviousSchedule});
            let updates = scheduleData.updateAsset.filter( (update) => {
                return (update.schedule.date === daySelected) && (update.schedule.user.userId === user) && (update.timestamp > addedTime);
            });
            for (let update of updates) {
                schedules.push({value: update.newValue, time: update.timestamp, s: update.s_endOfDay, difference: update.schedule.diffrenceWithPreviousSchedule});
            }
            schedules.sort((a,b) => a.time > b.time);
            for (let i in schedules) {
                if ( ! lines[i]) {
                    lines[i] = ``;
                }
                if ( ! demandUpdates[i] ) {
                    demandUpdates[i] = {value: demandOneDay, difference: []};
                }
                demandUpdates[i].value = demandUpdates[i].value.map( (demand_t, t) => demand_t+schedules[i].value[t]);
                let difference;
                if (i>0) {
                    let scheduleDiff = schedules[i].value.map ((s, t) => Math.abs(s-schedules[i-1].value[t]));
                    let sum = scheduleDiff.reduce((a,b) => a+b);
                    difference = sum/24;
                }


                let d = new Date(schedules[i].time);
                let td = `
                        <td class="p-0">
                            <canvas class="m-2" id="tab2_`+user+`_`+i+`" ></canvas>
                            <p class="text-center"><small>`+d.getHours()+`:`+addZero(d.getMinutes())+`:`+addZero(d.getSeconds())+`</small></p>
                            <p class="text-center"><small>`+difference+`</small></p>
                        </td>`;
                lines[i] += td;
            }
        }
        schedulesPerUser[user] = schedules;


    }
    let schedulesBody = ``;


    for (let i in demandUpdates) {
        let dispAverage = "";
            let average;
        if (demandUpdates[i].difference.length>0) {
            average = demandUpdates[i].difference.reduce((a,b)=>a+b) / users.length;
            dispAverage = average.toString().substring(0,5);
        }
        lines[i] += `
                    <td><canvas id="tab2_aggregatedDemand_`+i+`" ></canvas></td>
                    <td>`+dispAverage+`</td>`;
    }

    for (let line of lines) {
        schedulesBody += `<tr>`+line+`</tr>`;
    }
    schedulesHead += `<th>Load</th><th>difference</th>`;

    html +=
        dayTable+`
        <table style="display: inline;" class="table table-sm m-3"><thead class="thead-light"> <tr>
            <thead>
                <tr>
                    <th class="text-center" colspan="`+users.length+`" scope="colgroup">Schedules</th>
                    <th class="text-center" colspan="2" scope="colgroup">Progress</th>
                </tr>
                <tr>
                    `+ schedulesHead +`
                </tr>
            </thead>
            <tbody>
                `+ schedulesBody +`
            </tbody>
        </table>`;


    table.innerHTML = html;
    for (let user of users) {
        for (let i in schedulesPerUser[user]) {
            addHistogram("tab2_"+user+"_"+i, schedulesPerUser[user][i].value);
        }
    }
    for (let i in demandUpdates) {
        addHistogram("tab2_aggregatedDemand_"+i, demandUpdates[i].value);
    }
}

function addZero(n) {
    return eval(n) < 10 ? '0'+n : ''+n;
}

function getDemandUpdates(date) {
    for (let demand of this.aggregatedDemand) {
        if (demand.date === date) {
            return demand.value;
        }
    }
    console.log("Error: no aggregated demand for this day");
    return null;
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

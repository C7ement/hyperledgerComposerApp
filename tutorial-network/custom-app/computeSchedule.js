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


let USER_COUNT = 3;
let selectedDate = '01/01';
Promise.all([
    userRegistry.init(),
    scheduleRegistry.init(),
    aggregatedDemandRegistry.init()])
    .then(() => {
        return Promise.all([
            newUser(["User0"]),
            newUser(["User1"]),
            newUser(["User2"])]);
    }, onRejected)
    .then(() => {
        return scheduleRegistry.removeAllSchedules();
    }, onRejected)
    .then(()=>{
        return aggregatedDemandRegistry.getAggregatedDemand(selectedDate);
    }, onRejected)
    .then((aggregatedDemand)=> {

        this.aggregatedDemand = aggregatedDemand;
        this.schedules = [];
        let promisesAddSchedule = [];
        for (let i=0; i<3; i++) {
            let schedule = [];
            schedule.length = 24;
            schedule.fill(0);
            this.schedules.push(schedule);
            promisesAddSchedule.push(scheduleRegistry.addSchedule("S_"+selectedDate+"_"+i, "User"+i, selectedDate, schedule));
        }
        return Promise.all(promisesAddSchedule);
    }, onRejected)
    .then(()=> {
        return new CsvFileManager().getDemandAllUsersOneDay(selectedDate);
    }, onRejected)
    .then(async (demand) => {
        let difference;
        do {
            let schedules;
            for (let user=0; user<3; user++ ) {
                schedules = await scheduleRegistry.getScheduleTable();
                let newSchedule = iterateGame(schedules, this.aggregatedDemand, 'User' + user, demand[user]);
                await scheduleRegistry.updateSchedule("S_" + selectedDate + "_" + user, newSchedule.value, newSchedule.s);
            }
            difference = schedules.data
                .map((s) => s.diffrenceWithPreviousSchedule)
                .reduce((a, b) => a + b) / schedules.data.length;
            console.log(difference);
        } while (difference > 0.001);
    },onRejected);


function iterateGame(schedules, aggregatedDemand, user, userDemand) {
    let number_of_households = schedules.data.length;
    let a_max = 5;
    let a_min = -7;
    let n_plus = 0.958;
    let n_minus = 0.958;
    let n_inv = 0.96;
    let s_plus_max = 13.5;

    if (number_of_households !== aggregatedDemand.participantCount) {
        return Promise.reject('Computeschedule.js iterateGame(): Error : wrong user count.')
    }
    let average_total_load_other_plus_demand = [];

    let newSchedule = {value: [], s: 0};
    for (let t=0; t<24; t++) {
        let total_schedule_other_t = 0;
        for (let s of schedules.data) {
            if (s.userId !== user) {
                total_schedule_other_t += s.value[t];
            } else {
                newSchedule.s = s.s_endOfDay;
            }
        }
        average_total_load_other_plus_demand.push((total_schedule_other_t + aggregatedDemand.value[t] - userDemand[t]) / (number_of_households-1) + userDemand[t]);
    }

    for (let t=0; t<24; t++) {
        let a_t = average_total_load_other_plus_demand
            .slice(t+1, 24)
            .reduce( (sum, value) => sum + value, 0); // sum the array from t+1 to T

        //a_t -= newSchedule.s;
        let tmp = 1-Math.pow(t/24,10);
        a_t -= newSchedule.s *tmp;


        a_t -= average_total_load_other_plus_demand[t]*(24-t-1);
        a_t = a_t / (24-t);

        if (a_t > a_max) {
            a_t = a_max;
        } else if (a_t < a_min) {
            a_t = a_min;
        }

        if ( a_t > 0) {
            let tmp = newSchedule.s + n_plus*n_inv*a_t;
            if (tmp > s_plus_max) {
                a_t = (s_plus_max - newSchedule.s) / (n_plus*n_inv);
                newSchedule.s = s_plus_max;
            } else {
                newSchedule.s = tmp;
            }
        } else {
            let tmp = newSchedule.s + a_t / (n_minus*n_inv);
            if (tmp < 0) {
                a_t = -newSchedule.s * n_minus*n_inv;
                newSchedule.s = 0;
            } else {
                newSchedule.s = tmp;
            }
        }
        //console.log('t: '+t+', s: '+newSchedule.s);
        newSchedule.value.push(a_t);
    }
    return newSchedule;
}

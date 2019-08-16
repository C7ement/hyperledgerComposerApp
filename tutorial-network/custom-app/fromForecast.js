const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

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
let aggregatedDemandRegistry = new AggregatedDemandRegistry();

const csv=require('csvtojson');

let demand = {}, schedules = [];
let selectedDate = '01/01';
Promise.all([
    userRegistry.init(),
    scheduleRegistry.init(),
    aggregatedDemandRegistry.init()])
    .then(() => {
        return Promise.all([
            userRegistry.removeAllUsers(),
            scheduleRegistry.removeAllSchedules(),
            aggregatedDemandRegistry.removeAllAggregatedDemand()]);
    }, onRejected)
    .then(() => {
        return Promise.all([
            newUser(["User0"]),
            newUser(["User1"]),
            newUser(["User2"])]);
    }, onRejected)
    .then(()=>{
        let promises = [];
        for (let i=0; i<3; i++) {
            promises.push(csv().fromFile('./data/forecast'+i+'.csv'));
        }
        return Promise.all(promises);
    }, onRejected)
    .then((promises)=> {
        for (let i in promises) {
            let jsonArray = promises[i];
            let demand_one_user_t, dateTime;
            for (let j in jsonArray) {
                demand_one_user_t = jsonArray[j]['Electricity:Facility [kW](Hourly)'];
                dateTime = jsonArray[j]['Date/Time'];
                let date = dateTime.substring(0, 5);
                if ( ! demand[date]) {
                    demand[date] = [];
                }
                if ( ! demand[date][i]) {
                    demand[date].push();
                }
                demand[date][i].push(eval(demand_one_user_t));
            }
        }
        let aggregatedDemand = {};
        //let promisesAddDemand = [];
        //for (let date in demand) {
            aggregatedDemand[selectedDate] = [];
            aggregatedDemand[selectedDate].length = 24;
            aggregatedDemand[selectedDate].fill(0);
            for (let user in demand[selectedDate]) {
                for (let t in demand[selectedDate][user]) {
                    aggregatedDemand[selectedDate][t] += demand[selectedDate][user][t];
                }
            }
            //promisesAddDemand.push(aggregatedDemandRegistry.addAggregatedDemand(date, "User"+i, date, schedule));
        //}
        return aggregatedDemandRegistry.addAggregatedDemand(selectedDate, aggregatedDemand[selectedDate], promises.length)
        //return Promise.all(promisesAddSchedule);
    }, onRejected)
    .then((promises)=> {

        let schedule = [];
        schedules = [];
        schedule.length = 24;
        schedule.fill(0);
        let promisesAddSchedule = [];
        for (let i=0; i<3; i++) {
            schedules.push(schedule);
            promisesAddSchedule.push(scheduleRegistry.addSchedule("S_"+selectedDate+"_"+i, "User"+i, selectedDate, schedules[i]));
        }
        return Promise.all(promisesAddSchedule);
    }, onRejected)
    .then(()=> {

        for (let i = 0, p = Promise.resolve(); i < 15; i++) {
            p = p.then(() => {
                schedules = iterateGame(schedules);
                let promisesUpdateSchedule = [];
                for (let schedule of schedules) {
                    promisesUpdateSchedule.push(scheduleRegistry.updateSchedule("S_"+selectedDate+"_"+i, schedule));
                }
                console.log('Update '+i);
                return Promise.all(promisesUpdateSchedule);
            }, onRejected);
        }
    }, onRejected);

function iterateGame(schedules) {
    let number_of_households = schedules.length; // cross check with demand.participantCount
    for (let schedule of schedules) {
        let average_total_load_other_plus_demand = [];
        for (let t=0; t<24; t++) {
            let total_load_other_t = 0;
            for (let other_household of data) {
                if (other_household !== household) {
                    total_load_other_t += other_household.forecast[t];
                    total_load_other_t += other_household.schedule[t];
                }
            }
            average_total_load_other_plus_demand.push(total_load_other_t / (number_of_households-1) + household.forecast[t]);
        }
        let schedule = [], s_t_n = 0;
        for (let t=0; t<24; t++) {
            let schedule_t = average_total_load_other_plus_demand
                .slice(t+1, 24)
                .reduce( (sum, value) => sum + value, 0); // sum the array from t+1 to T
            schedule_t -= s_t_n;
            schedule_t -= average_total_load_other_plus_demand[t]*(24-t-1);
            schedule_t = schedule_t / (24-t);
            schedule.push(schedule_t);
            s_t_n = s_t_n + schedule_t;
        }
        household.schedule = schedule;
    }
    return data;
}

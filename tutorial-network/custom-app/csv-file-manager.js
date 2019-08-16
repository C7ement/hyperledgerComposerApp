
const onRejected = function(err) {
    console.error('Promise rejected', err);
};

const csv=require('csvtojson');

let USER_COUNT = 3;

class CsvFileManager {


    constructor() {}

    getDemandAllUsersOneDay(selectedDate) {
        let promises = [];
        for (let i = 0; i < USER_COUNT; i++) {
            promises.push(csv().fromFile('./data/forecast' + i + '.csv'));
        }
        return Promise.all(promises)
            .then((promises) => {
                let demand = [];
                for (let i in promises) {
                    demand.push([]);
                    let jsonArray = promises[i];
                    let demand_one_user_t, dateTime;
                    for (let j in jsonArray) {
                        demand_one_user_t = jsonArray[j]['Electricity:Facility [kW](Hourly)'];
                        dateTime = jsonArray[j]['Date/Time'];
                        let date = dateTime.substring(0, 5);
                        if (date === selectedDate) {
                            demand[i].push(eval(demand_one_user_t));
                        }
                    }
                }
                return Promise.resolve(demand);
            }, onRejected);
    }

    getDemandOneUserOneDay(selectedDate, user) {
        return csv().fromFile('./data/forecast' + user + '.csv')
            .then((jsonArray) => {
                let demand = [];
                let demand_one_user_t, dateTime;
                for (let j in jsonArray) {
                    demand_one_user_t = jsonArray[j]['Electricity:Facility [kW](Hourly)'];
                    dateTime = jsonArray[j]['Date/Time'];
                    let date = dateTime.substring(0, 5);
                    if (date === selectedDate) {
                        demand.push(eval(demand_one_user_t));
                    }
                }

                return Promise.resolve(demand);
            }, onRejected);
    }
}
module.exports = CsvFileManager;

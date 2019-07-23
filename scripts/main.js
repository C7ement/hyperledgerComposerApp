const onResolved = function() { process.exit(0); };
const onRejected = function(err) {
    console.error('Promise rejected', err);
    process.exit(1);
};

var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs(['foo', 'bar'],
    function   (foo,   bar) {
        //foo and bar are loaded according to requirejs
        //config, but if not found, then node's require
        //is used to load the module.
    });


let userRegistry = new UserRegistry();
let scheduleRegistry = new ScheduleRegistry();
function myFunction() {
    requirejs(["schedule.js)"], function (schedule_registry) {
        schedule_registry.then(function () {
            return schedule_registry.addSchedule("sched0", "user0", [-10, 1.2, 7]);
        }, onRejected)
            .then(onResolved, onRejected);
    });
}

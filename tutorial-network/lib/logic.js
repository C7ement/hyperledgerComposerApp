/**
 * Schedule upddate processor function.
 * @param {org.example.biznet.ScheduleUpdate} schedUpdate the schedule update.
 * @transaction
 */
async function sampleTransaction(schedUpdate) {  // eslint-disable-line no-unused-vars
    let newSchedule = schedUpdate.newValue;
    let oldSchedule = schedUpdate.schedule.value;

    let differenceArray = oldSchedule.map( (s, t) => {
	return Math.abs(newSchedule[t]-oldSchedule[t])
	});
    let difference = differenceArray.reduce((a,b)=>a+b) / differenceArray.length;

    schedUpdate.schedule.value = newSchedule;
    schedUpdate.schedule.diffrenceWithPreviousSchedule = difference;
    schedUpdate.schedule.s_endOfDay = schedUpdate.s_endOfDay;

    let assetRegistry = await getAssetRegistry('org.example.biznet.Schedule');
    await assetRegistry.update(schedUpdate.schedule);
}



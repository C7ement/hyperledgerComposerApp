/**
 * Schedule upddate processor function.
 * @param {org.example.biznet.ScheduleUpdate} schedUpdate the schedule update.
 * @transaction
 */
async function sampleTransaction(schedUpdate) {  // eslint-disable-line no-unused-vars
    schedUpdate.schedule.value = schedUpdate.newValue;
    let assetRegistry = await getAssetRegistry('org.example.biznet.Schedule');
    await assetRegistry.update(schedUpdate.schedule);
}


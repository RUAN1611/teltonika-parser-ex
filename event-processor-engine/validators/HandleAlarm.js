class HandleAlarm {
    validate(telemetryValue, config = {}) {
        // AVL ID 236: Alarm indication (triggered by button press)
        // 0 = Reserved/No alarm
        // 1 = Alarm event occurred
        
        const isAlarmTriggered = telemetryValue === 1;
        
        if (isAlarmTriggered) {
            return {
                shouldTriggerEvent: true,
                reason: 'Alarm button pressed - emergency alert triggered',
                alarmActive: true
            };
        }
        
        return {
            shouldTriggerEvent: false,
            reason: 'No alarm - system normal',
            alarmActive: false
        };
    }
}

module.exports = HandleAlarm;
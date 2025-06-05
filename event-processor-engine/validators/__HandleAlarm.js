// Reviewed with Werner (Lynx Not Using This)

class HandleAlarm {
    validate(telemetryValue, previousTelemetryValue, label) {
        // AVL ID 236: Alarm indication (triggered by button press)
        // 0 = Reserved/No alarm
        // 1 = Alarm event occurred

        if(previousTelemetryValue === telemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'No change in alarm status',
            };
        }
        
        const isAlarmTriggered = telemetryValue === 1;
        
        if (isAlarmTriggered) {
            return {
                shouldTriggerEvent: true,
                reason: 'Alarm event occured',
                alarmActive: true
            };
        }
        
        return {
            shouldTriggerEvent: false,
            reason: 'Reserved',
            alarmActive: false
        };
    }
}

module.exports = HandleAlarm;
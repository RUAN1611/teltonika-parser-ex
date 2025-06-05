// Ask David

class HandleCrashData {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(previousTelemetryValue === telemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'No change in crash data status',
            };
        }
        if(telemetryValue >= 1 && telemetryValue <= 6) {
            return {
                shouldTriggerEvent: true,
                eventClassText: 'Impact',
                eventType: 'impact',
                eventTelemetry: label,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Crash Data status unknown',
            }
        }
    }
}

module.exports = HandleCrashData;
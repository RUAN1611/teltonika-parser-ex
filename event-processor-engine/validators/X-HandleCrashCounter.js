class HandleCrashCounter {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Crash Counter Event",
                eventType: "crash",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Crash counter',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Crash counter unknown',
            };
        }
    }
}

module.exports = HandleCrashCounter;
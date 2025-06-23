// https://wiki.teltonika-gps.com/view/FMB920_Teltonika_Data_Sending_Parameters_ID
// AVL ID 317
// Use the Crash Counter to not mix up crash events with other crash events
class HandleCrashCounter {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
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
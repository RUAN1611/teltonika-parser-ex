class HandleEyeProximityLost {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Eye Proximity Event",
                eventType: "lost",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Eye proximity is lost',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Eye proximity not lost',
            };
        }
    }
}

module.exports = HandleEyeProximityLost;

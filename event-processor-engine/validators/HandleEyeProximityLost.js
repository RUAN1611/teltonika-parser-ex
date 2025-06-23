class HandleEyeProximityLost {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
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

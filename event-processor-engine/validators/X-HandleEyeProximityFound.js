class HandleEyeProximityFound {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Eye Proximity Event",
                eventType: "found",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Eye proximity is found',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Eye proximity unknown',
            };
        }
    }
}

module.exports = HandleEyeProximityFound;

class HandleEyeProximityFarAway {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Eye Proximity Event",
                eventType: "far_away",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Eye proximity is far away',
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

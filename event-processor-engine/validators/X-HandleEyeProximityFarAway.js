class HandleEyeProximityFarAway {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'No change in eye proximity',
            };
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: true,
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

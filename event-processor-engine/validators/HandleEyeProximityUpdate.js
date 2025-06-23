class HandleEyeProximityUpdate {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Eye Proximity Event",
                eventType: "update",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Eye proximity value updated',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Eye proximity not updated',
            };
        }
    }
}

module.exports = HandleEyeProximityUpdate;

// Reviewed with Werner

class HandleOverspeed {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(previousTelemetryValue >= 0 && telemetryValue >= 0) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue >= 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Overspeed Event",
                eventType: "over_speeding",
                eventAdditionalTelemetryColumn: "over_speeding",
                eventTelemetry: label,
                eventValue: telemetryValue,
            }
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Overspeed status unknown',
            }
        }
    }
}

module.exports = HandleOverspeed;
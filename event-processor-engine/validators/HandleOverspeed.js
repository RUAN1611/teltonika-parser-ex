// Reviewed with Werner

class HandleOverspeed {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
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
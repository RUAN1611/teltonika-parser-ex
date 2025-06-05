// Reviewed with Werner

class HandleManDown {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue === null || telemetryValue === undefined) {
            return {
                shouldTriggerEvent: false,
                reason: 'Man down status unknown',
            };
        }
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Man Down Event",
                eventType: "deactivated",
                eventTelemetry: label,
                eventValue: telemetryValue,
                eventAdditionalTelemetryColumn: "man_down_status",
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Man Down Event",
                eventType: "activate",
                eventTelemetry: label,
                eventValue: telemetryValue,
                eventAdditionalTelemetryColumn: "man_down_status"
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Mandown status unknown',
            };
        }
    }
}

module.exports = HandleManDown;
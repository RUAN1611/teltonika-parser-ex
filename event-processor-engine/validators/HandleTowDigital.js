// Reviewed with Werner

const ValidatorConfig = require("../ValidatorConfig");

class HandleTowDigital {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Tow Event",
                eventType: "steady",
                eventTelemetry: label,
                reason: 'Vehicle steady - not being towed',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Tow Event",
                eventType: "towing",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.TOWING,
                eventValue: telemetryValue,
                reason: 'Vehicle being towed detected',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Tow status unknown',
            };
        }
    }
}

module.exports = HandleTowDigital;
// Reviewed with Werner
const ValidatorConfig = require("../ValidatorConfig");
class HandleManDown {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
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
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.MAN_DOWN_STATUS,
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Man Down Event",
                eventType: "activate",
                eventTelemetry: label,
                eventValue: telemetryValue,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.MAN_DOWN_STATUS,
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
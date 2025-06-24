const ValidatorConfig = require("../ValidatorConfig");

class HandleIgnition {
    validate(telemetryValue, label) {
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Ignition Event",
                eventType: "activate",
                eventTelemetry: label,
                eventValue: 1,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.IGNITION,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Ignition status unknown',
            };
        }
    }
}

module.exports = HandleIgnition;
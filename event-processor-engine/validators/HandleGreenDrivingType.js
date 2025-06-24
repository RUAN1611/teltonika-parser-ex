// Reviewed with Werner
// Done

const ValidatorConfig = require("../ValidatorConfig");

class HandleGreenDrivingType {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Harsh Acceleration",
                eventType: "harsh_accel",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.HARSH_ACCEL,
                eventValue: 1,
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Harsh Braking",
                eventType: "harsh_brake",
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.HARSH_BRAKE,
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Harsh Corner",
                eventType: "harsh_corner",
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.HARSH_CORNER,
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Green driving type ${telemetryValue} is within normal range`
            };
        }
    }
}


module.exports = HandleGreenDrivingType;
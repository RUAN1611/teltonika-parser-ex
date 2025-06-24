// Review HandleMovement with Werner
const ValidatorConfig = require("../ValidatorConfig");
class HandleMovement {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Motion Start",
                eventType: "motion_start",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.MOTION_START,
                eventValue: 1,
            };
        }
        else if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Motion End",
                eventType: "motion_end",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.MOTION_END,
                eventValue: 1,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Movement status unknown',
            };
        }
    }
}

module.exports = HandleMovement;
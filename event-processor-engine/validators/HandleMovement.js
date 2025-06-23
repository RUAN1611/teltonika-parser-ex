// Review HandleMovement with Werner

class HandleMovement {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Motion Start",
                eventType: "motion_start",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: "motion_start",
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Motion End",
                eventType: "motion_end",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: "motion_end",
                eventValue: telemetryValue,
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
class HandleMovement {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(previousTelemetryValue === 0 && telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Motion Start",
                eventType: "motion_start",
                eventTelemetry: label,
            };
        }
        else if(previousTelemetryValue === 1 && telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Motion End",
                eventType: "motion_end",
                eventTelemetry: label,
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
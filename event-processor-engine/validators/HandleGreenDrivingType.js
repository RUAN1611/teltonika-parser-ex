class HandleGreenDrivingType {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Harsh Acceleration",
                eventType: "harsh_accel",
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Harsh Braking",
                eventType: "harsh_brake",
                eventTelemetry: label,
                eventValue: 2,
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Harsh Corner",
                eventType: "harsh_corner",
                eventTelemetry: label,
                eventValue: 3,
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
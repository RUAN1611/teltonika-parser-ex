// Reviewed with Werner
// Done

class HandleGreenDrivingType {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(previousTelemetryValue === telemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Harsh Acceleration",
                eventType: "harsh_accel",
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: "harsh_accel",
                eventValue: 1,
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Harsh Braking",
                eventType: "harsh_brake",
                eventAdditionalTelemetryColumn: "harsh_brake",
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Harsh Corner",
                eventType: "harsh_corner",
                eventAdditionalTelemetryColumn: "harsh_corner",
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
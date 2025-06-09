// Reviewed with Werner

class HandleTripStatus {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Trip Event",
                eventType: "stop",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Trip stopped',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Trip Event",
                eventType: "start",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Trip started',
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Trip Event",
                eventType: "business_status",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Business trip',
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Trip Event",
                eventType: "private_status",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Private trip',
            };
        }
        else if(telemetryValue >= 4 && telemetryValue <= 9) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Trip Event",
                eventType: "custom_status",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Custom trip',
            };
        }
        else  {
            return {
                shouldTriggerEvent: false,
                reason: 'Trip status unknown',
            };
        }
    }
}

module.exports = HandleTripStatus;
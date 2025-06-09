// Reviewed with Werner

class HandleUnplugStatus {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(previousTelemetryValue === telemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: 'Power Disconnect',
                eventType: 'power_disconnect',
                eventAdditionalTelemetryColumn: "power_disconnect",
                eventValue: telemetryValue,
                eventTelemetry: label,
            };
        }
        else if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: false, // No need to trigger event for power reconnect
                eventClassText: 'Power Reconnect',
                eventType: 'power_reconnect',
                eventValue: telemetryValue,
                eventTelemetry: label,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Power status unknown',
            };
        }
    }
}

module.exports = HandleUnplugStatus;
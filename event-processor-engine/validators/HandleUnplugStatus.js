class HandleUnplugStatus {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(previousTelemetryValue === telemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue === 0 && previousTelemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: 'Power Disconnect',
                eventType: 'power_disconnect',
                eventTelemetry: label,
            };
        }
        else if(telemetryValue === 1 && previousTelemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: 'Power Reconnect',
                eventType: 'power_reconnect',
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
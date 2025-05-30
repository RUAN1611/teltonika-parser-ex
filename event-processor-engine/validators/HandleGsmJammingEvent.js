class HandleGsmJammingEvent {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Gsm Jammed",
                eventType: "gsm_jammed_stop",
                eventTelemetry: label,
                eventValue: 0,
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Gsm Jammed",
                eventType: "gsm_jammed",
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Jamming status unknown',
            };
        }
    }
}

module.exports = HandleGsmJammingEvent;
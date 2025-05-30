class SignalLowEvent {
    validate(telemetryValue, previousTelemetryValue, label) {
        const threshold = 1;
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
            };
        }
        if(telemetryValue == 5) { // Temporary field for testing
            return {
                shouldTriggerEvent: true,
                eventClassText: "Signal High Event",
                eventType: "gsm_signal_high",
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        return {
            shouldTriggerEvent: telemetryValue <= threshold,
            eventClassText: "Signal Low Event",
            eventType: "gsm_signal_low",
            eventTelemetry: label,
            eventValue: 1,
        };
    }
}

module.exports = SignalLowEvent;
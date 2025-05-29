class SignalLowEvent {
    validate(telemetryValue, previousTelemetryValue) {
        const threshold = 1;
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
            };
        }
        if(telemetryValue == 5) { // Temporary field for testing
            return {
                shouldTriggerEvent: true,
                gsm_signal_high: 1,
            };
        }
        return {
            shouldTriggerEvent: telemetryValue <= threshold,
            gsm_signal_low: 1,
        };
    }
}

module.exports = SignalLowEvent;
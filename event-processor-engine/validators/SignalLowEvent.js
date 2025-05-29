class SignalLowEvent {
    validate(telemetryValue, previousTelemetryValue) {
        const threshold = 1;
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
            };
        }
        return {
            shouldTriggerEvent: telemetryValue <= threshold,
            gsm_signal_low: 1,
        };
    }
}

module.exports = SignalLowEvent;
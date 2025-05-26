class SignalLowEvent {
    validate(telemetryValue, config) {
        const threshold = config.threshold || 20;
        return {
            shouldTriggerEvent: telemetryValue < threshold,
            reason: `Signal strength ${telemetryValue} is below threshold ${threshold}`,
        };
    }
}

module.exports = SignalLowEvent;
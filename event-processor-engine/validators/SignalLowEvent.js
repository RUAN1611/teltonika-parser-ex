class SignalLowEvent {
    validate(telemetryValue) {
        const threshold = 1;
        return {
            shouldTriggerEvent: telemetryValue <= threshold,
            reason: `Signal strength ${telemetryValue} is below threshold ${threshold}`,
        };
    }
}

module.exports = SignalLowEvent;
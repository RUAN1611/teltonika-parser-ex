class HandleGsmJammingEvent {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Jamming Stop',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Jamming Start',
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
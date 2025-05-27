class HandleTowDigital {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Steady',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Towing',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Tow status unknown',
            };
        }
    }
}

module.exports = HandleTowDigital;
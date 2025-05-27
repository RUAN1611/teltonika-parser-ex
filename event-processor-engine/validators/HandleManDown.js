class HandleManDown {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Mandown Deactivated',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Mandown Activated',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Mandown status unknown',
            };
        }
    }
}

module.exports = HandleManDown;
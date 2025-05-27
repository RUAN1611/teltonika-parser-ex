class HandleMovement {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Movement Off',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Movement On',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Movement status unknown',
            };
        }
    }
}

module.exports = HandleMovement;
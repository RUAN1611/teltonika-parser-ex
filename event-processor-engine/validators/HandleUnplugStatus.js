class HandleUnplugStatus {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Battery Present',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Battery Unplugged',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Battery status unknown',
            };
        }
    }
}

module.exports = HandleUnplugStatus;
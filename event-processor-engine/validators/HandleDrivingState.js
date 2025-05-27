class HandleDrivingState {
    validate(telemetryValue) {
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Ignition ON',
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: true,
                reason: 'Driving',
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: true,
                reason: 'Ignition OFF',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Driving state ${telemetryValue} is within normal range`
            };
        }
    }
}

module.exports = HandleDrivingState;
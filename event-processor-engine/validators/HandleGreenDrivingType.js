class HandleGreenDrivingType {
    validate(telemetryValue) {
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Harsh acceleration',
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: true,
                reason: 'Harsh braking',
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: true,
                reason: 'Harsh cornering',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Green driving type ${telemetryValue} is within normal range`
            };
        }
    }
}


module.exports = HandleGreenDrivingType;
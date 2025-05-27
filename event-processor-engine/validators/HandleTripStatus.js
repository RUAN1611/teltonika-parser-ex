class HandleTripStatus {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Trip Stop',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Trip Start',
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: true,
                reason: 'Business Status',
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: true,
                reason: 'Private Status',
            };
        }
        else if(telemetryValue >= 4 && telemetryValue <= 9) {
            return {
                shouldTriggerEvent: true,
                reason: 'Custom Status',
            };
        }
        else  {
            return {
                shouldTriggerEvent: false,
                reason: 'Trip status unknown',
            };
        }
    }
}

module.exports = HandleTripStatus;
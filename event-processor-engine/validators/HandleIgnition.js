class HandleIgnition {
    validate(telemetryValue, previousTelemetryValue) {
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'Ignition status unchanged',
            };
        }
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Ignition Off',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Ignition On',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Ignition status unknown',
            };
        }
    }
}

module.exports = HandleIgnition;
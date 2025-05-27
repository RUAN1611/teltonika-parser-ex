class HandleDallasTemperature4B {
    validate(telemetryValue) {
        if(telemetryValue === 850) {
            return {
                shouldTriggerEvent: true,
                reason: 'Sensor not ready',
            };
        }
        else if(telemetryValue === 2000) {
            return {
                shouldTriggerEvent: true,
                reason: 'Value read error',
            };
        }
        else if(telemetryValue === 3000) {
            return {
                shouldTriggerEvent: true,
                reason: 'Not connected',
            };
        }
        else if(telemetryValue === 4000) {
            return {
                shouldTriggerEvent: true,
                reason: 'ID failed',
            };
        }
        else if(telemetryValue === 5000) {
            return {
                shouldTriggerEvent: true,
                reason: 'Sensor not ready',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Temperature ${telemetryValue} is within normal range`
            };
        }
    }
}

module.exports = HandleDallasTemperature4B;

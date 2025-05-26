class HandleBleHumidity {
    validate(telemetryValue) {
        if(telemetryValue === 65535) {
            return {
                shouldTriggerEvent: true,
                reason: 'BLE humidity sensor not found or disconnected',
                sensorStatus: 'disconnected'
            };
        }
        if(telemetryValue === 65534) {
            return {
                shouldTriggerEvent: true,
                reason: 'BLE humidity sensor failed data parsing',
                sensorStatus: 'error'
            };
        }
        if(telemetryValue === 65533) {
            return {
                shouldTriggerEvent: true,
                reason: 'BLE humidity sensor abnormal sensor state',
                sensorStatus: 'error'
            };
        }
        return {
            shouldTriggerEvent: false,
            reason: `Humidity ${telemetryValue} is within normal range`
        };
    }
}

module.exports = HandleBleHumidity;
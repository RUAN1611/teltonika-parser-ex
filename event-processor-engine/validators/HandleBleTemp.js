class HandleBleTemp {
    validate(telemetryValue) {
        // BLE temperature sensors report in SignedHundredth format
        // Range: -40°C to +125°C (per Teltonika documentation)
        const temperature = telemetryValue / 100; // Convert from hundredths to actual temperature
        
        // Temperature thresholds based on Teltonika specifications
        const minThreshold = -35; // Alert below -35°C
        const maxThreshold = 60;  // Alert above 60°C
        
        // Check for sensor error (32767 means "sensor not found")
        if (telemetryValue === 32767) {
            return {
                shouldTriggerEvent: true,
                reason: 'BLE temperature sensor not found or disconnected',
                sensorStatus: 'disconnected',
                temperatureCelsius: null
            };
        }
        
        // Determine if temperature is outside normal range
        let shouldTriggerEvent = false;
        let reason = `Temperature ${temperature}°C is within normal range`;
        
        if (temperature <= minThreshold || temperature >= maxThreshold) {
            shouldTriggerEvent = true;
            reason = `Temperature alert: ${temperature}°C is ${temperature <= minThreshold ? 'below' : 'above'} ${temperature <= minThreshold ? minThreshold : maxThreshold}°C threshold`;
        }
        
        return {
            shouldTriggerEvent,
            reason,
            sensorStatus: 'connected',
            temperatureCelsius: temperature,
            thresholds: {
                minThreshold,
                maxThreshold
            }
        };
    }
}

module.exports = HandleBleTemp;
class HandleBleTemp {
    validate(telemetryValue, config = {}) {
        // BLE temperature sensors report in SignedHundredth format
        // Range: -40°C to +125°C (per Teltonika documentation)
        const temperature = telemetryValue / 100; // Convert from hundredths to actual temperature
        
        // Default temperature thresholds based on Teltonika specifications
        const minThreshold = config.minThreshold || -35; // Alert below -35°C
        const maxThreshold = config.maxThreshold || 60;  // Alert above 60°C
        const criticalMin = config.criticalMin || -39;   // Critical below -39°C
        const criticalMax = config.criticalMax || 120;   // Critical above 120°C
        
        // Check for sensor error (32767 means "sensor not found")
        if (telemetryValue === 32767) {
            return {
                shouldTriggerEvent: true,
                reason: 'BLE temperature sensor not found or disconnected',
                sensorStatus: 'disconnected',
                temperatureCelsius: null
            };
        }
        
        // Determine severity level
        let shouldTriggerEvent = false;
        let reason = `Temperature ${temperature}°C is within normal range`;
        
        if (temperature <= criticalMin || temperature >= criticalMax) {
            shouldTriggerEvent = true;
            reason = `Critical temperature alert: ${temperature}°C is ${temperature <= criticalMin ? 'below' : 'above'} ${temperature <= criticalMin ? criticalMin : criticalMax}°C threshold`;
        } else if (temperature <= minThreshold || temperature >= maxThreshold) {
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
                maxThreshold,
                criticalMin,
                criticalMax
            }
        };
    }
}

module.exports = HandleBleTemp;
class HandleBleTemp {
    validate(telemetryValue) {
        const temperature = telemetryValue / 100; // Convert from hundredths to actual temperature
        if (telemetryValue === 32767) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "BLE Temperature Sensor Event",
                eventType: "ble_temperature_disconnected",
                eventTelemetry: label,
                eventValue: telemetryValue,
                removeTelemetry: true
            };
        }
    }
}

module.exports = HandleBleTemp;
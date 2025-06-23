class HandleBleHumidity {
    validate(telemetryValue, label) {
        if(telemetryValue == 32735 ||telemetryValue === 65535) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "BLE Humidity Sensor Event",
                eventType: "ble_humidity_disconnected",
                eventTelemetry: label,
                eventValue: telemetryValue,
                removeTelemetry: true
            };
        }
        if(telemetryValue == 32734 ||telemetryValue === 65534) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "BLE Humidity Sensor Event",
                eventType: "ble_humidity_parse_error",
                eventTelemetry: label,
                eventValue: telemetryValue,
                removeTelemetry: true
            };
        }
        if(telemetryValue == 32733 || telemetryValue === 65533) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "BLE Humidity Sensor Event",
                eventType: "ble_humidity_abnormal_state",
                eventTelemetry: label,
                eventValue: telemetryValue,
                removeTelemetry: true
            };
        }
        return {
            shouldTriggerEvent: false,
            reason: `Humidity ${telemetryValue} is within normal range`
        };
    }
}

module.exports = HandleBleHumidity;
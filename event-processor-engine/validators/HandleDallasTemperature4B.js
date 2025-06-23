class HandleDallasTemperature4B {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = false;
        if(telemetryValue === 2000 || telemetryValue === 32766) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Dallas Temperature Event",
                eventType: "failed_sensor_data_parsing",
                eventTelemetry: label,
                eventValue: "failed_sensor_data_parsing",
                removeTelemetry: true
            };
        }
        else if(telemetryValue === 3000 || telemetryValue === 32767) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Dallas Temperature Event",
                eventType: "sensor_not_found",
                eventTelemetry: label,
                eventValue: telemetryValue,
                removeTelemetry: true
            };
        }
        else if(telemetryValue === 4000 || telemetryValue === 32765) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Dallas Temperature Event",
                eventType: "abnormal_sensor_state",
                eventTelemetry: label,
                eventValue: telemetryValue,
                removeTelemetry: true
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

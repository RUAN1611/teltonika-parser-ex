// https://wiki.teltonika-gps.com/view/FMB930_Teltonika_Data_Sending_Parameters_ID - ID: 25
// To be Reviewed with Werner  again


class HandleDallasTemperature4B {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = false;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = true;
            // return {
            //     shouldTriggerEvent: false,
            //     reason: 'No change in temperature',
            // };
        }
        if(telemetryValue === 2000 || telemetryValue === 32766) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Dallas Temperature Event",
                eventType: "failed_sensor_data_parsing",
                eventTelemetry: label,
                eventValue: "failed_sensor_data_parsing",
            };
        }
        else if(telemetryValue === 3000 || telemetryValue === 32767) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Dallas Temperature Event",
                eventType: "sensor_not_found",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 4000 || telemetryValue === 32765) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Dallas Temperature Event",
                eventType: "abnormal_sensor_state",
                eventTelemetry: label,
                eventValue: telemetryValue,
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

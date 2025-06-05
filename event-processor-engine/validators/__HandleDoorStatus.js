// https://wiki.teltonika-gps.com/view/FMB930_Teltonika_Data_Sending_Parameters_ID - ID: 90

class HandleDoorStatus {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(previousTelemetryValue === telemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'No change in door status',
            };
        }
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "all_doors_closed",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 256) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "front_left_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 512) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "front_right_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 1024) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "rear_left_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 2048) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "rear_right_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 4096) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "hood_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 8192) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "trunk_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 16128) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "all_doors_opened_or_combination",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Door status ${telemetryValue} is within normal range`
            };
        }
    }
}

module.exports = HandleDoorStatus;
// https://wiki.teltonika-gps.com/view/FMB930_Teltonika_Data_Sending_Parameters_ID - ID: 283
// NOT APPLICABLE

class HandleDrivingState {
    validate(telemetryValue, label) {
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Driving State Event",
                eventType: "ignition_on",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Driving State Event",
                eventType: "driving",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Driving State Event",
                eventType: "ignition_off",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Driving state ${telemetryValue} is within normal range`
            };
        }
    }
}

module.exports = HandleDrivingState;
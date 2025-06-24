// https://wiki.teltonika-gps.com/view/FMB920_Teltonika_Data_Sending_Parameters_ID
// AVL ID 247
const ValidatorConfig = require("../ValidatorConfig");

class HandleCrashData {
    validate(telemetryValue, label) {
        if(telemetryValue >= 1 && telemetryValue <= 6) {
            return {
                shouldTriggerEvent: true,
                eventClassText: 'Impact',
                eventType: 'impact',
                eventTelemetry: label,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.IMPACT,
                eventValue: telemetryValue,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Crash Data status unknown',
            }
        }
    }
}

module.exports = HandleCrashData;
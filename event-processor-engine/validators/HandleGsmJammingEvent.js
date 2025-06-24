// https://wiki.teltonika-gps.com/view/FMB140_Teltonika_Data_Sending_Parameters_ID - ID: 249
// Reviewed with Werner

const ValidatorConfig = require("../ValidatorConfig");

class HandleGsmJammingEvent {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Gsm Jammed",
                eventType: "gsm_jammed_stop",
                eventTelemetry: label,
                eventValue: 0,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.GSM_JAMMED,
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Gsm Jammed",
                eventType: "gsm_jammed_start",
                eventTelemetry: label,
                eventValue: 1,
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.GSM_JAMMED,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Jamming status unknown',
            };
        }
    }
}

module.exports = HandleGsmJammingEvent;
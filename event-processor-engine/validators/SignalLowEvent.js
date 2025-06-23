// Reviewed with Werner
const ValidatorConfig = require("../ValidatorConfig");
class SignalLowEvent {
    validate(telemetryValue, label) {
        const threshold = 0;
        let shouldTriggerEvent = true;
        if(telemetryValue <= threshold) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Signal Low Event",
                eventType: "gsm_signal_low",
                eventTelemetry: label, 
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.GSM_SIGNAL_LOW,
                eventValue: 1,
            };
        }
        return {
            shouldTriggerEvent: false,
        }
    }
}

module.exports = SignalLowEvent;
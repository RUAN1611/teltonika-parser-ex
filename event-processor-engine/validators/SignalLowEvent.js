// Reviewed with Werner
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
                eventAdditionalTelemetryColumn: "gms_signal_low", // TODO: We need to add a new telemetry column to the data "gsm_signal_low = 1 & null"
                eventValue:  telemetryValue,
            };
        }
        return {
            shouldTriggerEvent: false,
        }
    }
}

module.exports = SignalLowEvent;
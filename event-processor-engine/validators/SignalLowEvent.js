// Reviewed with Werner
class SignalLowEvent {
    validate(telemetryValue, previousTelemetryValue, label) {
        const threshold = 0;
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        return {
            shouldTriggerEvent: telemetryValue <= threshold,
            eventClassText: "Signal Low Event",
            eventType: "gsm_signal_low",
            eventTelemetry: label, 
            eventAdditionalTelemetryColumn: "gms_signal_low", // TODO: We need to add a new telemetry column to the data "gsm_signal_low = 1 & null"
            eventValue:  telemetryValue <= threshold ? 1 : null,
        };
    }
}

module.exports = SignalLowEvent;
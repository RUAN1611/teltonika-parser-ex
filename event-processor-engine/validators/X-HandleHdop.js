/**
 * HandleHdop Event Validator
 * 
 * HDOP (Horizontal Dilution of Precision) is a measure of GPS positioning accuracy.
 * Lower values indicate better precision, higher values indicate worse precision.
 */

class HandleHdop {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "HDOP Event Triggered",
                eventType: "hdop",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'HDOP Event Triggered',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'HDOP unknown',
            };
        }

    }
}

module.exports = HandleHdop;

/**
 * HandleHdop Event Validator
 * 
 * HDOP (Horizontal Dilution of Precision) is a measure of GPS positioning accuracy.
 * Lower values indicate better precision, higher values indicate worse precision.
 */

class HandleHdop {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;

        let hdop = telemetryValue / 10;

        if(hdop !== null && hdop !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "HDOP Event Triggered",
                eventType: "hdop",
                eventTelemetry: label,
                eventValue: hdop,
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

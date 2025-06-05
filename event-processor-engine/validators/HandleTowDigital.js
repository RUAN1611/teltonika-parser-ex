class HandleTowDigital {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Tow Event",
                eventType: "steady",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Vehicle steady - not being towed',
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Tow Event",
                eventType: "towing",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Vehicle being towed detected',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Tow status unknown',
            };
        }
    }
}

module.exports = HandleTowDigital;
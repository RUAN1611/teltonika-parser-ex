class HandleIgnition {
    validate(telemetryValue, previousTelemetryValue, label) {
        console.log('HandleIgnition.validate called');
        console.log('telemetryValue:', telemetryValue);
        console.log('previousTelemetryValue:', previousTelemetryValue);
        console.log('label:', label);
        console.log('Values are equal:', telemetryValue === previousTelemetryValue);
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'Ignition status unchanged',
            };
        }
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Ignition Event",
                eventType: "deactivate",
                eventTelemetry: label,
                eventValue: 0,
            };
        }
        else if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Ignition Event",
                eventType: "activate",
                eventTelemetry: label,
                eventValue: 1,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Ignition status unknown',
            };
        }
    }
}

module.exports = HandleIgnition;
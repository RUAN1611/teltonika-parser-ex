class HandleOverspeed {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(previousTelemetryValue === 0 && telemetryValue > 0) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Overspeed Event",
                eventType: "start",
                eventTelemetry: label,
            }
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Overspeed status unknown',
            }
        }
    }
}

module.exports = HandleOverspeed;
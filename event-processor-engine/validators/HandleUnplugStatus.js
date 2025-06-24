// Reviewed with Werner

const ValidatorConfig = require("../ValidatorConfig");

class HandleUnplugStatus {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: 'Power Disconnect',
                eventType: 'power_disconnect',
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.POWER_DISCONNECT,
                eventValue: telemetryValue,
                eventTelemetry: label,
            };
        }
        else if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: false, // No need to trigger event for power reconnect
                eventClassText: 'Power Reconnect',
                eventType: 'power_reconnect',
                eventAdditionalTelemetryColumn: ValidatorConfig.Events.POWER_RECONNECT,
                eventValue: 1,
                eventTelemetry: label,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Power status unknown',
            };
        }
    }
}

module.exports = HandleUnplugStatus;
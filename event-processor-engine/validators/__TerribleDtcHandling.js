// https://wiki.teltonika-gps.com/view/FMB_lvcanfaultcodes

class TerribleDtcHandling {
    constructor() {
        this.faultCodeMappings = require('../parsed_fault_codes');
    }

    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined && telemetryValue !== "" && telemetryValue !== "0") {
            const description = this.faultCodeMappings[telemetryValue] || `Unknown fault code: ${telemetryValue}`;
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "DTC Fault Codes",
                eventType: "dtc_fault_codes",
                eventTelemetry: label,
                eventValue: telemetryValue,
                eventDescription: description,
            }
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'No DTC fault codes present',
            }
        }
    }
}

module.exports = TerribleDtcHandling;
// https://wiki.teltonika-gps.com/view/FMB_lvcanfaultcodes
// All we do is take value and put into DTC without any processing

class TerribleDtcHandling {
    constructor() {
        this.faultCodeMappings = require('../parsed_fault_codes');
    }

    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
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
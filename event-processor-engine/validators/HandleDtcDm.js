// https://embeddedflakes.com/j1939-diagnostics-part-1/
// https://www.scania.com/content/dam/scanianoe/market/au/products-and-services/engines/electrical-system/Fault-codes-DM1_Issue-6.pdf
// https://felixequipment.com/Documents/Suspect-Parameter-Numbers-SPN-Codes.pdf

/**
 * DTC DM1 and DM2 Event Handler for Teltonika FMB640 FMS Elements
 * 
 * DTC DM1 (ID: 10493) - Active Diagnostic Trouble Codes
 * DTC DM2 (ID: 10495) - Previously Active Diagnostic Trouble Codes  
 * DTC Time DM1 (ID: 10494) - Timestamp for DM1 events (seconds)
 * DTC Time DM2 (ID: 10496) - Timestamp for DM2 events (seconds)
 * 
 * Size: 4 bytes (Unsigned), Range: 0 to 4294967295
 * Reference: Scania CV AB 2016 - Fault codes DM1 Industrial & Marine Engines
 */

// Reviewed with Werner

class HandleDtcDm {
    constructor() {
        // Load comprehensive J1939 SPN and FMI mappings from external file
        const j1939Mappings = require('../parsed_j1939_spn_codes');
        this.spnMappings = j1939Mappings.spnMappings;
        this.fmiMappings = j1939Mappings.fmiMappings;
    }

    /**
     * Parse DTC value to get readable description
     */
    parseDtcDescription(dtcValue) {
        if (dtcValue === 0) return "No DTC";
        
        // Extract SPN and FMI from 32-bit value
        const spn = (dtcValue >> 8) & 0x7FFFF;
        const fmi = (dtcValue >> 5) & 0x1F;
        
        const spnDesc = this.spnMappings[spn] || `SPN ${spn}`;
        const fmiDesc = this.fmiMappings[fmi] || `FMI ${fmi}`;
        
        return `${spnDesc} - ${fmiDesc}`;
    }

    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        
        // Handle null/undefined values
        if (telemetryValue === null || telemetryValue === undefined) {
            return {
                shouldTriggerEvent: false,
                reason: 'No DTC value provided'
            };
        }

        // Convert to number if needed
        const dtcValue = typeof telemetryValue === 'string' ? parseInt(telemetryValue, 10) : telemetryValue;

        // DTC cleared (was active, now 0)
        if (dtcValue === 0) {
            const clearedDesc = this.parseDtcDescription(telemetryValue);
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: `DTC Cleared: ${clearedDesc}`,
                eventType: label.includes('dm1') ? "dtc_dm1_cleared" : "dtc_dm2_cleared",
                eventTelemetry: label,
            };
        }
        // New DTC detected (was 0, now active)
        else if (dtcValue > 0) {
            const activeDesc = this.parseDtcDescription(dtcValue); // Parse Previous Telemetry Value
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: label.includes('dm1') ? `Active DTC: ${activeDesc}` : `Historic DTC: ${activeDesc}`,
                eventType: label.includes('dm1') ? "dtc_dm1_active" : "dtc_dm2_historic", 
                eventTelemetry: label,
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'DTC status unchanged or no active DTC'
            };
        }
    }
}

module.exports = HandleDtcDm;



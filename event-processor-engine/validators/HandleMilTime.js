/**
 * Parameter: can.mil.time
 * Type: number
 * Unit: hours
 * Description: Time run with malfunction indicator lamp activated, read from CAN
 * AVL ID: 54
 * Source: https://flespi.com/devices/teltonika-fmc130#parameters
 * Source: https://wiki.teltonika-gps.com/view/FMB140_Teltonika_Data_Sending_Parameters_ID
 * The ACTUAL UNIT IS MINUTES, NOT HOURS! Flespi shows it as hours, but it's actually minutes according to the Teltonika documentation.
 */

// Helper Function to Convert Mil Status to Digital
// mil_status = 0 or 1 as additional column

class HandleMilTime {
    validate(telemetryValue, label) {
        // MIL Time represents the duration (in minutes) that the Malfunction Indicator Lamp 
        // (Check Engine Light) has been illuminated since the fault was detected

        let shouldTriggerEvent = true;
        
        // Handle invalid or null values
        if (telemetryValue === null || telemetryValue === undefined) {
            shouldTriggerEvent = false;
        }

        // Convert to number if it's a string
        const milTimeMinutes = typeof telemetryValue === 'string' ? 
            parseInt(telemetryValue, 10) : telemetryValue;

        // Validate that it's a valid number
        if (isNaN(milTimeMinutes)) {
            shouldTriggerEvent = false;
        }

        // MIL time of 0 means no active faults (Check Engine Light is off)
        if (milTimeMinutes === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "MIL Event",
                eventType: "deactivate",
                eventTelemetry: label,
                eventValue: 0,
                eventAdditionalTelemetryColumn: "mil_status",
                reason: 'Malfunction Indicator Lamp is off - no active faults'
            };
        }

        // Check Engine Light is active - report the duration
        const durationHours = Math.round((milTimeMinutes / 60) * 10) / 10;
        
        return {
            shouldTriggerEvent: shouldTriggerEvent,
            eventClassText: "MIL Event",
            eventType: "activate",
            eventTelemetry: label,
            eventValue: 1,
            eventAdditionalTelemetryColumn: "mil_status",
            reason: `Check Engine Light has been on for ${milTimeMinutes} minutes (${durationHours} hours)`
        };
    }
}

module.exports = HandleMilTime;
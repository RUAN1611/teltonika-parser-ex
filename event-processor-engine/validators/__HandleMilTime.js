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

class HandleMilTime {
    validate(telemetryValue, previousTelemetryValue, label) {
        // MIL Time represents the duration (in minutes) that the Malfunction Indicator Lamp 
        // (Check Engine Light) has been illuminated since the fault was detected

        let shouldTriggerEvent = true;
        
        // Handle invalid or null values
        if (telemetryValue === null || telemetryValue === undefined) {
            shouldTriggerEvent = false;
        }

        // Check if there's a significant change from previous value
        if (telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }

        // Convert to number if it's a string
        const milTimeMinutes = typeof telemetryValue === 'string' ? 
            parseInt(telemetryValue, 10) : telemetryValue;

        // Validate that it's a valid number and within range (0-65535)
        if (isNaN(milTimeMinutes) || milTimeMinutes < 0 || milTimeMinutes > 65535) {
            shouldTriggerEvent = false;
        }

        // MIL time of 0 means no active faults (Check Engine Light is off)
        if (milTimeMinutes === 0) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "MIL Event",
                eventType: "deactivate",
                eventTelemetry: label,
                eventValue: telemetryValue,
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
            eventValue: telemetryValue,
            reason: `Check Engine Light has been on for ${milTimeMinutes} minutes (${durationHours} hours)`
        };

        /*
         * Example:
         * MIL time value: 150 minutes
         * Converted: 150 ÷ 60 = 2.5 hours
         * Message: "Check Engine Light has been on for 150 minutes (2.5 hours)"
         */
    }
}

module.exports = HandleMilTime;
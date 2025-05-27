class HandleMilTime {
    validate(telemetryValue) {
        // MIL Time represents the duration (in minutes) that the Malfunction Indicator Lamp 
        // (Check Engine Light) has been illuminated since the fault was detected
        
        // Handle invalid or null values
        if (telemetryValue === null || telemetryValue === undefined) {
            return {
                shouldTriggerEvent: false,
                reason: 'MIL time value is null or undefined'
            };
        }

        // Convert to number if it's a string
        const milTimeMinutes = typeof telemetryValue === 'string' ? 
            parseInt(telemetryValue, 10) : telemetryValue;

        // Validate that it's a valid number
        if (isNaN(milTimeMinutes) || milTimeMinutes < 0) {
            return {
                shouldTriggerEvent: false,
                reason: 'Invalid MIL time value'
            };
        }

        // MIL time of 0 means no active faults (Check Engine Light is off)
        if (milTimeMinutes === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'Malfunction Indicator Lamp is off - no active faults',
                durationMinutes: 0
            };
        }

        // Check Engine Light is active - report the duration
        const durationHours = Math.round((milTimeMinutes / 60) * 10) / 10;
        
        return {
            shouldTriggerEvent: true,
            reason: `Check Engine Light has been on for ${milTimeMinutes} minutes (${durationHours} hours)`,
            durationMinutes: milTimeMinutes,
            durationHours: durationHours
        };
    }
}

module.exports = HandleMilTime;
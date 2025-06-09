class HandleTimeStamp {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Timestamp",
                eventType: "timestamp",
                eventTelemetry: label,
                eventValue: this.formatTimestamp(telemetryValue),
                rawTimestamp: telemetryValue,
            }
        }
        else {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
            }
        }
    }

    formatTimestamp(timestamp) {
        try {
            // Handle null/undefined
            if (timestamp === null || timestamp === undefined) {
                return null;
            }

            // Convert to number if it's a string
            let numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
            
            // Validate it's a number
            if (isNaN(numericTimestamp)) {
                console.warn('Invalid timestamp value:', timestamp);
                return String(timestamp); // Return original value as fallback
            }

            // Handle different timestamp formats
            let timestampMs;
            
            // If timestamp is in seconds (10 digits) - convert to milliseconds
            if (numericTimestamp < 10000000000) {
                timestampMs = numericTimestamp * 1000;
            }
            // If timestamp is already in milliseconds (13 digits)
            else {
                timestampMs = numericTimestamp;
            }

            const date = new Date(timestampMs);
            
            // Validate the date is reasonable (between 1970 and 2100)
            if (date.getFullYear() < 1970 || date.getFullYear() > 2100) {
                console.warn('Timestamp outside reasonable range:', timestamp);
                return String(timestamp);
            }

            return date.toISOString();
        } catch (error) {
            console.warn('Failed to format timestamp:', error);
            return String(timestamp); // Return original value as fallback
        }
    }
}

module.exports = HandleTimeStamp;

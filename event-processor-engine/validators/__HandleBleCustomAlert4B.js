/**
 * Summary of Usage:
 * ✅ Use HandleBleCustomAlert4B for:
 * - BLE Custom #2-5 (IO IDs: 463-478) - 4-byte UNSIGNED LONG INT values
 * - Temperature readings, counters, sensor values that fit in 32-bit integers
 * - Values between 0 and 4,294,967,295
 */

class HandleBleCustomAlert4B {
    validate(telemetryValue, previousTelemetryValue, label) {
        if(telemetryValue === previousTelemetryValue) {
            return {
                shouldTriggerEvent: false,
                reason: 'No change in BLE custom alert',
            };
        }
        
        // Validate for 4-byte unsigned integer (0 to 4294967295)
        if(telemetryValue !== null && telemetryValue !== undefined) {
            // Convert to number if it's a string
            const numValue = typeof telemetryValue === 'string' ? parseInt(telemetryValue, 10) : telemetryValue;
            
            // Validate it's a valid number and within 4-byte unsigned range
            if(isNaN(numValue) || numValue < 0 || numValue > 4294967295 || !Number.isInteger(numValue)) {
                return {
                    shouldTriggerEvent: false,
                    reason: 'Invalid 4-byte unsigned integer value: ' + telemetryValue,
                };
            }
            
            return {
                shouldTriggerEvent: true,
                eventClassText: "BLE Custom Alert Event 4B Triggered for " + label,
                eventType: "custom_alert",
                eventTelemetry: label,
                eventValue: numValue,
                reason: 'BLE custom alert 4B',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'BLE custom alert 4B - null or undefined value',
            };
        }
    }
}

module.exports = HandleBleCustomAlert4B;
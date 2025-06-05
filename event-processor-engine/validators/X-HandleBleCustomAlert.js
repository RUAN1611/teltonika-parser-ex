/**
 * Summary of Usage:
 * ✅ Use HandleBleCustomAlert for:
 * - BLE Custom #1 (IO IDs: 331-334) - Variable HEX data
 * - Any variable-length hexadecimal data
 * - Custom protocols or complex sensor data
 */

class HandleBleCustomAlert {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        
        if(telemetryValue !== null && telemetryValue !== undefined) {
            // For variable HEX data, basic validation
            const stringValue = String(telemetryValue);
            
            // Check if it's a valid hex string (optional validation)
            // This is lenient - allows both with and without 0x prefix
            const hexPattern = /^(0x)?[0-9A-Fa-f]*$/;
            if(stringValue.length > 0 && !hexPattern.test(stringValue)) {
                shouldTriggerEvent = false;
            }
            
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "BLE Custom Alert Event Triggered for IO Element: " + label,
                eventType: "custom_alert",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'BLE custom alert - variable HEX',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'BLE custom alert - null or undefined value',
            };
        }
    }
}

module.exports = HandleBleCustomAlert;

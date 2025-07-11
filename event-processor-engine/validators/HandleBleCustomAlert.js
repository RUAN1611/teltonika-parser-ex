/**
 * Summary of Usage:
 * ✅ Use HandleBleCustomAlert for:
 * - BLE Custom #1 (IO IDs: 331-334) - Variable HEX data
 * - Any variable-length hexadecimal data
 * - Custom protocols or complex sensor data
 */

class HandleBleCustomAlert {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = false;
        
        if(telemetryValue !== null && telemetryValue !== undefined) {
            // For variable HEX data, basic validation
            const stringValue = String(telemetryValue);
            
            // Set alert flag if value has length > 0
            if (stringValue.length > 0) {
                shouldTriggerEvent = true;
            }
            
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "BLE Custom Alert Event Triggered for IO Element: " + label,
                eventType: "custom_alert",
                eventTelemetry: label,
                eventValue: 1,
                eventAdditionalTelemetryColumn: `${label}_alert`,
                reason: 'BLE custom alert - variable HEX',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                alertFlag: 0,
                reason: 'BLE custom alert - null or undefined value',
            };
        }
    }
}

module.exports = HandleBleCustomAlert;

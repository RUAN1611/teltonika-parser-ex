// https://wiki.teltonika-gps.com/view/FMB140_Teltonika_Data_Sending_Parameters_ID - AVL ID: 256
// Reviewed with Werner

class HandleVin {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Vehicle Identification Number",
                eventType: "vin",
                eventTelemetry: label,
                eventValue: this.parseVin(telemetryValue),
            }
        }
        else {
            return {
                shouldTriggerEvent: false,
            }
        }
    }

    parseVin(telemetryValue) {
        if(telemetryValue !== null && telemetryValue !== undefined) {
            // Scenario 1: Already converted to string by ToStrAscii converter
            if (typeof telemetryValue === 'string') {
                return telemetryValue;
            }
            
            // Scenario 2: Array of ASCII codes (e.g., [65, 66, 67] for "ABC")
            if (Array.isArray(telemetryValue)) {
                try {
                    return String.fromCharCode(...telemetryValue);
                } catch (error) {
                    console.warn('Failed to convert array to VIN string:', error);
                    return null;
                }
            }
            
            // Scenario 3: Buffer or Uint8Array
            if (telemetryValue instanceof Buffer || telemetryValue instanceof Uint8Array) {
                try {
                    return String.fromCharCode(...Array.from(telemetryValue));
                } catch (error) {
                    console.warn('Failed to convert buffer to VIN string:', error);
                    return null;
                }
            }
            
            // Scenario 4: Number (single ASCII code) - convert to string
            if (typeof telemetryValue === 'number') {
                try {
                    return String.fromCharCode(telemetryValue);
                } catch (error) {
                    console.warn('Failed to convert number to VIN character:', error);
                    return null;
                }
            }
            
            // Scenario 5: Other formats - attempt string conversion
            try {
                return String(telemetryValue);
            } catch (error) {
                console.warn('Failed to convert telemetryValue to VIN string:', error);
                return null;
            }
        }
        else {
            return null;
        }
    }
}

module.exports = HandleVin;
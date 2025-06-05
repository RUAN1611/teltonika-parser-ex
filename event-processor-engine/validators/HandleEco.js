/**
 * https://wiki.teltonika-gps.com/view/FMB140_Teltonika_Data_Sending_Parameters_ID
 * EcoMaximum (ID: 258)
 * ---------------------
 * Size: 8 bytes
 * Type: Unsigned
 * Range: 0 to 0xFFFFFFFFFFFFFFFF
 * 
 * Stores maximum accelerometer values in mg on all axes during Eco driving event
 * 
 * Byte format:
 * - 2 bytes: Zeros
 * - 2 bytes: X axis
 * - 2 bytes: Y axis  
 * - 2 bytes: Z axis
 * 
 * Format: FMT100
 * Usage: Eventual I/O elements
 * 
 * EcoAverage (ID: 259) 
 * --------------------
 * Size: 8 bytes
 * Type: Unsigned
 * Range: 0 to 0xFFFFFFFFFFFFFFFF
 * 
 * Stores average accelerometer values in mg on all axes during Eco driving event
 * 
 * Byte format:
 * - 2 bytes: Zeros
 * - 2 bytes: X axis
 * - 2 bytes: Y axis
 * - 2 bytes: Z axis
 * 
 * Format: FMT100
 * Usage: Eventual I/O elements
 */

// Reviewed with Werner
// Done

class HandleEco {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(previousTelemetryValue === telemetryValue) {
            shouldTriggerEvent = false;
        }
        // Eco parameters (EcoMaximum/EcoAverage) store accelerometer values in mg
        // 8 Bytes format: 2B Zeros + 2B X axis + 2B Y axis + 2B Z axis
        
        // Handle invalid or null values
        if (telemetryValue === null || telemetryValue === undefined) {
            shouldTriggerEvent = false;
        }

        // Convert to BigInt if it's a string or number to handle 8-byte values
        let ecoValue;
        try {
            if (typeof telemetryValue === 'string') {
                ecoValue = BigInt(telemetryValue);
            } else if (typeof telemetryValue === 'number') {
                ecoValue = BigInt(telemetryValue);
            } else {
                ecoValue = telemetryValue;
            }
        } catch (error) {
            shouldTriggerEvent = false;
        }

        // Check if value is 0 (no eco driving event data)
        if (ecoValue === 0n) {
            shouldTriggerEvent = false;
        }

        // Parse the 8-byte value: 2B Zeros + 2B X + 2B Y + 2B Z
        // Extract each 2-byte component (16 bits each)
        const zAxis = Number(ecoValue & 0xFFFFn); // Last 2 bytes
        const yAxis = Number((ecoValue >> 16n) & 0xFFFFn); // Next 2 bytes
        const xAxis = Number((ecoValue >> 32n) & 0xFFFFn); // Next 2 bytes
        const zeros = Number((ecoValue >> 48n) & 0xFFFFn); // First 2 bytes (should be 0)

        // Convert from unsigned to signed 16-bit values (mg can be negative)
        const xAxisSigned = xAxis > 32767 ? xAxis - 65536 : xAxis;
        const yAxisSigned = yAxis > 32767 ? yAxis - 65536 : yAxis;
        const zAxisSigned = zAxis > 32767 ? zAxis - 65536 : zAxis;

        // Calculate magnitude of acceleration vector
        const magnitude = Math.sqrt(xAxisSigned * xAxisSigned + yAxisSigned * yAxisSigned + zAxisSigned * zAxisSigned);

        // Determine event type based on parameter name
        const eventType = label === 'eco_maximum' ? 'eco_maximum_event' : 'eco_average_event';
        const eventClassText = label === 'eco_maximum' ? 'Eco Maximum Event' : 'Eco Average Event';

        return {
            shouldTriggerEvent: shouldTriggerEvent,
            eventClassText: eventClassText,
            eventType: eventType,
            eventTelemetry: label,
            eventAdditionalTelemetryColumn: "eco_value",
            eventValue: magnitude,
        };
    }
}

module.exports = HandleEco; 
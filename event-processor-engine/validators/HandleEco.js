class HandleEco {
    validate(telemetryValue, parameterName = 'Eco') {
        // Eco parameters (EcoMaximum/EcoAverage) store accelerometer values in mg
        // 8 Bytes format: 2B Zeros + 2B X axis + 2B Y axis + 2B Z axis
        
        // Handle invalid or null values
        if (telemetryValue === null || telemetryValue === undefined) {
            return {
                shouldTriggerEvent: false,
                reason: `${parameterName} value is null or undefined`
            };
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
            return {
                shouldTriggerEvent: false,
                reason: `Invalid ${parameterName} value format`
            };
        }

        // Check if value is 0 (no eco driving event data)
        if (ecoValue === 0n) {
            return {
                shouldTriggerEvent: false,
                reason: `No ${parameterName} eco driving event data available`
            };
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

        return {
            shouldTriggerEvent: true,
            reason: `${parameterName} eco driving event recorded with accelerometer data`,
            accelerometer: {
                xAxis: xAxisSigned,
                yAxis: yAxisSigned,
                zAxis: zAxisSigned,
                magnitude: Math.round(magnitude)
            },
            units: 'mg'
        };
    }
}

module.exports = HandleEco; 
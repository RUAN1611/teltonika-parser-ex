// https://wiki.teltonika-gps.com/view/Crash_trace
// https://wiki.teltonika-gps.com/view/TFT100_AVL_ID_List - AVL ID: 257

/* Telemetry Value Example: 
001D003F03F3001E003C03F30026004C04020022004603FD0023004603FC0024004
803FC001F004303FB001F004103F10026004903FC0025004D03FF001E004303F700
23004503FB001F004103F6001C003B03F40022004703FB001E003B03F50025004A0
3FB001E003F03F30021004303FB0024004603FF01
AXIS X 	AXIS Y 	AXIS Z
001D 	003F 	03F3
001E 	003C 	03F3
0026 	004C 	0402
0022 	0046 	03FD
0023 	0046 	03FC
0024 	0048 	03FC
001F 	0043 	03FB
001F 	0041 	03F1
0026 	0049 	03FC 
....    ....    ....
....    ....    ....
*/

// Not gonna put in Telemetry. The customer will see there is an IMPACT = 1

class HandleCrashTrace {
    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue !== null && telemetryValue !== undefined) {
            try {
                // Parse the crash trace data into x, y, z triplets
                const crashData = this.parseCrashTraceData(telemetryValue);
                
                return {
                    shouldTriggerEvent: shouldTriggerEvent,
                    eventClassText: "Crash Trace Event Triggered",
                    eventType: "crash_trace",
                    eventTelemetry: label,
                    telemetry: {},
                    event: {
                        crash: crashData // Array of {x, y, z} triplets
                    },
                    reason: 'Crash trace',
                };
            } catch (error) {
                return {
                    shouldTriggerEvent: false,
                    reason: `Crash trace parsing error: ${error.message}`,
                };
            }
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Crash trace unknown',
            };
        }
    }

    parseCrashTraceData(telemetryValue) {
        // Remove Spaces and Ensure Even Length
        const cleanHex = telemetryValue.replace(/\s+/g, '');

        if(cleanHex.length % 12 !== 0) {
            throw new Error('Invalid crash trace data length. Must be multiple of 12 hex characters (6 bytes)');
        }

        const measurements = [];

        for(let i = 0; i < cleanHex.length; i += 12) {
            const chunk = cleanHex.substr(i, 12);

            const xHex = chunk.substr(0, 4);
            const yHex = chunk.substr(4, 4);
            const zHex = chunk.substr(8, 4);

            const x = this.hexToSignedInt16(xHex);
            const y = this.hexToSignedInt16(yHex);
            const z = this.hexToSignedInt16(zHex);

            measurements.push({
                x: x,
                y: y,
                z: z,
            });
        }

        return measurements;
    }

    hexToSignedInt16(hexString) {
        const unsigned = parseInt(hexString, 16);

        if(unsigned >= 0x8000) {
            return unsigned - 0x10000;
        }

        return unsigned;
    }
}

module.exports = HandleCrashTrace;

// https://wiki.teltonika-gps.com/view/Crash_trace

class HandleCrashTrace {
    validate(telemetryValue, previousTelemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === previousTelemetryValue) {
            shouldTriggerEvent = false;
        }
        if(telemetryValue !== null && telemetryValue !== undefined) {
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Crash Trace Event Triggered",
                eventType: "crash_trace",
                eventTelemetry: label,
                eventValue: telemetryValue,
                reason: 'Crash trace',
            };
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

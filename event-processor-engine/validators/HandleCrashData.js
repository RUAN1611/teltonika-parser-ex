class HandleCrashData {
    validate(telemetryValue) {
        if(telemetryValue === 1) {
            return {
                shouldTriggerEvent: true,
                reason: 'Real Crash Detected (Device is Calibrated)',
            };
        }
        else if(telemetryValue === 2) {
            return {
                shouldTriggerEvent: true,
                reason: 'Limited Crash Trace (Device Not Calibrated)',
            }
        }
        else if(telemetryValue === 3) {
            return {
                shouldTriggerEvent: true,
                reason: 'Limited Crash Trace (Device is calibrated)',
            }
        }
        else if(telemetryValue === 4) {
            return {
                shouldTriggerEvent: true,
                reason: 'Full Crash Trace (Device is not calibrated)',
            }
        }
        else if(telemetryValue === 5) {
            return {
                shouldTriggerEvent: true,
                reason: 'Full Crash Trace (Device is calibrated)',
            }
        }
        else if(telemetryValue === 6) {
            return {
                shouldTriggerEvent: true,
                reason: 'Real Crash Detected (Device is not calibrated)',
            }
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: 'Crash Data status unknown',
            }
        }
    }
}

module.exports = HandleCrashData;
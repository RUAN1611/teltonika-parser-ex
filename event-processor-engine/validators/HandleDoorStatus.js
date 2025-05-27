class HandleDoorStatus {
    validate(telemetryValue) {
        if(telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                reason: 'All doors closed',
            };
        }
        else if(telemetryValue === 256) {
            return {
                shouldTriggerEvent: true,
                reason: 'Front left door is opened',
            };
        }
        else if(telemetryValue === 512) {
            return {
                shouldTriggerEvent: true,
                reason: 'Front right door is opened',
            };
        }
        else if(telemetryValue === 1024) {
            return {
                shouldTriggerEvent: true,
                reason: 'Rear left door is opened',
            };
        }
        else if(telemetryValue === 2048) {
            return {
                shouldTriggerEvent: true,
                reason: 'Rear right door is opened',
            };
        }
        else if(telemetryValue === 4096) {
            return {
                shouldTriggerEvent: true,
                reason: 'Hood is opened',
            };
        }
        else if(telemetryValue === 8192) {
            return {
                shouldTriggerEvent: true,
                reason: 'Trunk is opened',
            };
        }
        else if(telemetryValue === 16128) {
            return {
                shouldTriggerEvent: true,
                reason: 'All doors are opened or combination of values',
            };
        }
        else {
            return {
                shouldTriggerEvent: false,
                reason: `Door status ${telemetryValue} is within normal range`
            };
        }
    }
}

module.exports = HandleDoorStatus;
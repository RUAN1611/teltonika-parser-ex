// https://wiki.teltonika-gps.com/view/FMB930_Teltonika_Data_Sending_Parameters_ID - ID: 90
// Add Additional Columns for Door Statuses.
// Splitting the Bitflag Into Useful Digitals for Customer
// Bitmap IO - Masks Shifting

class HandleDoorStatus {
    validate(telemetryValue, label) {
        // Door status values - both decimal and bitmask
        const DOOR_VALUES = {
            FRONT_LEFT: { decimal: 256, bitmask: 0x100 },
            FRONT_RIGHT: { decimal: 512, bitmask: 0x200 },
            REAR_LEFT: { decimal: 1024, bitmask: 0x400 },
            REAR_RIGHT: { decimal: 2048, bitmask: 0x800 },
            HOOD: { decimal: 4096, bitmask: 0x1000 },
            TRUNK: { decimal: 8192, bitmask: 0x2000 }
        };

        // Check if all doors are closed
        if (telemetryValue === 0) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "all_doors_closed",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }

        // Check if all doors are opened (both decimal and hex)
        if (telemetryValue === 16128 || telemetryValue === 0x3F00) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "all_doors_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }

        // Check individual door states (both decimal and bitmask)
        if (telemetryValue === DOOR_VALUES.FRONT_LEFT.decimal || telemetryValue === DOOR_VALUES.FRONT_LEFT.bitmask) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "front_left_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if (telemetryValue === DOOR_VALUES.FRONT_RIGHT.decimal || telemetryValue === DOOR_VALUES.FRONT_RIGHT.bitmask) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "front_right_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if (telemetryValue === DOOR_VALUES.REAR_LEFT.decimal || telemetryValue === DOOR_VALUES.REAR_LEFT.bitmask) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "rear_left_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if (telemetryValue === DOOR_VALUES.REAR_RIGHT.decimal || telemetryValue === DOOR_VALUES.REAR_RIGHT.bitmask) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "rear_right_door_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if (telemetryValue === DOOR_VALUES.HOOD.decimal || telemetryValue === DOOR_VALUES.HOOD.bitmask) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "hood_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }
        else if (telemetryValue === DOOR_VALUES.TRUNK.decimal || telemetryValue === DOOR_VALUES.TRUNK.bitmask) {
            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: "trunk_opened",
                eventTelemetry: label,
                eventValue: telemetryValue,
            };
        }

        // Check for combinations using bitwise operations
        const openedDoors = [];
        
        // Check each door using bitwise AND
        if (telemetryValue & DOOR_VALUES.FRONT_LEFT.bitmask) {
            openedDoors.push("front_left_door");
        }
        if (telemetryValue & DOOR_VALUES.FRONT_RIGHT.bitmask) {
            openedDoors.push("front_right_door");
        }
        if (telemetryValue & DOOR_VALUES.REAR_LEFT.bitmask) {
            openedDoors.push("rear_left_door");
        }
        if (telemetryValue & DOOR_VALUES.REAR_RIGHT.bitmask) {
            openedDoors.push("rear_right_door");
        }
        if (telemetryValue & DOOR_VALUES.HOOD.bitmask) {
            openedDoors.push("hood");
        }
        if (telemetryValue & DOOR_VALUES.TRUNK.bitmask) {
            openedDoors.push("trunk");
        }

        // If we found opened doors through bitwise operations, create an event
        if (openedDoors.length > 0) {
            const eventType = openedDoors.length === 1 
                ? openedDoors[0] + "_opened"
                : "multiple_doors_opened";

            return {
                shouldTriggerEvent: true,
                eventClassText: "Door Status Event",
                eventType: eventType,
                eventTelemetry: label,
                eventValue: telemetryValue,
                openedDoors: openedDoors,
            };
        }

        // Fallback for any unexpected values
        return {
            shouldTriggerEvent: false,
            reason: `Door status ${telemetryValue} is within normal range`
        };
    }
}

module.exports = HandleDoorStatus;
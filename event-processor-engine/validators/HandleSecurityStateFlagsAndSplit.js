// Security State Flags P2 validator - Split version
// Split the 8 Byte Value into 4B High and 4B Low

class HandleSecurityStateFlagsAndSplit {
    constructor() {
        // Define Security State Flags P2 mappings based on specification
        this.flagMapping = {
            0: { // Byte 0 - CAN connection statuses
                0: { // Bits 0-1 for CAN1
                    masks: [0x00, 0x01, 0x02, 0x03],
                    labels: [
                        'CAN1 not connected, connection not required',
                        'CAN1 connected, currently no data is received',
                        'CAN1 not connected, needs connection',
                        'CAN1 connected, currently data is received'
                    ]
                },
                2: { // Bits 2-3 for CAN2
                    masks: [0x00, 0x04, 0x08, 0x0C],
                    labels: [
                        'CAN2 not connected, connection not required',
                        'CAN2 connected, currently no data is received',
                        'CAN2 not connected, needs connection',
                        'CAN2 connected, currently data is received'
                    ]
                },
                4: { // Bits 4-5 for CAN3
                    masks: [0x00, 0x10, 0x20, 0x30],
                    labels: [
                        'CAN3 not connected, connection not required',
                        'CAN3 connected, currently no data is received',
                        'CAN3 not connected, needs connection',
                        'CAN3 connected, currently data is received'
                    ]
                }
            },
            1: { // Byte 1 - Engine and hazard controls
                8: { mask: 0x01, label: 'Request to lock the engine' },
                9: { mask: 0x02, label: 'Hazard warning lights switch active' },
                10: { mask: 0x04, label: 'Factory armed' }
            },
            2: { // Byte 2 - Electric engine and charging
                17: { mask: 0x02, label: 'Electric engine is working' },
                18: { mask: 0x04, label: 'Battery charging is on' },
                19: { mask: 0x08, label: 'Charging wire is plugged' },
                20: { mask: 0x10, label: 'Vehicle working mode - business mode' },
                21: { mask: 0x20, label: 'Operate button in car was pressed' },
                22: { mask: 0x40, label: 'Immobilizer is in service mode' },
                23: { mask: 0x80, label: 'Immobilizer key sequence being entered' }
            },
            3: { // Byte 3 - Key, ignition and car status
                24: { mask: 0x01, label: 'Key is in ignition lock' },
                25: { mask: 0x02, label: 'Ignition on' },
                26: { mask: 0x04, label: 'Dynamic ignition on' },
                27: { mask: 0x08, label: 'Webasto active' },
                28: { mask: 0x10, label: 'Car is closed' },
                29: { mask: 0x20, label: 'Car is closed by factory remote control or module command' },
                30: { mask: 0x40, label: 'Factory installed alarm system is actuated (panic mode)' },
                31: { mask: 0x80, label: 'Factory installed alarm system is emulated by module' }
            },
            4: { // Byte 4 - Gears and brakes
                32: { mask: 0x01, label: 'Parking activated (automatic gearbox)' },
                34: { mask: 0x04, label: 'Neutral activated (automatic gearbox)' },
                35: { mask: 0x08, label: 'Drive activated (automatic gearbox)' },
                36: { mask: 0x10, label: 'Handbrake is actuated' },
                37: { mask: 0x20, label: 'Footbrake is actuated' },
                38: { mask: 0x40, label: 'Engine is working' },
                39: { mask: 0x80, label: 'Reverse is on' }
            },
            5: { // Byte 5 - Doors and openings
                40: { mask: 0x01, label: 'Front left door opened' },
                41: { mask: 0x02, label: 'Front right door opened' },
                42: { mask: 0x04, label: 'Rear left door opened' },
                43: { mask: 0x08, label: 'Rear right door opened' },
                44: { mask: 0x10, label: 'Engine cover opened' },
                45: { mask: 0x20, label: 'Trunk door opened' },
                46: { mask: 0x40, label: 'Roof opened' }
            },
            6: { // Byte 6 - Remote control and CAN module
                48: { // Low nibble (bits 0-3) - factory remote control actions
                    masks: [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F],
                    labels: [
                        'No remote control action',
                        'Car was closed by factory remote control',
                        'Car was opened by factory remote control',
                        'Trunk cover was opened by factory remote control',
                        'Module has sent a rearming signal',
                        'Car was closed three times by factory remote control',
                        'Remote control action 6',
                        'Remote control action 7',
                        'Remote control action 8',
                        'Remote control action 9',
                        'Remote control action 10',
                        'Remote control action 11',
                        'Remote control action 12',
                        'Remote control action 13',
                        'Remote control action 14',
                        'Remote control action 15'
                    ]
                },
                52: { mask: 0x80, label: 'CAN module goes to sleep mode' } // High nibble bit 7
            }
        };
    }

    validate(telemetryValue, label) {
        try {
            // Convert hex string to number if needed
            let value;
            if (typeof telemetryValue === 'string') {
                value = parseInt(telemetryValue, 16);
            } else {
                value = telemetryValue;
            }

            if (isNaN(value)) {
                return {
                    shouldTriggerEvent: false,
                    reason: 'Invalid telemetry value'
                };
            }

            // Split the 8-byte (64-bit) value into low and high 32-bit parts
            // JavaScript bitwise operations work on 32-bit signed integers, so we need to handle 64-bit values carefully
            const valueLow = value & 0xFFFFFFFF;  // Get low 32 bits
            const valueHigh = Math.floor(value / 0x100000000) & 0xFFFFFFFF;  // Get high 32 bits

            // Convert to signed 32-bit integers to match C# behavior
            const signedLow = valueLow > 0x7FFFFFFF ? valueLow - 0x100000000 : valueLow;
            const signedHigh = valueHigh > 0x7FFFFFFF ? valueHigh - 0x100000000 : valueHigh;

            // Check if there are any active security state events
            const activeEvents = this.getActiveEvents(telemetryValue);
            const hasActiveEvents = activeEvents.length > 0;

            return {
                shouldTriggerEvent: hasActiveEvents,
                eventClassText: hasActiveEvents ? "Security State Flags P2 Event" : undefined,
                eventType: hasActiveEvents ? (activeEvents[0].event || 'Security State Flags P2') : undefined,
                eventTelemetry: hasActiveEvents ? label : undefined,
                eventValue: hasActiveEvents ? telemetryValue : undefined,
                eventAdditionalTelemetryColumns: [
                    {
                        columnName: `${label}_l`,
                        value: signedLow
                    },
                    {
                        columnName: `${label}_h`, 
                        value: signedHigh
                    }
                ],
                removeTelemetry: true  // Remove the original 8-byte telemetry
            };

        } catch (error) {
            console.error('Error processing Security State Flags P2 and split:', error);
            return {
                shouldTriggerEvent: false,
                reason: 'Error processing security state flags and split'
            };
        }
    }

    /**
     * Parse Security State Flags P2 and return active events
     * @param {number|string} telemetryValue - The bit flag value (hex string or number)
     * @returns {Array} - Array of active flag events
     */
    getActiveEvents(telemetryValue) {
        try {
            // Convert hex string to number if needed
            let flagValue;
            if (typeof telemetryValue === 'string') {
                flagValue = parseInt(telemetryValue, 16);
            } else {
                flagValue = telemetryValue;
            }

            if (isNaN(flagValue) || flagValue === 0) {
                return [];
            }

            const activeEvents = [];

            // Convert to byte array (little-endian)
            const bytes = [];
            for (let i = 0; i < 8; i++) {
                bytes[i] = (flagValue >> (i * 8)) & 0xFF;
            }

            // Check each byte for active flags
            Object.keys(this.flagMapping).forEach(byteIndex => {
                const byteNum = parseInt(byteIndex);
                const byteValue = bytes[byteNum] || 0;
                const byteMappings = this.flagMapping[byteIndex];

                Object.keys(byteMappings).forEach(bitIndex => {
                    const bitNum = parseInt(bitIndex);
                    const bitMapping = byteMappings[bitIndex];

                    // Handle multi-value flags (CAN statuses and remote control actions)
                    if (bitMapping.masks && bitMapping.labels) {
                        if (bitNum === 48) { // Low nibble for remote control actions
                            const value = byteValue & 0x0F;
                            if (value > 0 && value < bitMapping.labels.length) {
                                activeEvents.push({
                                    event: bitMapping.labels[value],
                                    bit: bitNum,
                                    byte: byteNum,
                                    value: value
                                });
                            }
                        } else { // CAN status flags (2-bit values)
                            const value = (byteValue >> bitNum) & 0x03;
                            if (value > 0) { // Only report non-zero values
                                activeEvents.push({
                                    event: bitMapping.labels[value],
                                    bit: bitNum,
                                    byte: byteNum,
                                    value: value
                                });
                            }
                        }
                    } else {
                        // Handle simple binary flags
                        if (byteValue & bitMapping.mask) {
                            activeEvents.push({
                                event: bitMapping.label,
                                bit: bitNum,
                                byte: byteNum
                            });
                        }
                    }
                });
            });

            return activeEvents;

        } catch (error) {
            console.error('Error parsing Security State Flags P2:', error);
            return [];
        }
    }
}

module.exports = HandleSecurityStateFlagsAndSplit;

// Simplified bit flag parser

class HandleBitFlagSplit {
    constructor() {
        // Define bit flag mappings for different flag types
        this.flagMappings = {
            // Security State Flags P2
            'securitystateflags_p2': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'CAN1 connected, data received' },
                    2: { mask: 0x04, label: 'CAN2 connected, data received' },
                    4: { mask: 0x10, label: 'CAN3 connected, data received' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'Engine lock request' },
                    9: { mask: 0x02, label: 'Hazard warning lights active' },
                    10: { mask: 0x04, label: 'Factory armed' }
                },
                2: { // Byte 2
                    17: { mask: 0x02, label: 'Electric engine working' },
                    18: { mask: 0x04, label: 'Battery charging on' },
                    19: { mask: 0x08, label: 'Charging wire plugged' },
                    20: { mask: 0x10, label: 'Business mode active' },
                    21: { mask: 0x20, label: 'Operate button pressed' },
                    22: { mask: 0x40, label: 'Immobilizer service mode' },
                    23: { mask: 0x80, label: 'Immobilizer key sequence' }
                },
                3: { // Byte 3
                    24: { mask: 0x01, label: 'Key in ignition lock' },
                    25: { mask: 0x02, label: 'Ignition on' },
                    26: { mask: 0x04, label: 'Dynamic ignition on' },
                    27: { mask: 0x08, label: 'Webasto active' },
                    28: { mask: 0x10, label: 'Car closed' },
                    29: { mask: 0x20, label: 'Car closed by remote' },
                    30: { mask: 0x40, label: 'Factory alarm panic mode' },
                    31: { mask: 0x80, label: 'Factory alarm emulated' }
                },
                4: { // Byte 4
                    32: { mask: 0x01, label: 'Parking gear active' },
                    34: { mask: 0x04, label: 'Neutral gear active' },
                    35: { mask: 0x08, label: 'Drive gear active' },
                    36: { mask: 0x10, label: 'Handbrake active' },
                    37: { mask: 0x20, label: 'Footbrake active' },
                    38: { mask: 0x40, label: 'Engine working' },
                    39: { mask: 0x80, label: 'Reverse gear active' }
                },
                5: { // Byte 5
                    40: { mask: 0x01, label: 'Front left door open' },
                    41: { mask: 0x02, label: 'Front right door open' },
                    42: { mask: 0x04, label: 'Rear left door open' },
                    43: { mask: 0x08, label: 'Rear right door open' },
                    44: { mask: 0x10, label: 'Engine cover open' },
                    45: { mask: 0x20, label: 'Trunk door open' },
                    46: { mask: 0x40, label: 'Roof open' }
                }
            },

            // Security State Flags P4
            'securitystateflags_p4': {
                1: { // Byte 1
                    8: { mask: 0x01, label: 'Ignition on' },
                    9: { mask: 0x02, label: 'Key in ignition lock' },
                    10: { mask: 0x04, label: 'Webasto active' },
                    11: { mask: 0x08, label: 'Engine working' },
                    12: { mask: 0x10, label: 'Standalone engine' },
                    13: { mask: 0x20, label: 'Ready to drive' },
                    14: { mask: 0x40, label: 'Engine working on CNG' },
                    15: { mask: 0x80, label: 'Company work mode' }
                },
                2: { // Byte 2
                    16: { mask: 0x01, label: 'Operator present' },
                    17: { mask: 0x02, label: 'Interlock active' },
                    18: { mask: 0x04, label: 'Handbrake active' },
                    19: { mask: 0x08, label: 'Footbrake active' },
                    20: { mask: 0x10, label: 'Clutch pushed' },
                    21: { mask: 0x20, label: 'Hazard warning lights active' },
                    22: { mask: 0x40, label: 'Front left door open' },
                    23: { mask: 0x80, label: 'Front right door open' }
                },
                3: { // Byte 3
                    24: { mask: 0x01, label: 'Rear left door open' },
                    25: { mask: 0x02, label: 'Rear right door open' },
                    26: { mask: 0x04, label: 'Trunk door open' },
                    27: { mask: 0x08, label: 'Engine cover open' },
                    28: { mask: 0x10, label: 'Charging wire plugged' },
                    29: { mask: 0x20, label: 'Battery charging on' },
                    30: { mask: 0x40, label: 'Electric engine working' },
                    31: { mask: 0x80, label: 'Car closed with factory remote' }
                }
            },

            // Control State Flags P2
            'controlstateflags_p2': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'STOP indicator' },
                    1: { mask: 0x02, label: 'Oil pressure/level warning' },
                    2: { mask: 0x04, label: 'Coolant temperature/level warning' },
                    3: { mask: 0x08, label: 'Handbrake system warning' },
                    4: { mask: 0x10, label: 'Battery not charging' },
                    5: { mask: 0x20, label: 'AIRBAG warning' },
                    6: { mask: 0x40, label: 'EPS warning' },
                    7: { mask: 0x80, label: 'ESP warning' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'CHECK ENGINE (MIL)' },
                    9: { mask: 0x02, label: 'Lights failure' },
                    10: { mask: 0x04, label: 'Low tire pressure' },
                    11: { mask: 0x08, label: 'Brake pads wear' },
                    12: { mask: 0x10, label: 'Warning indicator' },
                    13: { mask: 0x20, label: 'ABS warning' },
                    14: { mask: 0x40, label: 'Low fuel' },
                    15: { mask: 0x80, label: 'Maintenance required' }
                },
                2: { // Byte 2
                    20: { mask: 0x10, label: 'Parking lights on' },
                    21: { mask: 0x20, label: 'Dipped headlights on' },
                    22: { mask: 0x40, label: 'Full beam headlights on' },
                    23: { mask: 0x80, label: 'Front fog lights on' }
                },
                3: { // Byte 3
                    29: { mask: 0x20, label: 'Rear fog lights on' },
                    30: { mask: 0x40, label: 'Passenger seat belt' },
                    31: { mask: 0x80, label: 'Driver seat belt' }
                }
            },

            // Control State Flags P4
            'controlstateflags_p4': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'Parking lights on' },
                    1: { mask: 0x02, label: 'Dipped headlights on' },
                    2: { mask: 0x04, label: 'Full beam headlights on' },
                    3: { mask: 0x08, label: 'Rear fog lights on' },
                    4: { mask: 0x10, label: 'Front fog lights on' },
                    5: { mask: 0x20, label: 'Additional front lights on' },
                    6: { mask: 0x40, label: 'Additional rear lights on' },
                    7: { mask: 0x80, label: 'Light signal on' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'Air conditioning on' },
                    9: { mask: 0x02, label: 'Cruise control on' },
                    10: { mask: 0x04, label: 'Automatic retarder on' },
                    11: { mask: 0x08, label: 'Manual retarder on' },
                    12: { mask: 0x10, label: 'Driver seatbelt fastened' },
                    13: { mask: 0x20, label: 'Front passenger seatbelt fastened' },
                    14: { mask: 0x40, label: 'Rear left passenger seatbelt fastened' },
                    15: { mask: 0x80, label: 'Rear right passenger seatbelt fastened' }
                }
            },

            // Indicator State Flags P4
            'indicatorstateflags_p4': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'CHECK ENGINE (MIL) indicator on' },
                    1: { mask: 0x02, label: 'ABS indicator on' },
                    2: { mask: 0x04, label: 'ESP indicator on' },
                    3: { mask: 0x08, label: 'ESP turned off' },
                    4: { mask: 0x10, label: 'STOP indicator on' },
                    5: { mask: 0x20, label: 'Oil pressure/level indicator on' },
                    6: { mask: 0x40, label: 'Coolant temperature/level indicator on' },
                    7: { mask: 0x80, label: 'Battery not charging indicator on' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'Handbrake system indicator on' },
                    9: { mask: 0x02, label: 'AIRBAG indicator on' },
                    10: { mask: 0x04, label: 'EPS indicator on' },
                    11: { mask: 0x08, label: 'Warning indicator on' },
                    12: { mask: 0x10, label: 'Lights failure indicator on' },
                    13: { mask: 0x20, label: 'Low tire pressure indicator on' },
                    14: { mask: 0x40, label: 'Brake pads wear indicator on' },
                    15: { mask: 0x80, label: 'Low fuel level indicator on' }
                }
            },

            // Agricultural State Flags P4
            'agriculturalstateflags_p4': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'Right joystick moved right' },
                    1: { mask: 0x02, label: 'Right joystick moved left' },
                    2: { mask: 0x04, label: 'Right joystick moved forward' },
                    3: { mask: 0x08, label: 'Right joystick moved back' },
                    4: { mask: 0x10, label: 'Left joystick moved right' },
                    5: { mask: 0x20, label: 'Left joystick moved left' },
                    6: { mask: 0x40, label: 'Left joystick moved forward' },
                    7: { mask: 0x80, label: 'Left joystick moved back' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'First rear hydraulic on' },
                    9: { mask: 0x02, label: 'Second rear hydraulic on' },
                    10: { mask: 0x04, label: 'Third rear hydraulic on' },
                    11: { mask: 0x08, label: 'Fourth rear hydraulic on' },
                    12: { mask: 0x10, label: 'First front hydraulic on' },
                    13: { mask: 0x20, label: 'Second front hydraulic on' },
                    14: { mask: 0x40, label: 'Third front hydraulic on' },
                    15: { mask: 0x80, label: 'Fourth front hydraulic on' }
                },
                2: { // Byte 2
                    16: { mask: 0x01, label: 'Front three-point hitch on' },
                    17: { mask: 0x02, label: 'Rear three-point hitch on' },
                    18: { mask: 0x04, label: 'Front power take-off on' },
                    19: { mask: 0x08, label: 'Rear power take-off on' },
                    20: { mask: 0x10, label: 'Mowing active' },
                    21: { mask: 0x20, label: 'Threshing active' },
                    22: { mask: 0x40, label: 'Grain release from hopper on' },
                    23: { mask: 0x80, label: 'Grain tank 100% full' }
                },
                3: { // Byte 3
                    24: { mask: 0x01, label: 'Grain tank 70% full' },
                    25: { mask: 0x02, label: 'Grain tank opened' },
                    26: { mask: 0x04, label: 'Unloader drive on' },
                    27: { mask: 0x08, label: 'Cleaning fan control off' },
                    28: { mask: 0x10, label: 'Threshing drum control off' },
                    29: { mask: 0x20, label: 'Straw walker clogged' },
                    30: { mask: 0x40, label: 'Excessive clearance under threshing drum' },
                    31: { mask: 0x80, label: 'Low hydraulic temperature (<5°C)' }
                }
            },

            // Utility State Flags P4
            'utilitystateflags_p4': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'Salt/sand disperser on' },
                    1: { mask: 0x02, label: 'Pouring chemicals on' },
                    2: { mask: 0x04, label: 'Conveyor belt on' },
                    3: { mask: 0x08, label: 'Salt spreader drive wheel on' },
                    4: { mask: 0x10, label: 'Brushes on' },
                    5: { mask: 0x20, label: 'Vacuum cleaner on' },
                    6: { mask: 0x40, label: 'Water supply on' },
                    7: { mask: 0x80, label: 'High pressure washer on' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'Liquid pump on' },
                    9: { mask: 0x02, label: 'Unloading from hopper on' },
                    10: { mask: 0x04, label: 'Low salt/sand level indicator' },
                    11: { mask: 0x08, label: 'Low water level indicator' },
                    12: { mask: 0x10, label: 'Chemicals on' },
                    13: { mask: 0x20, label: 'Compressor on' },
                    14: { mask: 0x40, label: 'Water valve opened' },
                    15: { mask: 0x80, label: 'Cabin moved up' }
                },
                2: { // Byte 2
                    16: { mask: 0x01, label: 'Cabin moved down' }
                }
            },

            // Cistern State Flags P4
            'cisternstateflags_p4': {
                0: { // Byte 0
                    0: { mask: 0x01, label: 'Section 1 - fluid in downpipe' },
                    1: { mask: 0x02, label: 'Section 1 - filled' },
                    2: { mask: 0x04, label: 'Section 1 - overfilled' },
                    3: { mask: 0x08, label: 'Section 2 - fluid in downpipe' },
                    4: { mask: 0x10, label: 'Section 2 - filled' },
                    5: { mask: 0x20, label: 'Section 2 - overfilled' },
                    6: { mask: 0x40, label: 'Section 3 - fluid in downpipe' },
                    7: { mask: 0x80, label: 'Section 3 - filled' }
                },
                1: { // Byte 1
                    8: { mask: 0x01, label: 'Section 3 - overfilled' },
                    9: { mask: 0x02, label: 'Section 4 - fluid in downpipe' },
                    10: { mask: 0x04, label: 'Section 4 - filled' },
                    11: { mask: 0x08, label: 'Section 4 - overfilled' },
                    12: { mask: 0x10, label: 'Section 5 - fluid in downpipe' },
                    13: { mask: 0x20, label: 'Section 5 - filled' },
                    14: { mask: 0x40, label: 'Section 5 - overfilled' },
                    15: { mask: 0x80, label: 'Section 6 - fluid in downpipe' }
                },
                2: { // Byte 2
                    16: { mask: 0x01, label: 'Section 6 - filled' },
                    17: { mask: 0x02, label: 'Section 6 - overfilled' },
                    18: { mask: 0x04, label: 'Section 7 - fluid in downpipe' },
                    19: { mask: 0x08, label: 'Section 7 - filled' },
                    20: { mask: 0x10, label: 'Section 7 - overfilled' },
                    21: { mask: 0x20, label: 'Section 8 - fluid in downpipe' },
                    22: { mask: 0x40, label: 'Section 8 - filled' },
                    23: { mask: 0x80, label: 'Section 8 - overfilled' }
                }
            }
        };
    }

    /**
     * Parse bit flags and return which events occurred
     * @param {number|string} telemetryValue - The bit flag value (hex string or number)
     * @param {string} flagType - The type of flag (e.g., 'controlstateflags_p4')
     * @returns {Array} - Array of active flag events
     */
    getActiveEvents(telemetryValue, flagType) {
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

            const flagMapping = this.flagMappings[flagType];
            if (!flagMapping) {
                return [];
            }

            const activeEvents = [];

            // Convert to byte array (little-endian)
            const bytes = [];
            for (let i = 0; i < 8; i++) {
                bytes[i] = (flagValue >> (i * 8)) & 0xFF;
            }

            // Check each byte for active flags
            Object.keys(flagMapping).forEach(byteIndex => {
                const byteNum = parseInt(byteIndex);
                const byteValue = bytes[byteNum] || 0;
                const byteMappings = flagMapping[byteIndex];

                Object.keys(byteMappings).forEach(bitIndex => {
                    const bitMapping = byteMappings[bitIndex];
                    
                    // Check if this bit is set
                    if (byteValue & bitMapping.mask) {
                        activeEvents.push({
                            event: bitMapping.label,
                            bit: parseInt(bitIndex),
                            byte: byteNum
                        });
                    }
                });
            });

            return activeEvents;

        } catch (error) {
            console.error('Error parsing bit flags:', error);
            return [];
        }
    }

    /**
     * Get all supported flag types
     * @returns {Array} - Array of supported flag types
     */
    getSupportedFlagTypes() {
        return Object.keys(this.flagMappings);
    }
}

module.exports = HandleBitFlagSplit;

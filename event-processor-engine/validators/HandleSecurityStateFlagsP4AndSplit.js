// Security State Flags P4 parser

class HandleSecurityStateFlagsP4AndSplit {
    constructor() {
        // Define Security State Flags P4 mappings based on specification
        this.flagMapping = {
            0: { // Byte 0 - CAN connection statuses
                0: { // Bits 0-1 for CAN1
                    masks: [0x00, 0x01, 0x02, 0x03],
                    labels: [
                        'CAN1 connected, currently no data received',
                        'CAN1 connected, currently data received', 
                        'CAN1 not connected, needs connection',
                        'CAN1 not connected, does not need connection'
                    ]
                },
                2: { // Bits 2-3 for CAN2
                    masks: [0x00, 0x04, 0x08, 0x0C],
                    labels: [
                        'CAN2 connected, currently no data received',
                        'CAN2 connected, currently data received',
                        'CAN2 not connected, needs connection', 
                        'CAN2 not connected, does not need connection'
                    ]
                },
                4: { // Bits 4-5 for CAN3
                    masks: [0x00, 0x10, 0x20, 0x30],
                    labels: [
                        'CAN3 connected, currently no data received',
                        'CAN3 connected, currently data received',
                        'CAN3 not connected, needs connection',
                        'CAN3 not connected, does not need connection'
                    ]
                }
            },
            1: { // Byte 1 - Engine and ignition
                8: { mask: 0x01, label: 'Ignition on' },
                9: { mask: 0x02, label: 'Key in ignition lock' },
                10: { mask: 0x04, label: 'Webasto active' },
                11: { mask: 0x08, label: 'Engine working' },
                12: { mask: 0x10, label: 'Standalone engine' },
                13: { mask: 0x20, label: 'Ready to drive' },
                14: { mask: 0x40, label: 'Engine working on CNG' },
                15: { mask: 0x80, label: 'Company work mode' }
            },
            2: { // Byte 2 - Operator and controls
                16: { mask: 0x01, label: 'Operator present' },
                17: { mask: 0x02, label: 'Interlock active' },
                18: { mask: 0x04, label: 'Handbrake active' },
                19: { mask: 0x08, label: 'Footbrake active' },
                20: { mask: 0x10, label: 'Clutch pushed' },
                21: { mask: 0x20, label: 'Hazard warning lights active' },
                22: { mask: 0x40, label: 'Front left door open' },
                23: { mask: 0x80, label: 'Front right door open' }
            },
            3: { // Byte 3 - Doors and charging
                24: { mask: 0x01, label: 'Rear left door open' },
                25: { mask: 0x02, label: 'Rear right door open' },
                26: { mask: 0x04, label: 'Trunk door open' },
                27: { mask: 0x08, label: 'Engine cover open' },
                28: { mask: 0x10, label: 'Charging wire plugged' },
                29: { mask: 0x20, label: 'Battery charging on' },
                30: { mask: 0x40, label: 'Electric engine working' },
                31: { mask: 0x80, label: 'Car closed with factory remote' }
            },
            4: { // Byte 4 - Security and alarms
                32: { mask: 0x01, label: 'Car closed' },
                33: { mask: 0x02, label: 'Factory alarm active' },
                34: { mask: 0x04, label: 'Emulated alarm active' },
                35: { mask: 0x08, label: 'Factory remote close signal sent' },
                36: { mask: 0x10, label: 'Factory remote open signal sent' },
                37: { mask: 0x20, label: 'Rearm signal sent' },
                38: { mask: 0x40, label: 'Trunk opened with remote' },
                39: { mask: 0x80, label: 'CAN module in SLEEP mode' }
            },
            5: { // Byte 5 - Gears and controls
                40: { mask: 0x01, label: 'Factory remote close signal sent 3 times' },
                41: { mask: 0x02, label: 'Parking gear active' },
                42: { mask: 0x04, label: 'Reverse gear active' },
                43: { mask: 0x08, label: 'Neutral gear active' },
                44: { mask: 0x10, label: 'Drive gear active' },
                45: { mask: 0x20, label: 'Engine lock active' },
                46: { mask: 0x40, label: 'Engine lock request' },
                47: { mask: 0x80, label: 'Factory armed' }
            },
            6: { // Byte 6 - Additional features
                48: { mask: 0x01, label: 'Roof open' }
            }
        };
    }

    /**
     * Parse Security State Flags P4 and return active events
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

                    // Handle multi-value flags (CAN statuses)
                    if (bitMapping.masks && bitMapping.labels) {
                        // Extract 2-bit value for CAN status
                        const value = (byteValue >> bitNum) & 0x03;
                        if (value > 0) { // Only report non-zero values
                            activeEvents.push({
                                event: bitMapping.labels[value],
                                bit: bitNum,
                                byte: byteNum,
                                value: value
                            });
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
            console.error('Error parsing Security State Flags P4:', error);
            return [];
        }
    }

    /**
     * Get human-readable summary of active events
     * @param {number|string} telemetryValue - The bit flag value
     * @returns {string} - Summary of active events
     */
    getSummary(telemetryValue) {
        const events = this.getActiveEvents(telemetryValue);
        if (events.length === 0) {
            return 'No active flags';
        }
        
        return events.map(event => event.event).join(', ');
    }

    /**
     * Check if specific event is active
     * @param {number|string} telemetryValue - The bit flag value
     * @param {string} eventName - Name of event to check
     * @returns {boolean} - True if event is active
     */
    isEventActive(telemetryValue, eventName) {
        const events = this.getActiveEvents(telemetryValue);
        return events.some(event => event.event.toLowerCase().includes(eventName.toLowerCase()));
    }

    /**
     * Validate method that splits 8-byte value into 4B High and 4B Low
     * @param {number|string} telemetryValue - The 8-byte value to split
     * @param {string} label - The telemetry label
     * @returns {Object} - Validation result with split telemetry
     */
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
                eventClassText: hasActiveEvents ? "Security State Flags P4 Event" : undefined,
                eventType: hasActiveEvents ? (activeEvents[0].event || 'Security State Flags P4') : undefined,
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
            console.error('Error processing Security State Flags P4 and split:', error);
            return {
                shouldTriggerEvent: false,
                reason: 'Error processing security state flags and split'
            };
        }
    }
}

module.exports = HandleSecurityStateFlagsP4AndSplit;

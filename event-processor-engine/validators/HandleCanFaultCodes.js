class HandleCanFaultCodes {
    constructor() {
        // Initialize fault code mappings - comprehensive list from codes.txt
        this.faultCodeMappings = this.initializeFaultCodes();
    }

    /**
     * Initialize fault code mappings with descriptions
     * @returns {Object} - Mapping of fault codes to descriptions
     */
    initializeFaultCodes() {
        // Load comprehensive fault code mappings from parsed codes.txt
        const faultCodeMappings = require('../parsed_fault_codes');
        return faultCodeMappings;
    }

    /**
     * Validate fault codes and generate events for active codes
     * @param {string} telemetryValue - Comma-separated fault codes (ASCII)
     * @returns {Object} - Validation result with fault code events
     */
    validate(telemetryValue) {
        try {
            // Handle empty or null values
            if (!telemetryValue || telemetryValue.trim() === '') {
                return {
                    shouldTriggerEvent: false,
                    reason: 'No fault codes present'
                };
            }

            // Parse comma-separated fault codes
            const faultCodes = telemetryValue.split(',')
                .map(code => code.trim().toUpperCase())
                .filter(code => code.length > 0);

            if (faultCodes.length === 0) {
                return {
                    shouldTriggerEvent: false,
                    reason: 'No valid fault codes found'
                };
            }

            // Process each fault code
            const activeFaults = [];
            const unknownFaults = [];

            faultCodes.forEach(code => {
                if (this.faultCodeMappings[code]) {
                    activeFaults.push({
                        code: code,
                        description: this.faultCodeMappings[code]
                    });
                } else {
                    unknownFaults.push({
                        code: code,
                        description: 'Unknown fault code'
                    });
                }
            });

            const allFaults = [...activeFaults, ...unknownFaults];

            return {
                shouldTriggerEvent: true,
                reason: `${allFaults.length} fault code(s) detected`,
                faultCodes: allFaults,
                totalCodes: allFaults.length,
                knownCodes: activeFaults.length,
                unknownCodes: unknownFaults.length,
                rawValue: telemetryValue
            };

        } catch (error) {
            return {
                shouldTriggerEvent: false,
                reason: `Error parsing fault codes: ${error.message}`
            };
        }
    }

    /**
     * Get fault code description
     * @param {string} code - The fault code
     * @returns {string} - Description or default message
     */
    getFaultDescription(code) {
        return this.faultCodeMappings[code] || 'Unknown fault code';
    }

    /**
     * Get all supported fault codes
     * @returns {Array} - Array of supported fault codes
     */
    getSupportedCodes() {
        return Object.keys(this.faultCodeMappings);
    }
}

module.exports = HandleCanFaultCodes;

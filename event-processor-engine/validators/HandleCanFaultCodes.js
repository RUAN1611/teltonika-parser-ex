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
        const faultCodeMappings = require('../../parsed_fault_codes');
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
                        description: this.faultCodeMappings[code],
                        severity: this.determineSeverity(code),
                        category: this.determineCategory(code)
                    });
                } else {
                    unknownFaults.push({
                        code: code,
                        description: 'Unknown fault code',
                        severity: 'medium',
                        category: 'unknown'
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
                rawValue: telemetryValue,
                highestSeverity: this.getHighestSeverity(allFaults)
            };

        } catch (error) {
            return {
                shouldTriggerEvent: false,
                reason: `Error parsing fault codes: ${error.message}`
            };
        }
    }

    /**
     * Determine severity level based on fault code
     * @param {string} code - The fault code
     * @returns {string} - Severity level
     */
    determineSeverity(code) {
        const codeNum = parseInt(code.substring(1));
        const codePrefix = code.charAt(0);
        
        // Critical engine/safety issues - misfires, oil pressure, system voltage, communication
        if (this.isCriticalCode(code, codeNum)) {
            return 'critical';
        }
        
        // High priority issues - fuel, air, ignition, emissions
        if (this.isHighPriorityCode(code, codeNum)) {
            return 'high';
        }
        
        // Medium priority - most other issues
        if (this.isMediumPriorityCode(code, codeNum)) {
            return 'medium';
        }
        
        // Low priority - informational or minor issues
        return 'low';
    }
    
    /**
     * Check if code is critical severity
     * @param {string} code - The fault code
     * @param {number} codeNum - Numeric part of the code
     * @returns {boolean}
     */
    isCriticalCode(code, codeNum) {
        // Misfires (P0300-P0312)
        if (codeNum >= 300 && codeNum <= 312) return true;
        
        // Oil pressure/engine damage (P0520-P0529)
        if (codeNum >= 520 && codeNum <= 529) return true;
        
        // System voltage critical (P0560-P0569)
        if (codeNum >= 560 && codeNum <= 569) return true;
        
        // Communication failures (P0600-P0699)
        if (codeNum >= 600 && codeNum <= 699) return true;
        
        // Transmission critical failures (P0700-P0799)
        if (codeNum >= 700 && codeNum <= 799) return true;
        
        // Network/CAN bus issues (U codes)
        if (code.charAt(0) === 'U') return true;
        
        return false;
    }
    
    /**
     * Check if code is high priority
     * @param {string} code - The fault code
     * @param {number} codeNum - Numeric part of the code
     * @returns {boolean}
     */
    isHighPriorityCode(code, codeNum) {
        // Fuel and air metering (P0100-P0199)
        if (codeNum >= 100 && codeNum <= 199) return true;
        
        // Fuel injector circuits (P0200-P0299)
        if (codeNum >= 200 && codeNum <= 299) return true;
        
        // Ignition system (P0320-P0399 excluding misfires)
        if (codeNum >= 320 && codeNum <= 399 && !(codeNum >= 300 && codeNum <= 312)) return true;
        
        // Emission controls (P0400-P0499)
        if (codeNum >= 400 && codeNum <= 499) return true;
        
        // Vehicle speed, idle control (P0500-P0519)
        if (codeNum >= 500 && codeNum <= 519) return true;
        
        // Body control issues (B codes - high priority)
        if (code.charAt(0) === 'B' && codeNum >= 1000) return true;
        
        return false;
    }
    
    /**
     * Check if code is medium priority
     * @param {string} code - The fault code
     * @param {number} codeNum - Numeric part of the code
     * @returns {boolean}
     */
    isMediumPriorityCode(code, codeNum) {
        // Most P codes not covered by critical/high
        if (code.charAt(0) === 'P') return true;
        
        // Chassis codes (C codes)
        if (code.charAt(0) === 'C') return true;
        
        // Body codes (B codes) - lower priority
        if (code.charAt(0) === 'B' && codeNum < 1000) return true;
        
        return false;
    }

    /**
     * Determine category based on fault code
     * @param {string} code - The fault code
     * @returns {string} - Category
     */
    determineCategory(code) {
        const codePrefix = code.charAt(0);
        const codeNum = parseInt(code.substring(1));
        
        // P-codes (Powertrain)
        if (codePrefix === 'P') {
            if (codeNum >= 0 && codeNum <= 99) return 'fuel_air_metering';
            if (codeNum >= 100 && codeNum <= 199) return 'fuel_air_metering';
            if (codeNum >= 200 && codeNum <= 299) return 'fuel_injector';
            if (codeNum >= 300 && codeNum <= 399) return 'ignition_misfire';
            if (codeNum >= 400 && codeNum <= 499) return 'emission_control';
            if (codeNum >= 500 && codeNum <= 599) return 'speed_idle_auxiliary';
            if (codeNum >= 600 && codeNum <= 699) return 'computer_auxiliary';
            if (codeNum >= 700 && codeNum <= 799) return 'transmission';
            if (codeNum >= 800 && codeNum <= 899) return 'hybrid_propulsion';
            if (codeNum >= 1000 && codeNum <= 1999) return 'manufacturer_specific';
            if (codeNum >= 2000 && codeNum <= 2999) return 'manufacturer_specific';
            if (codeNum >= 3000 && codeNum <= 3399) return 'manufacturer_specific';
            return 'powertrain_other';
        }
        
        // B-codes (Body)
        if (codePrefix === 'B') {
            if (codeNum >= 0 && codeNum <= 999) return 'body_generic';
            if (codeNum >= 1000 && codeNum <= 1999) return 'body_manufacturer';
            if (codeNum >= 2000 && codeNum <= 2999) return 'body_manufacturer';
            if (codeNum >= 3000 && codeNum <= 3999) return 'body_manufacturer';
            return 'body_other';
        }
        
        // C-codes (Chassis)
        if (codePrefix === 'C') {
            if (codeNum >= 0 && codeNum <= 999) return 'chassis_generic';
            if (codeNum >= 1000 && codeNum <= 1999) return 'chassis_manufacturer';
            if (codeNum >= 2000 && codeNum <= 2999) return 'chassis_manufacturer';
            if (codeNum >= 3000 && codeNum <= 3999) return 'chassis_manufacturer';
            return 'chassis_other';
        }
        
        // U-codes (Network/Communication)
        if (codePrefix === 'U') {
            if (codeNum >= 0 && codeNum <= 999) return 'network_generic';
            if (codeNum >= 1000 && codeNum <= 1999) return 'network_manufacturer';
            if (codeNum >= 2000 && codeNum <= 2999) return 'network_manufacturer';
            if (codeNum >= 3000 && codeNum <= 3999) return 'network_manufacturer';
            return 'network_other';
        }
        
        return 'unknown';
    }

    /**
     * Get the highest severity from a list of faults
     * @param {Array} faults - Array of fault objects
     * @returns {string} - Highest severity level
     */
    getHighestSeverity(faults) {
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'info': 0 };
        let highest = 'info';
        
        faults.forEach(fault => {
            if (severityOrder[fault.severity] > severityOrder[highest]) {
                highest = fault.severity;
            }
        });
        
        return highest;
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

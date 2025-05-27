'use strict';

const SignalLowEvent = require('./validators/SignalLowEvent');
const HandleBleTemp = require('./validators/HandleBleTemp');
const HandleAlarm = require('./validators/HandleAlarm');
const HandleBitFlagSplit = require('./validators/HandleBitFlagSplit');
const HandleBleHumidity = require('./validators/HandleBleHumidity');
const HandleCanFaultCodes = require('./validators/HandleCanFaultCodes');
const HandleDallasTemperature4B = require('./validators/HandleDallasTemperature4B');
const HandleDoorStatus = require('./validators/HandleDoorStatus');
const HandleDrivingState = require('./validators/HandleDrivingState');
const HandleGreenDrivingType = require('./validators/HandleGreenDrivingType');
const HandleIgnition = require('./validators/HandleIgnition');
const HandleMovement = require('./validators/HandleMovement');
const HandleTripStatus = require('./validators/HandleTripStatus');
const HandleUnplugStatus = require('./validators/HandleUnplugStatus');
const HandleManDown = require('./validators/HandleManDown');
const HandleTowDigital = require('./validators/HandleTowDigital');
const HandleGsmJammingEvent = require('./validators/HandleGsmJammingEvent');
const HandleCrashData = require('./validators/HandleCrashData');
const HandleMilTime = require('./validators/HandleMilTime');
const HandleEco = require('./validators/HandleEco');
/**
 * Simple validation engine that processes telemetry data and adds events
 */
class ValidationEngine {
    constructor() {
        // Registry of available validators
        this.validators = {
            'SignalLowEvent': new SignalLowEvent(),
            'HandleBleTemp': new HandleBleTemp(),
            'HandleAlarm': new HandleAlarm(),
            'HandleBitFlagSplit': new HandleBitFlagSplit(),
            'HandleBleHumidity': new HandleBleHumidity(),
            'HandleCanFaultCodes': new HandleCanFaultCodes(),
            'HandleDallasTemperature4B': new HandleDallasTemperature4B(),
            'HandleDoorStatus': new HandleDoorStatus(),
            'HandleDrivingState': new HandleDrivingState(),
            'HandleGreenDrivingType': new HandleGreenDrivingType(),
            'HandleIgnition': new HandleIgnition(),
            'HandleMovement': new HandleMovement(),
            'HandleTripStatus': new HandleTripStatus(),
            'HandleUnplugStatus': new HandleUnplugStatus(),
            'HandleManDown': new HandleManDown(),
            'HandleTowDigital': new HandleTowDigital(),
            'HandleGsmJammingEvent': new HandleGsmJammingEvent(),
            'HandleCrashData': new HandleCrashData(),
            'HandleMilTime': new HandleMilTime(),
            'HandleEco': new HandleEco()
        };
    }

    /**
     * Process telemetry data and add events where validation passes
     * @param {Object} avlData - The parsed AVL data from codec
     * @param {Object} protocolElements - Protocol elements with event definitions
     * @returns {Object} - AVL data with events added
     */
    processEvents(avlData, protocolElements) {
        if (!avlData.records || !Array.isArray(avlData.records)) {
            return avlData;
        }

        // Process each record
        avlData.records.forEach(record => {
            if (!record.ioElements || !Array.isArray(record.ioElements)) {
                return;
            }

            // Initialize events array if not exists
            if (!record.events) {
                record.events = [];
            }

            // Check each IO element for event validation
            record.ioElements.forEach(ioElement => {
                const protocolKey = `data::io::${ioElement.id}`;
                const protocolElement = protocolElements[protocolKey];

                // Check if this IO element has an event processor defined
                if (protocolElement && protocolElement.event) {
                    const eventType = protocolElement.event;
                    const validator = this.validators[eventType];

                    if (validator) {
                        try {
                            let validationResult;
                            
                            // Special handling for HandleBitFlagSplit
                            if (eventType === 'HandleBitFlagSplit') {
                                // Determine flag type from the IO element label
                                const flagType = this.determineFlagType(ioElement.label);
                                validationResult = validator.validate(ioElement.value, flagType);
                                
                                // Handle multiple flag events
                                if (validationResult.shouldTriggerEvent && validationResult.activeFlags) {
                                    validationResult.activeFlags.forEach(flag => {
                                        const event = {
                                            event_type: `${eventType}_${flag.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
                                            avl_id: ioElement.id,
                                            trigger_value: ioElement.value,
                                            label: ioElement.label,
                                            reason: `Flag active: ${flag.label}`,
                                            timestamp: record.created_on,
                                            flag_type: validationResult.flagType,
                                            bit_position: flag.bit,
                                            byte_position: flag.byte,
                                            bit_mask: flag.hexMask,
                                            flag_label: flag.label,
                                            raw_value: validationResult.rawValue,
                                            hex_value: validationResult.hexValue
                                        };

                                        record.events.push(event);
                                    });
                                }
                            } else if (eventType === 'HandleCanFaultCodes') {
                                // Special handling for CAN fault codes
                                validationResult = validator.validate(ioElement.value);
                                
                                // Handle multiple fault code events
                                if (validationResult.shouldTriggerEvent && validationResult.faultCodes) {
                                    validationResult.faultCodes.forEach(fault => {
                                        const event = {
                                            event_type: `${eventType}_${fault.code}`,
                                            avl_id: ioElement.id,
                                            trigger_value: ioElement.value,
                                            label: ioElement.label,
                                            reason: `Fault code active: ${fault.code} - ${fault.description}`,
                                            timestamp: record.created_on,
                                            fault_code: fault.code,
                                            fault_description: fault.description,
                                            total_codes: validationResult.totalCodes,
                                            known_codes: validationResult.knownCodes,
                                            unknown_codes: validationResult.unknownCodes,
                                            raw_value: validationResult.rawValue
                                        };

                                        record.events.push(event);
                                    });
                                }
                            } else {
                                // Standard validation for other event types
                                validationResult = validator.validate(ioElement.value);

                                // If validation passes, add event to record
                                if (validationResult.shouldTriggerEvent) {
                                    const event = {
                                        event_type: eventType,
                                        avl_id: ioElement.id,
                                        trigger_value: ioElement.value,
                                        label: ioElement.label,
                                        reason: validationResult.reason,
                                        timestamp: record.created_on,
                                        ...validationResult // Include any additional validation data
                                    };

                                    // Remove shouldTriggerEvent from the event object
                                    delete event.shouldTriggerEvent;

                                    record.events.push(event);
                                }
                            }
                        } catch (error) {
                            console.warn(`Validation error for ${eventType} on AVL ID ${ioElement.id}:`, error.message);
                        }
                    } else {
                        console.warn(`Validator not found for event type: ${eventType}`);
                    }
                }
            });
        });

        return avlData;
    }

    /**
     * Add a new validator to the registry
     * @param {string} eventType - The event type name
     * @param {Object} validator - The validator instance
     */
    addValidator(eventType, validator) {
        this.validators[eventType] = validator;
    }

    /**
     * Get list of available validators
     * @returns {Array} - Array of validator names
     */
    getAvailableValidators() {
        return Object.keys(this.validators);
    }

    /**
     * Determine flag type based on the IO element label
     * @param {string} label - The IO element label
     * @returns {string} - The determined flag type
     */
    determineFlagType(label) {
        // Map IO element labels to flag types based on protocol definitions
        const labelToFlagType = {
            'controlstateflags_p4': 'controlstateflags_p4',
            'control_state_flags': 'controlstateflags_p2',
            'indicatorstateflags_p4': 'indicatorstateflags_p4',
            'securitystateflags_p4': 'securitystateflags_p4',
            'security_state_flags': 'securitystateflags_p2',
            'agriculturalstateflags_p4': 'agriculturalstateflags_p4',
            'agricultural_machinery_flags': 'agriculturalstateflags_p2',
            'utilitystateflags_p4': 'utilitystateflags_p4',
            'cisternstateflags_p4': 'cisternstateflags_p4',
            'fmcan_control_state_flags': 'controlstateflags_p4'
        };

        // Return the mapped flag type or default to controlstateflags_p4
        return labelToFlagType[label] || 'controlstateflags_p4';
    }
}

module.exports = ValidationEngine; 
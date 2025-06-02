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
const HandleOverspeed = require('./validators/HandleOverspeed');
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
            'HandleEco': new HandleEco(),
            'HandleOverspeed': new HandleOverspeed()
        };
    }

    /**
     * Process telemetry data and add events where validation passes
     * @param {Object} avlData - The parsed AVL data from codec
     * @param {Object} protocolElements - Protocol elements with event definitions
     * @param {Object} previousValues - Previous values object to track state changes
     * @returns {Object} - AVL data with events added
     */
    processEvents(avlData, protocolElements, previousValues = {}) {
        console.log('ValidationEngine.processEvents called');
        console.log('Protocol elements available:', Object.keys(protocolElements).length);
        
        if (!avlData.records || !Array.isArray(avlData.records)) {
            console.log('No records found in AVL data');
            return avlData;
        }

        console.log('Processing', avlData.records.length, 'records');

        // Process each record
        avlData.records.forEach((record, recordIndex) => {
            console.log(`Processing record ${recordIndex}`);
            
            if (!record.ioElements || !Array.isArray(record.ioElements)) {
                console.log(`Record ${recordIndex} has no ioElements`);
                return;
            }

            console.log(`Record ${recordIndex} has ${record.ioElements.length} IO elements`);

            // Initialize events array if not exists
            if (!record.events) {
                record.events = [];
            }

            // Check each IO element for event validation
            record.ioElements.forEach((ioElement, ioIndex) => {
                const protocolKey = `telemetry::io::${ioElement.id}`;
                const protocolElement = protocolElements[protocolKey];

                // Check if this IO element has an event processor defined
                if (protocolElement && protocolElement.event) {
                    const eventType = protocolElement.event;
                    const validator = this.validators[eventType];

                    console.log(`Event type: ${eventType}, Validator found: ${!!validator}`);

                    if (validator) {
                        try {
                            const previousValue = previousValues[ioElement.id] !== undefined ? previousValues[ioElement.id] : null;
                            console.log(`Previous value for IO ${ioElement.id}: ${previousValue}`);
                            // Standard validation for all event types
                            console.log(`Validating ${eventType} with value: ${ioElement.value}`);
                            const validationResult = validator.validate(ioElement.value, previousValue, protocolElement.label);
                            console.log(`Validation result:`, validationResult);

                            // If validation passes, add event to record
                            if (validationResult.shouldTriggerEvent) {
                                const event = {
                                    eventClass: "triggeredevent",
                                    ...validationResult
                                };

                                // Remove shouldTriggerEvent from the event object
                                delete event.shouldTriggerEvent;

                                console.log(`Adding event:`, event);
                                record.events.push(event);
                            }
                        } catch (error) {
                            console.warn(`Validation error for ${eventType} on AVL ID ${ioElement.id}:`, error.message);
                        }
                    } else {
                        console.warn(`Validator not found for event type: ${eventType}`);
                    }
                } else {
                    console.log(`No event defined for IO element ${ioElement.id}`);
                }
                
                // Update previous values with current value for next record/call
                // Only update if this IO element has an event processor defined
                if (protocolElement && protocolElement.event) {
                    previousValues[ioElement.id] = ioElement.value;
                    console.log(`Updated previous value for IO ${ioElement.id} to: ${ioElement.value}`);
                }
            });
        });

        console.log('Event processing completed');
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
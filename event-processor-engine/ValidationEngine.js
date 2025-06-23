'use strict';

const SignalLowEvent = require('./validators/SignalLowEvent');
const HandleBleTemp = require('./validators/HandleBleTemp');
const HandleAlarm = require('./validators/HandleAlarm');
const HandleBitFlagSplit = require('./validators/HandleBitFlagSplit');
const HandleBleHumidity = require('./validators/HandleBleHumidity');
const HandleCanFaultCodes = require('./validators/HandleCanFaultCodes');
const HandleCrashTrace = require('./validators/HandleCrashTrace');
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
const HandleTimeStamp = require('./validators/HandleTimeStamp');
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
            'HandleCrashTrace': new HandleCrashTrace(),
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
            'HandleOverspeed': new HandleOverspeed(),
            'HandleTimeStamp': new HandleTimeStamp()
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
            console.log('No records found in AVL data');
            return avlData;
        }
        // Process each record
        avlData.records.forEach((record, recordIndex) => {
            
            if (!record.ioElements || !Array.isArray(record.ioElements)) {
                console.log(`Record ${recordIndex} has no ioElements`);
                return;
            }

            // Collect validation results first
            const validationResults = [];
            const telemetryToRemove = new Set(); // Track which telemetry elements should be removed
            
            record.ioElements.forEach((ioElement, ioIndex) => {
                const protocolKey = `telemetry::io::${ioElement.id}`;
                const protocolElement = protocolElements[protocolKey];

                // Check if this IO element has an event processor defined
                if (protocolElement && protocolElement.event) {
                    const eventType = protocolElement.event;
                    const validator = this.validators[eventType];

                    if (validator) {
                        try {
                            // Standard validation for all event types
                            const validationResult = validator.validate(ioElement.value, protocolElement.label);
                            
                            // Check if this telemetry should be removed
                            if (validationResult.removeTelemetry) {
                                telemetryToRemove.add(ioIndex);
                            }
                            
                            // Store validation result with context
                            validationResults.push({
                                ioElement,
                                validationResult,
                                protocolElement,
                                ioIndex
                            });
                        } catch (error) {
                            console.warn(`Validation error for ${eventType} on AVL ID ${ioElement.id}:`, error.message);
                        }
                    }
                }
            });

            // Remove telemetry elements that should be excluded
            if (telemetryToRemove.size > 0) {
                // Convert Set to Array and sort in descending order to avoid index shifting issues
                const indicesToRemove = Array.from(telemetryToRemove).sort((a, b) => b - a);
                
                indicesToRemove.forEach(index => {
                    const removedElement = record.ioElements.splice(index, 1)[0];
                    console.log(`Removed telemetry element ID ${removedElement.id} (${removedElement.label}) due to error code: ${removedElement.value}`);
                });
            }

            // First: Process additional telemetry columns
            validationResults.forEach(({ validationResult }) => {
                if (validationResult.eventAdditionalTelemetryColumn) {
                    // Add the additional telemetry column as a direct property of the record
                    record[validationResult.eventAdditionalTelemetryColumn] = validationResult.eventValue;
                }
                if (validationResult.eventAdditionalTelemetryColumns) {
                    // Add the additional telemetry columns as a direct property of the record
                    validationResult.eventAdditionalTelemetryColumns.forEach((column) => {
                        record[column.columnName] = column.value;
                    });
                }
            });

            // Initialize events array if not exists
            if (!record.events) {
                record.events = [];
            }

            // Second: Process events
            validationResults.forEach(({ validationResult }) => {
                if (validationResult.shouldTriggerEvent) {
                    const event = {
                        eventClass: "triggeredevent",
                        ...validationResult
                    };

                    // Remove shouldTriggerEvent and removeTelemetry from the event object
                    delete event.shouldTriggerEvent;
                    delete event.removeTelemetry;

                    record.events.push(event);
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

    /**
     * Create a validation result that indicates telemetry should be removed
     * @param {string} eventClassText - The event class text
     * @param {string} eventType - The event type
     * @param {string} eventTelemetry - The telemetry label
     * @param {any} eventValue - The telemetry value
     * @returns {Object} - Validation result with removeTelemetry flag
     */
    createRemoveTelemetryResult(eventClassText, eventType, eventTelemetry, eventValue) {
        return {
            shouldTriggerEvent: true,
            eventClassText: eventClassText,
            eventType: eventType,
            eventTelemetry: eventTelemetry,
            eventValue: eventValue,
            removeTelemetry: true
        };
    }

    /**
     * Create a validation result that indicates telemetry should be removed with additional telemetry column
     * @param {string} eventClassText - The event class text
     * @param {string} eventType - The event type
     * @param {string} eventTelemetry - The telemetry label
     * @param {any} eventValue - The telemetry value
     * @param {string} additionalColumnName - The additional telemetry column name
     * @param {any} additionalColumnValue - The additional telemetry column value
     * @returns {Object} - Validation result with removeTelemetry flag and additional column
     */
    createRemoveTelemetryResultWithAdditionalColumn(eventClassText, eventType, eventTelemetry, eventValue, additionalColumnName, additionalColumnValue) {
        return {
            shouldTriggerEvent: true,
            eventClassText: eventClassText,
            eventType: eventType,
            eventTelemetry: eventTelemetry,
            eventValue: eventValue,
            removeTelemetry: true,
            eventAdditionalTelemetryColumn: additionalColumnName,
            eventValue: additionalColumnValue
        };
    }
}

module.exports = ValidationEngine; 
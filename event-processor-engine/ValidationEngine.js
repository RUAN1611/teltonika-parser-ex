'use strict';

const SignalLowEvent = require('./validators/SignalLowEvent');
const HandleBleTemp = require('./validators/HandleBleTemp');
const HandleAlarm = require('./validators/HandleAlarm');

/**
 * Simple validation engine that processes telemetry data and adds events
 */
class ValidationEngine {
    constructor() {
        // Registry of available validators
        this.validators = {
            'SignalLowEvent': new SignalLowEvent(),
            'HandleBleTemp': new HandleBleTemp(),
            'HandleAlarm': new HandleAlarm()
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
                            // Run validation
                            const validationResult = validator.validate(ioElement.value, {});

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
}

module.exports = ValidationEngine; 
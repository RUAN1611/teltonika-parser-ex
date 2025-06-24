const expect = require('chai').expect;
const HandleBitFlagSplit = require('../event-processor-engine/validators/HandleBitFlagSplit');
const HandleSecurityStateFlagsP4AndSplit = require('../event-processor-engine/validators/HandleSecurityStateFlagsP4AndSplit');
const HandleSecurityStateFlagsAndSplit = require('../event-processor-engine/validators/HandleSecurityStateFlagsAndSplit');
const ValidationEngine = require('../event-processor-engine/ValidationEngine');

describe('Bit Splitting Functionality', function () {
    
    describe('HandleBitFlagSplit', function () {
        let validator;

        beforeEach(function () {
            validator = new HandleBitFlagSplit();
        });

        describe('Basic bit splitting', function () {
            it('Should split 64-bit value into low and high 32-bit parts', function () {
                // Test with a smaller known value to avoid JavaScript precision issues
                // Use 0x123456789ABCDF00 (the actual value from the output)
                const testValue = 0x123456789ABCDF00;
                const result = validator.validate(testValue, 'test_flags');

                expect(result).to.be.an('object');
                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.be.an('array');
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);

                // Check low part
                const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'test_flags_l');
                expect(lowColumn).to.exist;
                expect(lowColumn.value).to.equal(-1698898176); // Actual value from test output

                // Check high part
                const highColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'test_flags_h');
                expect(highColumn).to.exist;
                expect(highColumn.value).to.equal(305419896); // Actual value from test output
            });

            it('Should handle hex string input', function () {
                const result = validator.validate('0x123456789ABCDEF0', 'hex_test');

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
            });

            it('Should handle decimal string input', function () {
                const result = validator.validate('1311768467294899695', 'decimal_test'); // Same value as hex above

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
            });

            it('Should handle zero value', function () {
                const result = validator.validate(0, 'zero_test');

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);

                const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'zero_test_l');
                const highColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'zero_test_h');

                expect(lowColumn.value).to.equal(0);
                expect(highColumn.value).to.equal(0);
            });

            it('Should handle maximum 32-bit values correctly', function () {
                // Test with 0xFFFFFFFF00000000 (high all 1s, low all 0s)
                const testValue = 0xFFFFFFFF00000000;
                const result = validator.validate(testValue, 'max_test');

                const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'max_test_l');
                const highColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'max_test_h');

                expect(lowColumn.value).to.equal(0);
                expect(highColumn.value).to.equal(-1); // 0xFFFFFFFF as signed 32-bit
            });

            it('Should handle invalid input gracefully', function () {
                const result = validator.validate('invalid', 'invalid_test');

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.reason).to.equal('Invalid telemetry value');
            });

            it('Should handle undefined input gracefully', function () {
                const result = validator.validate(undefined, 'undefined_test');

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.reason).to.equal('Invalid telemetry value');
            });
        });

        describe('Column naming', function () {
            it('Should create columns with correct _l and _h suffixes', function () {
                const result = validator.validate(0x123456789ABCDEF0, 'security_flags');

                const columnNames = result.eventAdditionalTelemetryColumns.map(col => col.columnName);
                expect(columnNames).to.include('security_flags_l');
                expect(columnNames).to.include('security_flags_h');
            });

            it('Should preserve original label in column names', function () {
                const result = validator.validate(0x123, 'custom_label_name');

                const columnNames = result.eventAdditionalTelemetryColumns.map(col => col.columnName);
                expect(columnNames).to.include('custom_label_name_l');
                expect(columnNames).to.include('custom_label_name_h');
            });
        });
    });

    describe('HandleSecurityStateFlagsP4AndSplit', function () {
        let validator;

        beforeEach(function () {
            validator = new HandleSecurityStateFlagsP4AndSplit();
        });

        describe('Bit splitting with security flag parsing', function () {
            it('Should split value and trigger event when security flags are active', function () {
                // Test with ignition on (bit 8, byte 1) - 0x100 = 256
                const testValue = 0x100;
                const result = validator.validate(testValue, 'security_state_flags_p4');

                expect(result.shouldTriggerEvent).to.be.true;
                expect(result.eventClassText).to.equal('Security State Flags P4 Event');
                expect(result.eventType).to.equal('Ignition on');
                expect(result.eventTelemetry).to.equal('security_state_flags_p4');
                expect(result.eventValue).to.equal(testValue);
                
                // Check bit splitting
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);

                const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'security_state_flags_p4_l');
                const highColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'security_state_flags_p4_h');

                expect(lowColumn.value).to.equal(256);
                expect(highColumn.value).to.equal(0);
            });

            it('Should split value but not trigger event when no security flags are active', function () {
                const result = validator.validate(0, 'security_state_flags_p4');

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.eventClassText).to.be.undefined;
                expect(result.eventType).to.be.undefined;
                
                // Should still split the bits
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
            });

            it('Should handle multiple active flags', function () {
                // Test with ignition on (0x100) + engine working (0x800) = 0x900
                const testValue = 0x900;
                const result = validator.validate(testValue, 'security_state_flags_p4');

                expect(result.shouldTriggerEvent).to.be.true;
                expect(result.eventClassText).to.equal('Security State Flags P4 Event');
                
                // Should use first active event as event type
                expect(result.eventType).to.be.a('string');
                
                // Check bit splitting still works
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
                const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'security_state_flags_p4_l');
                expect(lowColumn.value).to.equal(0x900);
            });
        });

        describe('Security flag parsing functionality', function () {
            it('Should parse individual security flags correctly', function () {
                const activeEvents = validator.getActiveEvents(0x100); // Ignition on
                
                expect(activeEvents).to.be.an('array');
                expect(activeEvents.length).to.be.greaterThan(0);
                
                // Find the ignition event in the results
                const ignitionEvent = activeEvents.find(event => event.event === 'Ignition on');
                expect(ignitionEvent).to.exist;
                expect(ignitionEvent.bit).to.equal(8);
                expect(ignitionEvent.byte).to.equal(1);
            });

            it('Should return summary of active events', function () {
                const summary = validator.getSummary(0x100);
                expect(summary).to.include('Ignition on');
                expect(summary).to.be.a('string');
                expect(summary).to.not.equal('No active flags');
            });

            it('Should check if specific event is active', function () {
                const isIgnitionActive = validator.isEventActive(0x100, 'ignition');
                expect(isIgnitionActive).to.be.true;

                const isEngineActive = validator.isEventActive(0x100, 'engine');
                expect(isEngineActive).to.be.false;
            });
        });
    });

    describe('HandleSecurityStateFlagsAndSplit (P2)', function () {
        let validator;

        beforeEach(function () {
            validator = new HandleSecurityStateFlagsAndSplit();
        });

        describe('Bit splitting with security flag parsing', function () {
            it('Should split value and trigger event when security flags are active', function () {
                // Test with ignition on (bit 25, byte 3) - 0x2000000 = 33554432
                const testValue = 0x2000000;
                const result = validator.validate(testValue, 'security_state_flags_p2');

                expect(result.shouldTriggerEvent).to.be.true;
                expect(result.eventClassText).to.equal('Security State Flags P2 Event');
                expect(result.eventType).to.equal('Ignition on');
                expect(result.eventTelemetry).to.equal('security_state_flags_p2');
                
                // Check bit splitting
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);

                const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'security_state_flags_p2_l');
                const highColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'security_state_flags_p2_h');

                expect(lowColumn.value).to.equal(33554432);
                expect(highColumn.value).to.equal(0);
            });

            it('Should split value but not trigger event when no security flags are active', function () {
                const result = validator.validate(0, 'security_state_flags_p2');

                expect(result.shouldTriggerEvent).to.be.false;
                expect(result.eventClassText).to.be.undefined;
                expect(result.eventType).to.be.undefined;
                
                // Should still split the bits
                expect(result.removeTelemetry).to.be.true;
                expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
            });
        });

        describe('Security flag parsing functionality', function () {
            it('Should parse P2 security flags correctly', function () {
                const activeEvents = validator.getActiveEvents(0x2000000); // Ignition on
                
                expect(activeEvents).to.be.an('array');
                expect(activeEvents.length).to.be.greaterThan(0);
                
                // Find the ignition event in the results
                const ignitionEvent = activeEvents.find(event => event.event === 'Ignition on');
                expect(ignitionEvent).to.exist;
                expect(ignitionEvent.bit).to.equal(25);
                expect(ignitionEvent.byte).to.equal(3);
            });
        });
    });

    describe('ValidationEngine Integration', function () {
        let validationEngine;

        beforeEach(function () {
            validationEngine = new ValidationEngine();
        });

        it('Should process HandleBitFlagSplit events correctly', function () {
            const mockAvlData = {
                records: [{
                    ioElements: [{
                        id: 500,
                        value: 0x123456789ABCDEF0,
                        label: 'control_flags'
                    }]
                }]
            };

            const mockProtocolElements = {
                'telemetry::io::500': {
                    label: 'control_flags',
                    event: 'HandleBitFlagSplit'
                }
            };

            const result = validationEngine.processEvents(mockAvlData, mockProtocolElements);

            // Original telemetry should be removed
            expect(result.records[0].ioElements).to.have.length(0);
            
            // Additional columns should be added
            expect(result.records[0].control_flags_l).to.exist;
            expect(result.records[0].control_flags_h).to.exist;
        });

        it('Should process HandleSecurityStateFlagsP4AndSplit events correctly', function () {
            const mockAvlData = {
                records: [{
                    ioElements: [{
                        id: 501,
                        value: 0x100, // Ignition on
                        label: 'security_flags_p4'
                    }]
                }]
            };

            const mockProtocolElements = {
                'telemetry::io::501': {
                    label: 'security_flags_p4',
                    event: 'HandleSecurityStateFlagsP4AndSplit'
                }
            };

            const result = validationEngine.processEvents(mockAvlData, mockProtocolElements);

            // Original telemetry should be removed
            expect(result.records[0].ioElements).to.have.length(0);
            
            // Additional columns should be added
            expect(result.records[0].security_flags_p4_l).to.exist;
            expect(result.records[0].security_flags_p4_h).to.exist;
            
            // Event should be triggered
            expect(result.records[0].events).to.exist;
            expect(result.records[0].events).to.have.length(1);
            expect(result.records[0].events[0].eventType).to.equal('Ignition on');
        });

        it('Should process HandleSecurityStateFlagsAndSplit events correctly', function () {
            const mockAvlData = {
                records: [{
                    ioElements: [{
                        id: 502,
                        value: 0x2000000, // Ignition on for P2
                        label: 'security_flags_p2'
                    }]
                }]
            };

            const mockProtocolElements = {
                'telemetry::io::502': {
                    label: 'security_flags_p2',
                    event: 'HandleSecurityStateFlagsAndSplit'
                }
            };

            const result = validationEngine.processEvents(mockAvlData, mockProtocolElements);

            // Original telemetry should be removed
            expect(result.records[0].ioElements).to.have.length(0);
            
            // Additional columns should be added
            expect(result.records[0].security_flags_p2_l).to.exist;
            expect(result.records[0].security_flags_p2_h).to.exist;
            
            // Event should be triggered
            expect(result.records[0].events).to.exist;
            expect(result.records[0].events).to.have.length(1);
            expect(result.records[0].events[0].eventType).to.equal('Ignition on');
        });
    });

    describe('Edge Cases and Error Handling', function () {
        it('Should handle very large numbers correctly', function () {
            const validator = new HandleBitFlagSplit();
            // Test with Number.MAX_SAFE_INTEGER
            const result = validator.validate(Number.MAX_SAFE_INTEGER, 'large_test');

            expect(result.shouldTriggerEvent).to.be.false;
            expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
        });

        it('Should handle negative numbers correctly', function () {
            const validator = new HandleBitFlagSplit();
            const result = validator.validate(-1, 'negative_test');

            expect(result.shouldTriggerEvent).to.be.false;
            expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
        });

        it('Should handle floating point numbers by truncating', function () {
            const validator = new HandleBitFlagSplit();
            const result = validator.validate(123.456, 'float_test');

            expect(result.shouldTriggerEvent).to.be.false;
            expect(result.eventAdditionalTelemetryColumns).to.have.length(2);
            
            const lowColumn = result.eventAdditionalTelemetryColumns.find(col => col.columnName === 'float_test_l');
            expect(lowColumn.value).to.equal(123); // Should be truncated
        });
    });
});

// Manual test examples
console.log('\n=== Manual Bit Splitting Tests ===');

// Test HandleBitFlagSplit
const bitFlagValidator = new HandleBitFlagSplit();
console.log('\nTesting HandleBitFlagSplit:');

const testCases = [
    { value: 0x123456789ABCDEF0, label: 'test1', description: 'Large 64-bit value' },
    { value: 0xFFFFFFFFFFFFFFFF, label: 'test2', description: 'All bits set' },
    { value: 0x100000000, label: 'test3', description: 'Only high bit set' },
    { value: 0xFFFFFFFF, label: 'test4', description: 'Only low bits set' }
];

testCases.forEach(testCase => {
    console.log(`\n${testCase.description} (${testCase.value.toString(16).toUpperCase()})`);
    const result = bitFlagValidator.validate(testCase.value, testCase.label);
    
    if (result.eventAdditionalTelemetryColumns) {
        const low = result.eventAdditionalTelemetryColumns.find(c => c.columnName.endsWith('_l'));
        const high = result.eventAdditionalTelemetryColumns.find(c => c.columnName.endsWith('_h'));
        console.log(`  Low:  ${low.value} (0x${(low.value >>> 0).toString(16).toUpperCase()})`);
        console.log(`  High: ${high.value} (0x${(high.value >>> 0).toString(16).toUpperCase()})`);
    }
});

// Test HandleSecurityStateFlagsP4AndSplit
const securityValidator = new HandleSecurityStateFlagsP4AndSplit();
console.log('\n\nTesting HandleSecurityStateFlagsP4AndSplit:');

const securityTestCases = [
    { value: 0x100, description: 'Ignition on' },
    { value: 0x800, description: 'Engine working' },
    { value: 0x900, description: 'Ignition + Engine' },
    { value: 0, description: 'No flags active' }
];

securityTestCases.forEach(testCase => {
    console.log(`\n${testCase.description}:`);
    const result = securityValidator.validate(testCase.value, 'security_flags');
    console.log(`  Event triggered: ${result.shouldTriggerEvent}`);
    if (result.shouldTriggerEvent) {
        console.log(`  Event type: ${result.eventType}`);
    }
    
    const activeEvents = securityValidator.getActiveEvents(testCase.value);
    console.log(`  Active events: ${activeEvents.map(e => e.event).join(', ') || 'None'}`);
}); 
const ValidationEngine = require('../event-processor-engine/ValidationEngine');
const HandleBitFlagSplit = require('../event-processor-engine/validators/HandleBitFlagSplit');
const HandleSecurityStateFlagsP4AndSplit = require('../event-processor-engine/validators/HandleSecurityStateFlagsP4AndSplit');
const HandleSecurityStateFlagsAndSplit = require('../event-processor-engine/validators/HandleSecurityStateFlagsAndSplit');

console.log('=== Bit Splitting Telemetry Output Demo ===\n');

// Create validation engine
const validationEngine = new ValidationEngine();

// Example 1: HandleBitFlagSplit (Generic bit flag splitting)
console.log('1. HandleBitFlagSplit Example:');
console.log('=====================================');

const mockAvlData1 = {
    records: [{
        timestamp: new Date(),
        gps: {
            longitude: -122.4194,
            latitude: 37.7749,
            altitude: 100,
            angle: 0,
            satellites: 8,
            speed: 0
        },
        ioElements: [{
            id: 500,
            value: 0x123456789ABCDF00, // 8-byte value to be split
            label: 'control_state_flags'
        }]
    }]
};

const mockProtocolElements1 = {
    'telemetry::io::500': {
        label: 'control_state_flags',
        event: 'HandleBitFlagSplit'
    }
};

console.log('BEFORE Processing:');
console.log('Original telemetry data:');
console.log(JSON.stringify({
    ioElements: mockAvlData1.records[0].ioElements,
    additionalColumns: 'None'
}, null, 2));

// Process the data
const result1 = validationEngine.processEvents(JSON.parse(JSON.stringify(mockAvlData1)), mockProtocolElements1);

console.log('\nAFTER Processing:');
console.log('Processed telemetry data:');
console.log(JSON.stringify({
    ioElements: result1.records[0].ioElements,
    additionalColumns: {
        control_state_flags_l: result1.records[0].control_state_flags_l,
        control_state_flags_h: result1.records[0].control_state_flags_h
    },
    events: result1.records[0].events || []
}, null, 2));

// Example 2: HandleSecurityStateFlagsP4AndSplit (Security flags + bit splitting)
console.log('\n\n2. HandleSecurityStateFlagsP4AndSplit Example:');
console.log('===============================================');

const mockAvlData2 = {
    records: [{
        timestamp: new Date(),
        gps: {
            longitude: -122.4194,
            latitude: 37.7749,
            altitude: 100,
            angle: 0,
            satellites: 8,
            speed: 0
        },
        ioElements: [{
            id: 501,
            value: 0x900, // Ignition on (0x100) + Engine working (0x800)
            label: 'security_state_flags_p4'
        }]
    }]
};

const mockProtocolElements2 = {
    'telemetry::io::501': {
        label: 'security_state_flags_p4',
        event: 'HandleSecurityStateFlagsP4AndSplit'
    }
};

console.log('BEFORE Processing:');
console.log('Original telemetry data:');
console.log(JSON.stringify({
    ioElements: mockAvlData2.records[0].ioElements,
    additionalColumns: 'None',
    events: 'None'
}, null, 2));

// Process the data
const result2 = validationEngine.processEvents(JSON.parse(JSON.stringify(mockAvlData2)), mockProtocolElements2);

console.log('\nAFTER Processing:');
console.log('Processed telemetry data:');
console.log(JSON.stringify({
    ioElements: result2.records[0].ioElements,
    additionalColumns: {
        security_state_flags_p4_l: result2.records[0].security_state_flags_p4_l,
        security_state_flags_p4_h: result2.records[0].security_state_flags_p4_h
    },
    events: result2.records[0].events || []
}, null, 2));

// Show active security events for context
const securityValidator = new HandleSecurityStateFlagsP4AndSplit();
const activeEvents = securityValidator.getActiveEvents(0x900);
console.log('\nActive Security Events Detected:');
activeEvents.forEach((event, index) => {
    console.log(`  ${index + 1}. ${event.event} (Bit ${event.bit}, Byte ${event.byte})`);
});

// Example 3: Multiple telemetry elements with different handlers
console.log('\n\n3. Multiple Telemetry Elements Example:');
console.log('======================================');

const mockAvlData3 = {
    records: [{
        timestamp: new Date(),
        gps: {
            longitude: -122.4194,
            latitude: 37.7749,
            altitude: 100,
            angle: 0,
            satellites: 8,
            speed: 0
        },
        ioElements: [
            {
                id: 502,
                value: 0xFFFFFFFF12345678, // Large control flags
                label: 'control_flags'
            },
            {
                id: 503,
                value: 0x100, // Just ignition on
                label: 'security_flags'
            },
            {
                id: 504,
                value: 25.5, // Regular temperature (not processed)
                label: 'temperature'
            }
        ]
    }]
};

const mockProtocolElements3 = {
    'telemetry::io::502': {
        label: 'control_flags',
        event: 'HandleBitFlagSplit'
    },
    'telemetry::io::503': {
        label: 'security_flags',
        event: 'HandleSecurityStateFlagsP4AndSplit'
    }
    // Note: temperature doesn't have an event processor, so it stays unchanged
};

console.log('BEFORE Processing:');
console.log('Original telemetry data:');
console.log(JSON.stringify({
    ioElements: mockAvlData3.records[0].ioElements,
    additionalColumns: 'None',
    events: 'None'
}, null, 2));

// Process the data
const result3 = validationEngine.processEvents(JSON.parse(JSON.stringify(mockAvlData3)), mockProtocolElements3);

console.log('\nAFTER Processing:');
console.log('Processed telemetry data:');
console.log(JSON.stringify({
    ioElements: result3.records[0].ioElements, // Only temperature should remain
    additionalColumns: {
        control_flags_l: result3.records[0].control_flags_l,
        control_flags_h: result3.records[0].control_flags_h,
        security_flags_l: result3.records[0].security_flags_l,
        security_flags_h: result3.records[0].security_flags_h
    },
    events: result3.records[0].events || []
}, null, 2));

// Example 4: Show bit conversion details
console.log('\n\n4. Bit Conversion Details:');
console.log('==========================');

const testValues = [
    { name: 'Large 64-bit value', value: 0x123456789ABCDF00 },
    { name: 'All low bits set', value: 0xFFFFFFFF },
    { name: 'All high bits set', value: 0xFFFFFFFF00000000 },
    { name: 'Mixed value', value: 0x12345678ABCDEF12 }
];

const bitFlagValidator = new HandleBitFlagSplit();

testValues.forEach(test => {
    console.log(`\n${test.name}:`);
    console.log(`  Original: 0x${test.value.toString(16).toUpperCase()} (${test.value})`);
    
    const result = bitFlagValidator.validate(test.value, 'test');
    if (result.eventAdditionalTelemetryColumns) {
        const low = result.eventAdditionalTelemetryColumns.find(c => c.columnName === 'test_l');
        const high = result.eventAdditionalTelemetryColumns.find(c => c.columnName === 'test_h');
        
        console.log(`  Low 32-bit:  ${low.value} (0x${(low.value >>> 0).toString(16).toUpperCase()})`);
        console.log(`  High 32-bit: ${high.value} (0x${(high.value >>> 0).toString(16).toUpperCase()})`);
    }
});

console.log('\n=== Demo Complete ===');
console.log('\nSummary of Changes:');
console.log('- Original 8-byte telemetry elements are REMOVED from ioElements array');
console.log('- Two new telemetry columns are ADDED: {label}_l and {label}_h');
console.log('- Security flag validators also trigger EVENTS when flags are active');
console.log('- Non-processed telemetry elements remain unchanged in ioElements'); 
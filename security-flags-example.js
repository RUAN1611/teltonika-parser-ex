const HandleSecurityStateFlagsAndSplit = require('./event-processor-engine/validators/X-HandleSecurityStateFlagsAndSplit.js');

// Create an instance of the validator
const validator = new HandleSecurityStateFlagsAndSplit();

console.log('=== Security State Flags P2 Validator Examples ===\n');

// Example 1: Simple case - Engine running and ignition on
console.log('Example 1: Engine running with ignition on');
console.log('Hex Value: 0x8002 (binary: 1000 0000 0000 0010)');
const value1 = 0x8002;
const activeEvents1 = validator.getActiveEvents(value1);
console.log('Active Events:', activeEvents1);
console.log('');

// Example 2: Multiple doors open and trunk open
console.log('Example 2: Multiple doors and trunk open'); 
console.log('Hex Value: 0x2F00 (binary: 0010 1111 0000 0000)');
const value2 = 0x2F00;
const activeEvents2 = validator.getActiveEvents(value2);
console.log('Active Events:', activeEvents2);
console.log('');

// Example 3: Remote control action - car closed by remote
console.log('Example 3: Car closed by factory remote control');
console.log('Hex Value: 0x010000 (remote control action in byte 6)');
const value3 = 0x010000;
const activeEvents3 = validator.getActiveEvents(value3);
console.log('Active Events:', activeEvents3);
console.log('');

// Example 4: CAN bus status
console.log('Example 4: CAN1 connected and receiving data');
console.log('Hex Value: 0x03 (bits 0-1 set to 11)');
const value4 = 0x03;
const activeEvents4 = validator.getActiveEvents(value4);
console.log('Active Events:', activeEvents4);
console.log('');

// Example 5: Complex scenario - multiple systems active
console.log('Example 5: Complex scenario - Multiple systems active');
console.log('Hex Value: 0x020830 (Electric engine, ignition on, handbrake, front doors)');
const value5 = 0x020830;
const activeEvents5 = validator.getActiveEvents(value5);
console.log('Active Events:', activeEvents5);
console.log('');

// Example 6: Validation test
console.log('Example 6: Validation test - checking if event should trigger');
const previousValue = 0x0000;
const newValue = 0x8002;
const validationResult = validator.validate(newValue, previousValue, 'Security State Flags P2');
console.log('Previous Value:', previousValue);
console.log('New Value:', newValue);
console.log('Validation Result:', validationResult);
console.log('');

// Helper function to show byte breakdown
function showByteBreakdown(value) {
    console.log(`\nByte breakdown for 0x${value.toString(16).toUpperCase()}:`);
    for (let i = 0; i < 8; i++) {
        const byte = (value >> (i * 8)) & 0xFF;
        if (byte > 0) {
            console.log(`  Byte ${i}: 0x${byte.toString(16).toUpperCase().padStart(2, '0')} (${byte.toString(2).padStart(8, '0')})`);
        }
    }
}

// Show detailed breakdown for complex example
console.log('=== Detailed Breakdown for Complex Example ===');
showByteBreakdown(value5);
console.log('\nMeaning of each active bit:');
activeEvents5.forEach((event, index) => {
    console.log(`  ${index + 1}. ${event.event} (Byte ${event.byte}, Bit ${event.bit})`);
}); 
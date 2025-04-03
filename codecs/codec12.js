'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');

/**
 * Codec 12 for GPRS command communication
 * Used for sending configuration, debug, digital outputs control commands or other special purpose commands
 */
class Codec12 extends Codec {
  /**
   * Command type indicator
   * @returns {number}
   * @constructor
   */
  static get COMMAND_TYPE() {
    return 0x05;
  }

  /**
   * Response type indicator
   * @returns {number}
   * @constructor
   */
  static get RESPONSE_TYPE() {
    return 0x06;
  }

  /**
   * Codec 12 construct
   * @param reader - Binary reader
   * @param number_of_records - Number of commands/responses
   * @param imei - Device IMEI number
   */
  constructor(reader, number_of_records, imei) {
    super(reader, number_of_records, imei);
  }

  /**
   * Parse the header and content
   */
  parseHeader() {
    this.avlObj.commands = [];
    this.avlObj.responses = [];

    // Check message type (command or response)
    const messageType = this.toInt(this.reader.ReadBytes(1));
    
    if (messageType === Codec12.COMMAND_TYPE) {
      this.parseCommand();
    } else if (messageType === Codec12.RESPONSE_TYPE) {
      this.parseResponse();
    } else {
      throw new Error(`Unknown message type: ${messageType}`);
    }
  }

  /**
   * Parse a command message
   */
  parseCommand() {
    // Command size (4 bytes)
    const commandSize = this.reader.ReadInt32();
    
    // Read the command content as bytes
    const commandBytes = this.reader.ReadBytes(commandSize);
    
    // Convert to ASCII string
    const command = commandBytes.toString('ascii');
    
    // Command Quantity 2 (1 byte) - should match number_of_records but is ignored
    const commandQuantity2 = this.toInt(this.reader.ReadBytes(1));
    
    this.avlObj.commands.push({
      type: 'command',
      size: commandSize,
      content: command,
      raw: commandBytes.toString('hex')
    });
  }

  /**
   * Parse a response message
   */
  parseResponse() {
    // Response size (4 bytes)
    const responseSize = this.reader.ReadInt32();
    
    // Read the response content as bytes
    const responseBytes = this.reader.ReadBytes(responseSize);
    
    // Convert to ASCII string
    const response = responseBytes.toString('ascii');
    
    // Response Quantity 2 (1 byte) - should match number_of_records but is ignored
    const responseQuantity2 = this.toInt(this.reader.ReadBytes(1));
    
    this.avlObj.responses.push({
      type: 'response',
      size: responseSize,
      content: response,
      raw: responseBytes.toString('hex')
    });
  }

  /**
   * Create a command message
   * @param {string} command - Command text
   * @returns {Buffer} - Command formatted as a buffer
   */
  static createCommandMessage(command) {
    const commandBuffer = Buffer.from(command, 'ascii');
    const commandSize = commandBuffer.length;
    
    // Create a binary writer
    const writer = new binutils.BinaryWriter();
    
    // Preamble (4 zero bytes)
    writer.WriteInt32(0);
    
    // Data size (will be calculated from Codec ID to Command Quantity 2)
    const dataSize = 1 + 1 + 1 + 4 + commandSize + 1;
    writer.WriteInt32(dataSize);
    
    // Codec ID (0x0C for Codec12)
    writer.WriteUInt8(0x0C);
    
    // Command Quantity 1
    writer.WriteUInt8(1);
    
    // Command Type (0x05)
    writer.WriteUInt8(Codec12.COMMAND_TYPE);
    
    // Command Size
    writer.WriteInt32(commandSize);
    
    // Command content
    writer.WriteBytes(commandBuffer);
    
    // Command Quantity 2
    writer.WriteUInt8(1);
    
    // Calculate CRC-16 from Codec ID to Command Quantity 2
    const crc = Codec12.calculateCRC16(writer.data.slice(8)); // Skip preamble and data size
    writer.WriteInt32(crc);
    
    return writer.data;
  }

  /**
   * Calculate CRC-16/IBM
   * @param {Buffer} data - Data to calculate CRC for
   * @returns {number} - CRC-16 value
   */
  static calculateCRC16(data) {
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if ((crc & 1) !== 0) {
          crc = (crc >>> 1) ^ 0xA001;
        } else {
          crc = crc >>> 1;
        }
      }
    }
    return crc;
  }

  /**
   * Convert bytes to string
   * @param {Buffer} bytes - Bytes to convert
   * @returns {string} - String representation
   */
  toString(bytes) {
    return bytes.toString('ascii');
  }
}

module.exports = Codec12; 
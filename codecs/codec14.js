'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');

/**
 * Codec 14 for GPRS command communication with IMEI validation
 * Used for sending configuration, debug, digital outputs control commands or other special purpose commands
 * Main difference from Codec12: device will answer only if IMEI in command matches device's physical IMEI
 */
class Codec14 extends Codec {
  /**
   * Command type indicator
   * @returns {number}
   * @constructor
   */
  static get COMMAND_TYPE() {
    return 0x05;
  }

  /**
   * Response ACK type indicator
   * @returns {number}
   * @constructor
   */
  static get RESPONSE_ACK_TYPE() {
    return 0x06;
  }

  /**
   * Response NACK type indicator
   * @returns {number}
   * @constructor
   */
  static get RESPONSE_NACK_TYPE() {
    return 0x11;
  }

  /**
   * IMEI size in bytes
   * @returns {number}
   * @constructor
   */
  static get IMEI_SIZE() {
    return 8;
  }

  /**
   * Codec 14 construct
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
    
    if (messageType === Codec14.COMMAND_TYPE) {
      this.parseCommand();
    } else if (messageType === Codec14.RESPONSE_ACK_TYPE) {
      this.parseResponse(true); // ACK response
    } else if (messageType === Codec14.RESPONSE_NACK_TYPE) {
      this.parseResponse(false); // NACK response
    } else {
      throw new Error(`Unknown message type: ${messageType}`);
    }
  }

  /**
   * Parse a command message
   */
  parseCommand() {
    // Command size (4 bytes) - includes IMEI size (8 bytes) + actual command size
    const commandSizeWithImei = this.reader.ReadInt32();
    
    // Read IMEI (8 bytes)
    const imeiBytes = this.reader.ReadBytes(Codec14.IMEI_SIZE);
    const imeiHex = imeiBytes.toString('hex');
    
    // Calculate actual command size
    const commandSize = commandSizeWithImei - Codec14.IMEI_SIZE;
    
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
      raw: commandBytes.toString('hex'),
      imei: imeiHex
    });
  }

  /**
   * Parse a response message
   * @param {boolean} isAck - True if ACK response, false if NACK
   */
  parseResponse(isAck) {
    // Response size (4 bytes) - includes IMEI size (8 bytes) + actual response size
    const responseSizeWithImei = this.reader.ReadInt32();
    
    // Read IMEI (8 bytes)
    const imeiBytes = this.reader.ReadBytes(Codec14.IMEI_SIZE);
    const imeiHex = imeiBytes.toString('hex');
    
    let response = '';
    let responseBytes = Buffer.alloc(0);
    let responseSize = 0;
    
    if (isAck) {
      // Calculate actual response size
      responseSize = responseSizeWithImei - Codec14.IMEI_SIZE;
      
      // Read the response content as bytes
      responseBytes = this.reader.ReadBytes(responseSize);
      
      // Convert to ASCII string
      response = responseBytes.toString('ascii');
    } else {
      // For NACK, there's no additional response data, just IMEI
      responseSize = 0;
    }
    
    // Response Quantity 2 (1 byte) - should match number_of_records but is ignored
    const responseQuantity2 = this.toInt(this.reader.ReadBytes(1));
    
    this.avlObj.responses.push({
      type: isAck ? 'ack' : 'nack',
      size: responseSize,
      content: response,
      raw: responseBytes.toString('hex'),
      imei: imeiHex
    });
  }

  /**
   * Create a command message
   * @param {string} command - Command text
   * @param {string} imei - Device IMEI
   * @returns {Buffer} - Command formatted as a buffer
   */
  static createCommandMessage(command, imei) {
    if (!imei || imei.length < 15) {
      throw new Error('Valid IMEI (15 digits) is required for Codec14 commands');
    }
    
    const commandBuffer = Buffer.from(command, 'ascii');
    const commandSize = commandBuffer.length;
    
    // Create a binary writer
    const writer = new binutils.BinaryWriter();
    
    // Preamble (4 zero bytes)
    writer.WriteInt32(0);
    
    // Data size (will be calculated from Codec ID to Command Quantity 2)
    const dataSize = 1 + 1 + 1 + 4 + Codec14.IMEI_SIZE + commandSize + 1;
    writer.WriteInt32(dataSize);
    
    // Codec ID (0x0E for Codec14)
    writer.WriteUInt8(0x0E);
    
    // Command Quantity 1
    writer.WriteUInt8(1);
    
    // Command Type (0x05)
    writer.WriteUInt8(Codec14.COMMAND_TYPE);
    
    // Command Size + IMEI Size
    writer.WriteInt32(Codec14.IMEI_SIZE + commandSize);
    
    // IMEI (8 bytes in hex format)
    const imeiHex = Codec14.formatImeiForCodec14(imei);
    writer.WriteBytes(Buffer.from(imeiHex, 'hex'));
    
    // Command content
    writer.WriteBytes(commandBuffer);
    
    // Command Quantity 2
    writer.WriteUInt8(1);
    
    // Calculate CRC-16 from Codec ID to Command Quantity 2
    const crc = Codec14.calculateCRC16(writer.data.slice(8)); // Skip preamble and data size
    writer.WriteInt32(crc);
    
    return writer.data;
  }

  /**
   * Format IMEI for Codec14 (convert to 8-byte hex representation)
   * @param {string} imei - Device IMEI (15 digits)
   * @returns {string} - Hex string representation (16 characters)
   */
  static formatImeiForCodec14(imei) {
    // Remove any non-digit characters
    const cleanedImei = imei.replace(/\D/g, '');
    
    // Pad to 16 digits with leading zero if needed
    const paddedImei = cleanedImei.padStart(16, '0');
    
    // Convert to hex string
    return paddedImei;
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

module.exports = Codec14; 
'use strict';

const binutils = require('binutils64');
const protocolMapping = require('../iot-data-standards/teltonika/protocol-mapping.json');

/**
 * Base codec class
 */
class Codec {
  /**
   * Codec constructor
   *
   * @param reader
   * @param number_of_records
   * @param imei - Device IMEI number
   * @param previousValues - Previous values of the device
   */
  constructor(reader, number_of_records, imei, previousValues) {
    this.reader = reader;
    this.number_of_records = number_of_records;
    this.avlObj = {};
    this.imei = imei;
    this.previousValues = previousValues;
    this.protocol = this.determineProtocol();
  }

  /**
   * Determine protocol based on IMEI TAC code
   * @private
   * @returns {string}
   */
  determineProtocol() {
    if (!this.imei) {
      throw new Error('IMEI is required to determine protocol');
    }
    
    // Extract first 8 digits of IMEI (TAC code) using regex
    const tacCodeMatch = this.imei.match(/^(\d{8})/);
    if (!tacCodeMatch) {
      throw new Error('Invalid IMEI format: cannot extract TAC code');
    }
    const tacCode = tacCodeMatch[1];
    
    // Get the raw JSON content to find first occurrence
    const rawMapping = require('fs').readFileSync(require.resolve('../iot-data-standards/teltonika/protocol-mapping.json'), 'utf8');
    const jsonContent = JSON.parse(rawMapping);
    
    // Find the first occurrence where the TAC code matches the pattern (excluding the asterisk)
    const entries = Object.entries(jsonContent);
    const firstEntry = entries.find(([key]) => key.replace('*', '') === tacCode);
    
    if (firstEntry) {
      return firstEntry[1]; // Return the protocol value
    }
    
    // If no specific match found, check for wildcard entry
    const wildcardEntry = entries.find(([key]) => key === '*');
    if (wildcardEntry) {
      return wildcardEntry[1]; // Return the wildcard protocol value
    }
    
    throw new Error(`No protocol mapping found for TAC code: ${tacCode}`);
  }

  /**
   * Get the determined protocol
   * @returns {string}
   */
  getProtocol() {
    return this.protocol;
  }

  setProtocol(protocol) {
    this.protocol = protocol;
  }

  /**
   * Run parse process
   */
  process() {
    this.parseHeader();
  }

  /**
   * Convert bytes to int
   *
   * @param bytes
   * @returns {number}
   * @private
   */
  toInt(bytes) {
    return parseInt(bytes.toString('hex'), 16);
  }

  /**
   * Get AVL object
   *
   * @returns {{}}
   */
  getAvl() {
    return this.avlObj;
  }
}

module.exports = Codec;

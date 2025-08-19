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
   * @param deviceType - Device type
   */
  constructor(reader, number_of_records, imei, deviceType) {
    this.reader = reader;
    this.number_of_records = number_of_records;
    this.avlObj = {};
    this.imei = imei;
    this.deviceType = deviceType;
    this.protocol = this.determineProtocol();
  }

  /**
   * Determine protocol based on device type
   * @private
   * @returns {string}
   */
  determineProtocol() {
    if (!this.deviceType) {
      throw new Error('Device type is required to determine protocol');
    }
    
    // Check if device type exists in protocol mapping
    if (protocolMapping[this.deviceType]) {
      return protocolMapping[this.deviceType];
    }
    
    // If no specific match found, check for wildcard entry
    if (protocolMapping['*']) {
      return protocolMapping['*'];
    }
    
    throw new Error(`No protocol mapping found for device type: ${this.deviceType}`);
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

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
   */
  constructor(reader, number_of_records, imei) {
    this.reader = reader;
    this.number_of_records = number_of_records;
    this.avlObj = {};
    this.imei = imei;
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
    
    // Extract first 8 digits of IMEI (TAC code)
    const tacCode = this.imei.substring(0, 8);
    
    // Look up protocol in mapping
    const protocol = protocolMapping[tacCode];
    if (!protocol) {
      throw new Error(`No protocol mapping found for TAC code: ${tacCode}`);
    }
    
    return protocol;
  }

  /**
   * Get the determined protocol
   * @returns {string}
   */
  getProtocol() {
    return this.protocol;
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

'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');
const basicProtocolIoElements = require('../iot-data-standards/teltonika/basic-protocol.json');

/**
 * Codec 8 decoding
 */
class Codec8e extends Codec {
  /**
   * Trip event id's
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_ID() {
    return 250;
  }

  /**
   * Trip start flag
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_START() {
    return 1;
  }

  /**
   * Trip end flag
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_END() {
    return 0;
  }

  /**
   * Odometer property id
   *
   * @returns {number}
   * @constructor
   */
  static get ODOMETER_PROPERTY_ID() {
    return 16;
  }

  /**
   * Codec 8e construct
   *
   * @param reader
   * @param number_of_records
   * @param imei - Device IMEI number
   */
  constructor(reader, number_of_records, imei) {
    super(reader, number_of_records, imei);
    this._gpsPrecision = 10000000;
  }

  /**
   * Parsing AVL record header
   */
  parseHeader() {
    this.avlObj.records = [];

    for (var i = 0; i < this.number_of_records; i++) {
      this.parseAvlRecords();
    }
  }

  /**
   * Parse single AVL record
   */
  parseAvlRecords() {
    let avlRecord = {
      timestamp: new Date(this.toInt(this.reader.ReadBytes(8))),
      priority: this.toInt(this.reader.ReadBytes(1)),
      gps: {
        longitude: this.reader.ReadInt32(),
        latitude: this.reader.ReadInt32(),
        altitude: this.reader.ReadInt16(),
        angle: this.reader.ReadInt16(),
        satellites: this.reader.ReadInt8(),
        speed: this.reader.ReadInt16(),
      },
      event_id: this.toInt(this.reader.ReadBytes(2)),
      properties_count: this.toInt(this.reader.ReadBytes(2)),
      ioElements: [],
    };

    if ('0' == avlRecord.gps.longitude.toString(2).substr(0, 1)) {
      avlRecord.gps.longitude *= -1;
    }
    avlRecord.gps.longitude /= this._gpsPrecision;

    if ('0' == avlRecord.gps.latitude.toString(2).substr(0, 1)) {
      avlRecord.gps.latitude *= -1;
    }
    avlRecord.gps.latitude /= this._gpsPrecision;

    avlRecord.ioElements = this.parseIoElements();

    this.avlObj.records.push(avlRecord);
  }

  /**
   * Parse single IoElement records
   *
   * @returns {Array}
   */
  parseIoElements() {
    let ioElement = [];

    /**
     * Read 1 byte ioProperties
     */
    let ioCountInt8 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt8; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.toInt(this.reader.ReadBytes(1));

      ioElement.push({
        id: property_id,
        value: this.convertValue(property_id, value),
        label: this.getIoElementLabel(property_id),
        ...(this.getIoElementConverter(property_id) && { converter: this.getIoElementConverter(property_id) })
      });
    }

    /**
     * Read 2 byte ioProperties
     */
    let ioCountInt16 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt16; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadInt16();

      ioElement.push({
        id: property_id,
        value: this.convertValue(property_id, value),
        label: this.getIoElementLabel(property_id),
        ...(this.getIoElementConverter(property_id) && { converter: this.getIoElementConverter(property_id) })
      });
    }

    /**
     * Read 4 byte ioProperties
     */
    let ioCountInt32 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt32; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadInt32();

      ioElement.push({
        id: property_id,
        value: this.convertValue(property_id, value),
        label: this.getIoElementLabel(property_id),
        ...(this.getIoElementConverter(property_id) && { converter: this.getIoElementConverter(property_id) })
      });
    }

    /**
     * Read 8 byte ioProperties
     */
    let ioCountInt64 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt64; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadDouble();
      ioElement.push({
        id: property_id,
        value: this.convertValue(property_id, value),
        label: this.getIoElementLabel(property_id),
        ...(this.getIoElementConverter(property_id) && { converter: this.getIoElementConverter(property_id) })
      });
    }

    /**
     * Read n byte ioProperties
     */
    let ioCountIntX = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountIntX; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let ioValueLength = this.toInt(this.reader.ReadBytes(2));
      let value = this.toString(this.reader.ReadBytes(ioValueLength));
      ioElement.push({
        id: property_id,
        value: value,
        label: this.getIoElementLabel(property_id),
        ...(this.getIoElementConverter(property_id) && { converter: this.getIoElementConverter(property_id) })
      });
    }

    return ioElement;
  }

  /**
   * Get IoElement label based on protocol
   * @param {number} property_id
   * @returns {string}
   */
  getIoElementLabel(property_id) {
    const element = this.ioElements()[property_id];
    return element ? element.label : `unknown_${property_id}`;
  }

  /**
   * Get IoElement converter method name
   * @param {number} property_id
   * @returns {string|undefined}
   */
  getIoElementConverter(property_id) {
    const element = this.ioElements()[property_id];
    return element?.convert;
  }

  /**
   * Convert raw value using specified conversion function
   * @param {number} property_id 
   * @param {any} value 
   * @returns {number|string}
   */
  convertValue(property_id, value) {
    const element = this.ioElements()[property_id];
    if (!element || !element.convert) {
      return value;
    }
    
    // Check if the conversion method exists before calling it
    if (typeof this[element.convert] !== 'function') {
      console.warn(`Conversion function ${element.convert} not found for property ID ${property_id}`);
      return value;
    }
    
    return this[element.convert](value);
  }

  /**
   * Get IoElements based on protocol
   * @returns {Object}
   */
  ioElements() {
    // For now, we only support basic protocol
    if (this.getProtocol() !== 'basic-protocol') {
      throw new Error(`Protocol ${this.getProtocol()} not supported yet`);
    }
    
    // Convert the array to an object with id as key for faster lookups
    const elementsById = {};
    if (basicProtocolIoElements && basicProtocolIoElements.data && 
        Array.isArray(basicProtocolIoElements.data.ioelements)) {
      basicProtocolIoElements.data.ioelements.forEach(element => {
        elementsById[element.id] = element;
      });
    } else if (Array.isArray(basicProtocolIoElements)) {
      // Handle case where the import might be just the array
      basicProtocolIoElements.forEach(element => {
        elementsById[element.id] = element;
      });
    }
    
    return elementsById;
  }

  /**
   * Convert signed value with 0.001 multiplier
   * @param {number} value 
   * @returns {number}
   */
  SignedThousandth(value) {
    return Number(value) * 0.001;
  }

  /**
   * Convert signed value with 0.01 multiplier
   * @param {number} value 
   * @returns {number}
   */
  SignedHundredth(value) {
    return Number(value) * 0.01;
  }

  /**
   * Convert signed value with 0.1 multiplier
   * @param {number} value 
   * @returns {number}
   */
  SignedTenth(value) {
    return Number(value) * 0.1;
  }

  /**
   * Convert to signed value without multiplier
   * @param {number} value 
   * @returns {number}
   */
  SignedValue(value) {
    return Number(value);
  }

  /**
   * Convert to unsigned value without multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedValue(value) {
    return Math.abs(Number(value));
  }

  /**
   * Convert unsigned value with 0.001 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedThousandth(value) {
    return Math.abs(Number(value)) * 0.001;
  }

  /**
   * Convert unsigned value with 0.01 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedHundredth(value) {
    return Math.abs(Number(value)) * 0.01;
  }

  /**
   * Convert unsigned value with 0.1 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedTenth(value) {
    return Math.abs(Number(value)) * 0.1;
  }

  /**
   * Convert to string
   * @param {any} value 
   * @returns {string}
   */
  ToStr(value) {
    return String(value);
  }

  /**
   * Convert to ASCII string
   * @param {any} value 
   * @returns {string}
   */
  ToStrAscii(value) {
    return String(value).replace(/[^\x00-\x7F]/g, "");
  }

  /**
   * Convert to ASCII string and strip Unicode
   * @param {any} value 
   * @returns {string}
   */
  ToStrAsciiStripUnicode(value) {
    return String(value)
      .replace(/[^\x00-\x7F]/g, "")
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Convert unsigned value with 10 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedTen(value) {
    return Math.abs(Number(value)) * 10;
  }

  /**
   * Convert to iButton ID (unsigned 64-bit)
   * @param {number} value 
   * @returns {number}
   */
  IButton(value) {
    return Math.abs(Number(value));
  }

  /**
   * Convert to hex (unsigned 64-bit)
   * @param {number} value 
   * @returns {string}
   */
  LeToHex(value) {
    return Math.abs(Number(value)).toString(16);
  }

  /**
   * Convert unsigned value with 50 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedThousandthFifty(value) {
    return Math.abs(Number(value)) * 50;
  }

  /**
   * Convert cell temperature value
   * 
   * @param {number} value 
   * @returns {number}
   */
  CellTemperature(value) {
    return Number(value) * 0.03125;
  }

  /**
   * Convert unsigned value with 0.02 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedTwo(value) {
    return Math.abs(Number(value)) * 2;
  }

  /**
   * Convert unsigned value with 0.4 multiplier
   * @param {number} value 
   * @returns {number}
   */
  UnsignedFourTenth(value) {
    return Math.abs(Number(value)) * 0.4;
  }

  /**
   * Convert to ASCII string (little-endian)
   * @param {any} value 
   * @returns {string}
   */
  LeToStrAscii(value) {
    return String(value).replace(/[^\x00-\x7F]/g, "");
  }
}

module.exports = Codec8e;

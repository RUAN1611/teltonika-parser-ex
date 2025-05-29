'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');
const basicProtocolIoElements = require('../iot-data-standards/teltonika/basic-protocol.json');
const advancedProtocolIoElements = require('../iot-data-standards/teltonika/advanced-protocol.json');
const professionalProtocolIoElements = require('../iot-data-standards/teltonika/professional-protocol.json');
const canTrackersAndAdaptersProtocolIoElements = require('../iot-data-standards/teltonika/can-trackers-and-adapters-protocol.json');
const autonomousProtocolIoElements = require('../iot-data-standards/teltonika/autonomous-protocol.json');
const eMobilityProtocolIoElements = require('../iot-data-standards/teltonika/e-mobility-protocol.json');
const fastAndEasyProtocolIoElements = require('../iot-data-standards/teltonika/fast-and-easy-protocol.json');
const ValidationEngine = require('../event-processor-engine/ValidationEngine');

/**
 * Codec 8 decoding
 */
class Codec8 extends Codec {
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
   * Codec 8 construct
   *
   * @param reader
   * @param number_of_records
   * @param imei - Device IMEI number
   * @param previousValues - Previous values of the device
   */
  constructor(reader, number_of_records, imei, previousValues = {}) {
    super(reader, number_of_records, imei, previousValues);
    this._gpsPrecision = 10000000;
    this.validationEngine = new ValidationEngine();
  }

  /**
   * Parsing AVL record header
   */
  parseHeader() {
    this.avlObj.records = [];

    for (var i = 0; i < this.number_of_records; i++) {
      this.parseAvlRecords();
    }

    // Process events after all records are parsed
    this.processEvents();
  }

  /**
   * Process events using the validation engine
   */
  processEvents() {
    const protocolElements = this.getProtocolElements();
    console.log('Processing events with protocol:', this.getProtocol());
    console.log('Protocol elements keys:', Object.keys(protocolElements).filter(k => k.startsWith('data::io::')).slice(0, 10));
    console.log('AVL records count:', this.avlObj.records?.length);
    
    if (this.avlObj.records && this.avlObj.records.length > 0) {
      console.log('First record IO elements:', this.avlObj.records[0].ioElements?.map(io => ({ id: io.id, label: io.label, value: io.value })));
    }
    
    this.avlObj = this.validationEngine.processEvents(this.avlObj, protocolElements, this.previousValues);
    
    if (this.avlObj.records && this.avlObj.records.length > 0) {
      console.log('Events generated:', this.avlObj.records[0].events?.length || 0);
      if (this.avlObj.records[0].events?.length > 0) {
        console.log('Generated events:', this.avlObj.records[0].events);
      }
    }
  }

  /**
   * Get protocol elements for the current protocol
   * @returns {Object} - Protocol elements object
   */
  getProtocolElements() {
    switch(this.getProtocol()) {
      case 'basic-protocol':
        return basicProtocolIoElements;
      case 'advanced-protocol':
        return advancedProtocolIoElements;
      case 'professional-protocol':
        return professionalProtocolIoElements;
      case 'can-trackers-and-adapters-protocol':
        return canTrackersAndAdaptersProtocolIoElements;
      case 'autonomous-protocol':
        return autonomousProtocolIoElements;
      case 'e-mobility-protocol':
        return eMobilityProtocolIoElements;
      case 'fast-and-easy-protocol':
        return fastAndEasyProtocolIoElements;
      default:
        return basicProtocolIoElements;
    }
  }

  /**
   * Parse single AVL record
   */
  parseAvlRecords() {
    let avlRecord = {
      created_on: new Date(this.toInt(this.reader.ReadBytes(8))),
      protocol: `teltonika/${this.getProtocol()}`,
      priority: this.toInt(this.reader.ReadBytes(1)),
      gps: {
        longitude: this.reader.ReadInt32(),
        latitude: this.reader.ReadInt32(),
        altitude: this.reader.ReadInt16(),
        angle: this.reader.ReadInt16(),
        satellites: this.reader.ReadInt8(),
        speed: this.reader.ReadInt16(),
      },
      event_id: this.toInt(this.reader.ReadBytes(1)),
      properties_count: this.toInt(this.reader.ReadBytes(1)),
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
    let ioCountInt8 = this.toInt(this.reader.ReadBytes(1));
    for (var i = 0; i < ioCountInt8; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(1));
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
    let ioCountInt16 = this.toInt(this.reader.ReadBytes(1));
    for (var i = 0; i < ioCountInt16; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(1));
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
    let ioCountInt32 = this.toInt(this.reader.ReadBytes(1));
    for (var i = 0; i < ioCountInt32; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(1));
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
    let ioCountInt64 = this.toInt(this.reader.ReadBytes(1));
    for (var i = 0; i < ioCountInt64; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(1));
      let value = this.reader.ReadDouble();
      ioElement.push({
        id: property_id,
        value: this.convertValue(property_id, value),
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
    if (this.getProtocol() !== 'basic-protocol' && 
    this.getProtocol() !== 'advanced-protocol' && 
    this.getProtocol() !== 'professional-protocol' && 
    this.getProtocol() !== 'can-trackers-and-adapters-protocol' && 
    this.getProtocol() !== 'autonomous-protocol' && 
    this.getProtocol() !== 'e-mobility-protocol' && 
    this.getProtocol() !== 'fast-and-easy-protocol') {
      this.setProtocol('basic-protocol');
    }
    
    // Convert the array to an object with id as key for faster lookups
    const elementsById = {};
    if(this.getProtocol() === 'basic-protocol') {
      // Handle new format where basicProtocolIoElements is an object with "data::io::{id}" keys
      Object.entries(basicProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    if(this.getProtocol() === 'advanced-protocol') {
      // Handle new format where basicProtocolIoElements is an object with "data::io::{id}" keys
      Object.entries(advancedProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    if(this.getProtocol() === 'professional-protocol') {
      // Handle new format where basicProtocolIoElements is an object with "data::io::{id}" keys
      Object.entries(professionalProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    if(this.getProtocol() === 'can-trackers-and-adapters-protocol') {
      // Handle new format where basicProtocolIoElements is an object with "data::io::{id}" keys
      Object.entries(canTrackersAndAdaptersProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    if(this.getProtocol() === 'autonomous-protocol') {
      Object.entries(autonomousProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    if(this.getProtocol() === 'e-mobility-protocol') {
      Object.entries(eMobilityProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    if(this.getProtocol() === 'fast-and-easy-protocol') {
      Object.entries(fastAndEasyProtocolIoElements).forEach(([key, element]) => {
        if (key.startsWith('data::io::')) {
          const id = parseInt(key.split('::')[2], 10);
          if (!isNaN(id)) {
            elementsById[id] = {
              id: id,
              label: element.label,
              ...(element.convert && { convert: element.convert })
            };
          }
        }
      });
    }

    return elementsById;
  }

  /**
   * Converts unsigned value with 0.001 multiplier
   * @param {number} value 
   * @returns {number}
   */
  AnalogTelemetryProcessor(value) {
    return Math.abs(Number(value)) * 0.001;
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
    return Number(value) * 0.03125 ;
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

module.exports = Codec8;

'use strict';

const binutils = require('binutils64');
const codec7 = require('./codecs/codec7');
const codec8 = require('./codecs/codec8');
const codec12 = require('./codecs/codec12');
const codec14 = require('./codecs/codec14');
const codec16 = require('./codecs/codec16');
const codec8ex = require('./codecs/codec8ex');

class TeltonikaParser {
  constructor(buffer, imei = null) {
    this._reader = new binutils.BinaryReader(buffer);
    this._avlObj = {};
    this.imei = imei;
    this.checkIsImei();
    if (!this.isImei) {
      this.parseHeader();
      this.decodeData();
      this.parseFooter();
    }
  }

  checkIsImei() {
    let imeiLength = this._toInt(this._reader.ReadBytes(2));
    if (imeiLength > 0) {
      this.isImei = true;
      this.imei = this._reader.ReadBytes(imeiLength).toString();
    } else {
      this._toInt(this._reader.ReadBytes(2));
    }
  }

  /**
   * Parsing AVL record header
   */
  parseHeader() {
    if (!this.imei) {
      throw new Error('IMEI is required for data parsing. Make sure to provide IMEI when creating the parser.');
    }

    this._avlObj = {
      data_length: this._reader.ReadInt32(),
      codec_id: this._toInt(this._reader.ReadBytes(1)),
      number_of_data: this._toInt(this._reader.ReadBytes(1)),
    };

    this._codecReader = this._reader;

    switch (this._avlObj.codec_id) {
      case 7:
        this._codec = new codec7(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
      case 8:
        this._codec = new codec8(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
      case 12:
        this._codec = new codec12(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
      case 14:
        this._codec = new codec14(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
      case 16:
        this._codec = new codec16(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
      case 142:
        this._codec = new codec8ex(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
      case 255:
        this._codec = new codec8(
          this._codecReader,
          this._avlObj.number_of_data,
          this.imei
        );
        break;
    }
  }

  decodeData() {
    if (this._codec) {
      this._codec.process();
      let intAvl = this._codec.getAvl();
      intAvl.zero = this._avlObj.zero;
      intAvl.data_length = this._avlObj.data_length;
      intAvl.codec_id = this._avlObj.codec_id;
      intAvl.number_of_data = this._avlObj.number_of_data;

      this._avlObj = intAvl;
    }
  }

  parseFooter() {
    this._avlObj.crc = this._reader.ReadInt32();
  }

  /**
   * Convert bytes to int
   *
   * @param bytes
   * @returns {number}
   * @private
   */
  _toInt(bytes) {
    return parseInt(bytes.toString('hex'), 16);
  }

  /**
   * Get AVL object
   *
   * @returns {{}}
   */
  getAvl() {
    return this._avlObj;
  }
}

module.exports = TeltonikaParser;

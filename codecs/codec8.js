'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');

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
   */
  constructor(reader, number_of_records) {
    super(reader, number_of_records);
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
        value: this.convertValue(property_id, value)
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
        value: this.convertValue(property_id, value)
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
        value: this.convertValue(property_id, value)
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
        value: this.convertValue(property_id, value)
      });
    }

    return ioElement;
  }

  /**
   * Convert signed value with 0.001 multiplier
   * @param {number} value 
   * @returns {number}
   */
  signedThousandth(value) {
    return Number(value) * 0.001;
  }

  /**
   * Convert signed value with 0.01 multiplier
   * @param {number} value 
   * @returns {number}
   */
  signedHundredth(value) {
    return Number(value) * 0.01;
  }

  /**
   * Convert signed value with 0.1 multiplier
   * @param {number} value 
   * @returns {number}
   */
  signedTenth(value) {
    return Number(value) * 0.1;
  }

  /**
   * Convert to signed value without multiplier
   * @param {number} value 
   * @returns {number}
   */
  signedValue(value) {
    return Number(value);
  }

  /**
   * Convert to unsigned value without multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedValue(value) {
    return Math.abs(Number(value));
  }

  /**
   * Convert unsigned value with 0.001 multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedThousandth(value) {
    return Math.abs(Number(value)) * 0.001;
  }

  /**
   * Convert unsigned value with 0.01 multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedHundredth(value) {
    return Math.abs(Number(value)) * 0.01;
  }

  /**
   * Convert unsigned value with 0.1 multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedTenth(value) {
    return Math.abs(Number(value)) * 0.1;
  }

  /**
   * Convert to string
   * @param {any} value 
   * @returns {string}
   */
  toStr(value) {
    return String(value);
  }

  /**
   * Convert to ASCII string
   * @param {any} value 
   * @returns {string}
   */
  toStrAscii(value) {
    return String(value).replace(/[^\x00-\x7F]/g, "");
  }

  /**
   * Convert to ASCII string and strip Unicode
   * @param {any} value 
   * @returns {string}
   */
  toStrAsciiStripUnicode(value) {
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
  unsignedTen(value) {
    return Math.abs(Number(value)) * 10;
  }

  /**
   * Convert to iButton ID (unsigned 64-bit)
   * @param {number} value 
   * @returns {number}
   */
  iButton(value) {
    return Math.abs(Number(value));
  }

  /**
   * Convert to hex (unsigned 64-bit)
   * @param {number} value 
   * @returns {string}
   */
  leToHex(value) {
    return Math.abs(Number(value)).toString(16);
  }

  /**
   * Convert unsigned value with 50 multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedThousandthFifty(value) {
    return Math.abs(Number(value)) * 50;
  }

  /**
   * Convert cell temperature value
   * 
   * @param {number} value 
   * @returns {number}
   */
  cellTemperature(value) {
    return Number(value) * 0.03125 ;
  }

  /**
   * Convert unsigned value with 0.02 multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedTwo(value) {
    return Math.abs(Number(value)) * 2;
  }

  /**
   * Convert unsigned value with 0.4 multiplier
   * @param {number} value 
   * @returns {number}
   */
  unsignedFourTenth(value) {
    return Math.abs(Number(value)) * 0.4;
  }

  /**
   * Convert to ASCII string (little-endian)
   * @param {any} value 
   * @returns {string}
   */
  leToStrAscii(value) {
    return String(value).replace(/[^\x00-\x7F]/g, "");
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
    return this[element.convert](value);
  }

  /**
   *  Codec 8 IoElements
   */
  ioElements() {
    return {
      5: {
        convert: 'leToHex'  // temp_05_id
      },
      6: {
        convert: 'signedTenth'  // temp_05
      },
      7: {
        convert: 'leToHex'  // temp_06_id
      },
      8: {
        convert: 'signedTenth'  // temp_06
      },
      9: {
        convert: 'unsignedThousandth'  // analog_01
      },
      10: {
        convert: 'unsignedThousandth'  // analog_03
      },
      11: {
        convert: 'toStr'  // iccid_01
      },
      12: {
        convert: 'unsignedThousandth'  // fuel_counter
      },
      13: {
        convert: 'unsignedHundredth'  // fuel_rate
      },
      14: {
        convert: 'unsignedValue'  // can_engine_worktime
      },
      15: {
        convert: 'unsignedValue'  // can_total_engine_worktime
      },
      16: {
        convert: 'unsignedThousandth'  // odometer
      },
      17: {
        convert: 'unsignedTenth'  // can_total_fuel_consumed
      },
      18: {
        convert: 'signedThousandth'  // y
      },
      19: {
        convert: 'signedThousandth'  // z
      },
      20: {
        convert: 'unsignedTenth'  // can_adblue_level
      },
      25: {
        convert: 'signedHundredth'  // temp_ble_01
      },
      26: {
        convert: 'signedHundredth'  // temp_ble_02
      },
      27: {
        convert: 'signedHundredth'  // temp_ble_03
      },
      28: {
        convert: 'signedHundredth'  // temp_ble_04
      },
      32: {
        convert: 'signedValue'  // can_coolant_temp
      },
      33: {
        convert: 'signedValue'  // can_fuel_trim_1
      },
      34: {
        convert: 'unsignedTenth'  // can_fuel_level
      },
      36: {
        convert: 'unsignedThousandth'  // can_mileage
      },
      38: {
        convert: 'signedValue'  // can_timing_advance
      },
      39: {
        convert: 'signedValue'  // can_intake_temp
      },
      40: {
        convert: 'unsignedHundredth'  // can_air_flow
      },
      41: {
        convert: 'unsignedValue'  // area_of_harvest
      },
      42: {
        convert: 'unsignedValue'  // mowing_efficiency
      },
      43: {
        convert: 'unsignedValue'  // grain_mown_volume
      },
      44: {
        convert: 'unsignedTenth'  // can_fuel_rail_pressure_rel
      },
      45: {
        convert: 'unsignedTen'  // can_fuel_rail_pressure_direct
      },
      47: {
        convert: 'signedValue'  // can_egr_error
      },
      51: {
        convert: 'unsignedThousandth'  // can_ctrl_mod_voltage
      },
      53: {
        convert: 'signedValue'  // can_air_temp
      },
      56: {
        convert: 'unsignedTenth'  // can_abs_fuel_rate
      },
      59: {
        convert: 'signedHundredth'  // can_fuel_inj_timing
      },
      60: {
        convert: 'unsignedHundredth'  // can_fuel_rate
      },
      62: {
        convert: 'leToHex'  // temp_01_id
      },
      63: {
        convert: 'leToHex'  // temp_02_id
      },
      64: {
        convert: 'leToHex'  // temp_03_id
      },
      65: {
        convert: 'leToHex'  // temp_04_id
      },
      66: {
        convert: 'unsignedThousandth'  // power_voltage
      },
      67: {
        convert: 'unsignedThousandth'  // battery_voltage
      },
      68: {
        convert: 'unsignedThousandth'  // battery_current
      },
      70: {
        convert: 'signedTenth'  // pcb_temp
      },
      71: {
        convert: 'leToHex'  // temp_04_id
      },
      72: {
        convert: 'signedTenth'  // temp_01
      },
      73: {
        convert: 'signedTenth'  // temp_02
      },
      74: {
        convert: 'signedTenth'  // temp_03
      },
      75: {
        convert: 'signedTenth'  // temp_04
      },
      76: {
        convert: 'leToHex'  // temp_01_id
      },
      77: {
        convert: 'leToHex'  // temp_02_id
      },
      78: {
        convert: 'iButton'  // driver_id
      },
      79: {
        convert: 'leToHex'  // temp_03_id
      },
      80: {
        convert: 'unsignedValue'  // wheel_speed
      },
      83: {
        convert: 'unsignedTenth'  // fuel_consumed
      },
      84: {
        convert: 'unsignedTenth'  // fuel_level
      },
      86: {
        convert: 'unsignedTenth'  // humidity_ble_01
      },
      87: {
        convert: 'unsignedThousandth'  // total_mileage
      },
      88: {
        convert: 'unsignedValue'  // engine_speed
      },
      104: {
        convert: 'unsignedTenth'  // humidity_ble_02
      },
      105: {
        convert: 'unsignedThousandth'  // total_mileage_counted
      },
      106: {
        convert: 'unsignedTenth'  // humidity_ble_03
      },
      107: {
        convert: 'unsignedTenth'  // fuel_consumed_counted
      },
      108: {
        convert: 'unsignedTenth'  // humidity_ble_04
      },
      109: {
        convert: 'unsignedValue'  // software_version_supported
      },
      110: {
        convert: 'unsignedTenth'  // fuel_rate_per_litre
      },
      112: {
        convert: 'unsignedTenth'  // adblue_level
      },
      113: {
        convert: 'signedValue'  // service_distance
      },
      115: {
        convert: 'signedTenth'  // engine_temp
      },
      123: {
        convert: 'leToHex'  // control_state_flags
      },
      127: {
        convert: 'unsignedValue'  // mowing_efficiency
      },
      128: {
        convert: 'signedValue'  // ambient_air_temp
      },
      132: {
        convert: 'leToHex'  // security_state_flags
      },
      133: {
        convert: 'unsignedThousandth'  // tacho_total_distance
      },
      134: {
        convert: 'unsignedThousandth'  // trip_distance
      },
      135: {
        convert: 'unsignedValue'  // fuel_rate
      },
      136: {
        convert: 'unsignedValue'  // instantaneous_fuel_economy
      },
      138: {
        convert: 'unsignedValue'  // engine_total_fuel_used_hr
      },
      139: {
        convert: 'unsignedValue'  // gross_combination_vehicle_weight
      },
      141: {
        convert: 'signedTenth'  // can_battery_temp
      },
      151: {
        convert: 'signedTenth'  // battery_temp
      },
      177: {
        convert: 'leToStrAscii'  // dtc_codes
      },
      181: {
        convert: 'unsignedTenth'  // pdop
      },
      182: {
        convert: 'unsignedTenth'  // hdop
      },
      192: {
        convert: 'unsignedThousandth'  // tco_odometer
      },
      193: {
        convert: 'unsignedThousandth'  // tco_trip_distance
      },
      194: {
        convert: 'unsignedValue'  // tco_timestamp
      },
      199: {
        convert: 'unsignedThousandth'  // odo_diff
      },
      201: {
        convert: 'signedValue'  // fuel_level_01
      },
      202: {
        convert: 'signedValue'  // fuel_temp_01
      },
      203: {
        convert: 'signedValue'  // fuel_level_02
      },
      204: {
        convert: 'signedValue'  // fuel_temp_02
      },
      205: {
        convert: 'unsignedValue'  // gsm_cell
      },
      207: {
        convert: 'leToHex'  // rfid_id
      },
      210: {
        convert: 'signedValue'  // fuel_level_03
      },
      211: {
        convert: 'signedValue'  // fuel_temp_03
      },
      212: {
        convert: 'signedValue'  // fuel_level_04
      },
      213: {
        convert: 'signedValue'  // fuel_temp_04
      },
      214: {
        convert: 'signedValue'  // fuel_level_05
      },
      215: {
        convert: 'signedValue'  // fuel_temp_05
      },
      216: {
        convert: 'unsignedThousandth'  // odometer
      },
      217: {
        convert: 'leToHex'  // rfid_com2
      },
      219: {
        convert: 'leToStrAscii'  // iccid_01
      },
      220: {
        convert: 'leToStrAscii'  // iccid_02
      },
      221: {
        convert: 'leToStrAscii'  // iccid_03
      },
      224: {
        convert: 'signedTenth'  // ultrasonic_fuel_level_1
      },
      225: {
        convert: 'signedTenth'  // ultrasonic_fuel_level_2
      },
      227: {
        convert: 'unsignedValue'  // cng_used
      },
      231: {
        convert: 'leToStrAscii'  // tco_vehicle_registration_number_part1
      },
      232: {
        convert: 'leToStrAscii'  // tco_vehicle_registration_number_part2
      },
      233: {
        convert: 'leToStrAscii'  // tco_vehicle_identification_number_part1
      },
      234: {
        convert: 'leToStrAscii'  // tco_vehicle_identification_number_part2
      },
      236: {
        convert: 'signedThousandth'  // x
      },
      237: {
        convert: 'signedThousandth'  // y
      },
      238: {
        convert: 'signedThousandth'  // z
      },
      239: {
        convert: 'toStr'  // ignition
      },
      240: {
        convert: 'toStr'  // moving
      },
      241: {
        convert: 'toStrAscii'  // gsm_code
      },
      244: {
        convert: 'unsignedValue'  // camera_image_generated
      },
      245: {
        convert: 'unsignedThousandth'  // analog_04
      },
      254: {
        convert: 'unsignedHundredth'  // eco_value
      },
      256: {
        convert: 'toStrAscii'  // vin
      },
      269: {
        convert: 'signedValue'  // escort_lls_temp_01
      },
      271: {
        convert: 'unsignedHundredth'  // escort_lls_battery_voltage_01
      },
      272: {
        convert: 'signedValue'  // escort_lls_temp_02
      },
      274: {
        convert: 'unsignedHundredth'  // escort_lls_battery_voltage_02
      },
      275: {
        convert: 'signedValue'  // escort_lls_temp_03
      },
      277: {
        convert: 'unsignedHundredth'  // escort_lls_battery_voltage_03
      },
      278: {
        convert: 'signedValue'  // escort_lls_temp_04
      },
      280: {
        convert: 'unsignedHundredth'  // escort_lls_battery_voltage_04
      },
      281: {
        convert: 'toStrAsciiStripUnicode'  // can_fault_codes
      },
      296: {
        convert: 'unsignedTenth'  // me_headway_measurement
      },
      304: {
        convert: 'unsignedThousandth'  // range_battery
      },
      325: {
        convert: 'toStrAscii'  // vin
      },
      327: {
        convert: 'signedTenth'  // ul202-02_sensor_fuel_level
      },
      389: {
        convert: 'unsignedThousandth'  // obd_oem_total_mileage
      },
      390: {
        convert: 'signedValue'  // external_sensor_temp_00
      },
      391: {
        convert: 'signedValue'  // external_sensor_temp_01
      },
      392: {
        convert: 'signedValue'  // external_sensor_temp_02
      },
      393: {
        convert: 'signedValue'  // external_sensor_temp_03
      },
      394: {
        convert: 'signedValue'  // external_sensor_temp_04
      },
      395: {
        convert: 'signedValue'  // external_sensor_temp_05
      },
      483: {
        convert: 'unsignedValue'  // impulse_counter_2
      },
      484: {
        convert: 'signedValue'  // euroscan_external_sensor_temp_1
      },
      485: {
        convert: 'signedValue'  // euroscan_external_sensor_temp_2
      },
      486: {
        convert: 'signedValue'  // euroscan_external_sensor_temp_3
      },
      487: {
        convert: 'signedValue'  // euroscan_external_sensor_temp_4
      },
      488: {
        convert: 'signedValue'  // euroscan_external_sensor_temp_5
      },
      489: {
        convert: 'signedValue'  // euroscan_external_sensor_temp_6
      },
      500: {
        convert: 'signedValue'  // slope_of_arm
      },
      501: {
        convert: 'signedValue'  // rotation_of_arm
      },
      508: {
        convert: 'unsignedValue'  // spread_fine_grained_salt
      },
      509: {
        convert: 'unsignedValue'  // coarse_grained_salt
      },
      510: {
        convert: 'unsignedValue'  // spread_dimix
      },
      511: {
        convert: 'unsignedValue'  // spread_coarse_grained_calcium
      },
      512: {
        convert: 'unsignedValue'  // spread_calcium_chloride
      },
      513: {
        convert: 'unsignedValue'  // spread_sodium_chloride
      },
      514: {
        convert: 'unsignedValue'  // spread_magnesium_chloride
      },
      515: {
        convert: 'unsignedValue'  // amount_of_spread_gravel
      },
      516: {
        convert: 'unsignedValue'  // amount_of_spread_sand
      },
      519: {
        convert: 'unsignedValue'  // salt_spreader_working_hours
      },
      520: {
        convert: 'unsignedValue'  // distance_during_salting
      },
      521: {
        convert: 'unsignedValue'  // load_weight
      },
      523: {
        convert: 'unsignedValue'  // cruise_time
      },
      525: {
        convert: 'toStrAsciiStripUnicode'  // fault_codes
      },
      526: {
        convert: 'unsignedThousandth'  // vehicles_range_on_battery
      },
      527: {
        convert: 'unsignedThousandth'  // vehicles_range_on_additional_fuel
      },
      528: {
        convert: 'toStrAscii'  // vin
      },
      701: {
        convert: 'signedValue'  // temp_ble_01
      },
      702: {
        convert: 'signedValue'  // temp_ble_02
      },
      703: {
        convert: 'signedValue'  // temp_ble_03
      },
      704: {
        convert: 'signedValue'  // temp_ble_04
      },
      725: {
        convert: 'unsignedValue'  // ble_freq_1
      },
      726: {
        convert: 'unsignedValue'  // ble_freq_2
      },
      727: {
        convert: 'unsignedValue'  // ble_freq_3
      },
      728: {
        convert: 'unsignedValue'  // ble_freq_4
      },
      729: {
        convert: 'unsignedValue'  // ble_sensor_custom_12
      },
      730: {
        convert: 'unsignedValue'  // ble_sensor_custom_13
      },
      731: {
        convert: 'unsignedValue'  // ble_sensor_custom_14
      },
      732: {
        convert: 'unsignedValue'  // ble_sensor_custom_15
      },
      734: {
        convert: 'unsignedValue'  // ble_sensor_custom_23
      },
      735: {
        convert: 'unsignedValue'  // ble_sensor_custom_24
      },
      736: {
        convert: 'unsignedValue'  // ble_sensor_custom_25
      },
      737: {
        convert: 'unsignedValue'  // ble_sensor_custom_32
      },
      738: {
        convert: 'unsignedValue'  // ble_sensor_custom_33
      },
      739: {
        convert: 'unsignedValue'  // ble_sensor_custom_34
      },
      740: {
        convert: 'unsignedValue'  // ble_sensor_custom_35
      },
      741: {
        convert: 'unsignedValue'  // ble_sensor_custom_42
      },
      742: {
        convert: 'unsignedValue'  // ble_sensor_custom_43
      },
      743: {
        convert: 'unsignedValue'  // ble_sensor_custom_44
      },
      744: {
        convert: 'unsignedValue'  // ble_sensor_custom_45
      },
      10009: {
        convert: 'unsignedHundredth'  // eco_score
      },
      10041: {
        convert: 'unsignedTenth'  // freezer_battery_voltage
      },
      10042: {
        convert: 'unsignedValue'  // freezer_total_electric_minutes
      },
      10043: {
        convert: 'unsignedValue'  // freezer_total_vehicle_minutes
      },
      10044: {
        convert: 'unsignedValue'  // freezer_total_engine_minutes
      },
      10047: {
        convert: 'signedTenth'  // freezer_zone_1_return_air_temp_1
      },
      10048: {
        convert: 'signedTenth'  // freezer_zone_1_supply_air_temp_1
      },
      10049: {
        convert: 'signedTenth'  // freezer_zone_1_temp_setpoint
      },
      10050: {
        convert: 'signedTenth'  // freezer_zone_1_evaporator_coil_temp
      },
      10051: {
        convert: 'signedTenth'  // freezer_zone_1_return_air_temp_2
      },
      10052: {
        convert: 'signedTenth'  // freezer_zone_1_supply_air_temp_2
      },
      10056: {
        convert: 'signedTenth'  // freezer_zone_2_return_air_temp_1
      },
      10057: {
        convert: 'signedTenth'  // freezer_zone_2_supply_air_temp_1
      },
      10058: {
        convert: 'signedTenth'  // freezer_zone_2_temp_setpoint
      },
      10059: {
        convert: 'signedTenth'  // freezer_zone_2_evaporator_coil_temp
      },
      10060: {
        convert: 'signedTenth'  // freezer_zone_2_return_air_temp_2
      },
      10061: {
        convert: 'signedTenth'  // freezer_zone_2_supply_air_temp_2
      },
      10065: {
        convert: 'signedTenth'  // freezer_zone_3_return_air_temp_1
      },
      10066: {
        convert: 'signedTenth'  // freezer_zone_3_supply_air_temp_1
      },
      10067: {
        convert: 'signedTenth'  // freezer_zone_3_temp_setpoint
      },
      10068: {
        convert: 'signedTenth'  // freezer_zone_3_evaporator_coil_temp
      },
      10069: {
        convert: 'signedTenth'  // freezer_zone_3_return_air_temp_2
      },
      10070: {
        convert: 'signedTenth'  // freezer_zone_3_supply_air_temp_2
      },
      10191: {
        convert: 'leToStrAscii'  // graphical_position
      },
      10350: {
        convert: 'signedTenth'  // freezer_ambient_air_temp
      },
      10351: {
        convert: 'signedTenth'  // freezer_coolant_temp
      },
      10356: {
        convert: 'leToStrAscii'  // freezer_installation_serial
      },
      10357: {
        convert: 'leToStrAscii'  // freezer_trailer_serial
      },
      10475: {
        convert: 'unsignedValue'  // freezer_maintenance_1_hours
      },
      10476: {
        convert: 'unsignedValue'  // freezer_maintenance_2_hours
      },
      10477: {
        convert: 'unsignedValue'  // freezer_maintenance_3_hours
      },
      10478: {
        convert: 'unsignedValue'  // freezer_maintenance_4_hours
      },
      10479: {
        convert: 'unsignedValue'  // freezer_maintenance_5_hours
      },
      10503: {
        convert: 'unsignedValue'  // tco_next_calibration_date
      },
      10504: {
        convert: 'unsignedValue'  // tco_driver_1_end_of_last_daily_rest_report
      },
      10505: {
        convert: 'unsignedValue'  // tco_driver_1_end_of_last_weekly_rest_period
      },
      10506: {
        convert: 'unsignedValue'  // tco_driver_1_end_of_second_last_weekly_rest_period
      },
      10511: {
        convert: 'unsignedValue'  // tco_driver_2_end_of_last_daily_rest_report
      },
      10512: {
        convert: 'unsignedValue'  // tco_driver_2_end_of_last_weekly_rest_period
      },
      10513: {
        convert: 'unsignedValue'  // tco_driver_2_end_of_second_last_weekly_rest_period
      },
      10518: {
        convert: 'toStrAsciiStripUnicode'  // tco_driver_1_name
      },
      10519: {
        convert: 'toStrAsciiStripUnicode'  // tco_driver_1_surname
      },
      10520: {
        convert: 'toStrAsciiStripUnicode'  // tco_driver_2_name
      },
      10521: {
        convert: 'toStrAsciiStripUnicode'  // tco_driver_2_surname
      },
      10640: {
        convert: 'unsignedValue'  // impulse_counter_frequency_1
      },
      10641: {
        convert: 'unsignedValue'  // impulse_counter_rpm_1
      },
      10642: {
        convert: 'unsignedValue'  // impulse_counter_frequency_2
      },
      10643: {
        convert: 'unsignedValue'  // impulse_counter_rpm_2
      },
      10644: {
        convert: 'signedValue'  // freezer_temp_probe_1
      },
      10645: {
        convert: 'signedValue'  // freezer_temp_probe_2
      },
      10646: {
        convert: 'signedValue'  // freezer_temp_probe_3
      },
      10647: {
        convert: 'signedValue'  // freezer_temp_probe_4
      },
      10648: {
        convert: 'signedValue'  // freezer_temp_probe_5
      },
      10649: {
        convert: 'signedValue'  // freezer_temp_probe_6
      },
      10683: {
        convert: 'signedTenth'  // transcan_temp_1
      },
      10684: {
        convert: 'signedTenth'  // transcan_temp_2
      },
      10685: {
        convert: 'signedTenth'  // transcan_temp_3
      },
      10686: {
        convert: 'signedTenth'  // transcan_temp_4
      },
      10695: {
        convert: 'signedTenth'  // touchprint_input_1
      },
      10696: {
        convert: 'signedTenth'  // touchprint_input_2
      },
      10697: {
        convert: 'signedTenth'  // touchprint_input_3
      },
      10698: {
        convert: 'signedTenth'  // touchprint_input_4
      },
      10699: {
        convert: 'signedTenth'  // touchprint_input_5
      },
      10700: {
        convert: 'signedTenth'  // touchprint_input_6
      },
      10701: {
        convert: 'signedTenth'  // touchprint_setpoint_1
      },
      10702: {
        convert: 'signedTenth'  // touchprint_setpoint_2
      },
      10703: {
        convert: 'signedTenth'  // touchprint_setpoint_3
      },
      10879: {
        convert: 'unsignedThousandthFifty'  // high_voltage_battery_voltage
      },
      10880: {
        convert: 'signedThousandthFifty'  // high_voltage_battery_current
      },
      10886: {
        convert: 'signedThousandthFifty'  // evse1_ac_rms_current
      },
      10887: {
        convert: 'unsignedThousandthFifty'  // evse1_ac_rms_voltage
      },
      10889: {
        convert: 'cellTemperature'  // high_voltage_battery_highest_cell_temp
      },
      10890: {
        convert: 'cellTemperature'  // high_voltage_battery_lowest_cell_temp
      },
      10891: {
        convert: 'cellTemperature'  // propulsion_motor_coolant_fan_1_control_temp
      },
      10893: {
        convert: 'signedValue'  // high_voltage_battery_temp
      },
      10896: {
        convert: 'unsignedTwo'  // trailer_weight
      },
      10897: {
        convert: 'unsignedTwo'  // cargo_weight
      },
      10898: {
        convert: 'unsignedTen'  // powered_vehicle_weight
      },
      10899: {
        convert: 'unsignedTen'  // gross_combination_vehicle_weight
      },
      10901: {
        convert: 'unsignedThousandth'  // highest_cell_voltage
      },
      10902: {
        convert: 'unsignedThousandth'  // lowest_cell_voltage
      },
      10904: {
        convert: 'unsignedFourTenth'  // hvess_state_of_health
      },
      12001: {
        convert: 'toStrAsciiStripUnicode'  // fms_eco_active_driver_id
      },
      12002: {
        convert: 'toStrAscii'  // fms_eco_vin_number
      },
      12010: {
        convert: 'unsignedThousandth'  // fms_eco_coasting_distance
      },
      12011: {
        convert: 'unsignedThousandth'  // fms_eco_coasting_fuel_used
      },
      12012: {
        convert: 'unsignedValue'  // fms_eco_coasting_time
      },
      12013: {
        convert: 'unsignedThousandth'  // fms_eco_ecoroll_distance
      },
      12014: {
        convert: 'unsignedThousandth'  // fms_eco_ecoroll_fuel_used
      },
      12015: {
        convert: 'unsignedValue'  // fms_eco_ecoroll_time
      },
      12016: {
        convert: 'unsignedThousandth'  // fms_eco_braking_distance
      },
      12017: {
        convert: 'unsignedThousandth'  // fms_eco_braking_fuel_used
      },
      12018: {
        convert: 'unsignedValue'  // fms_eco_braking_time
      },
      12019: {
        convert: 'unsignedValue'  // fms_eco_braking_count
      },
      12020: {
        convert: 'unsignedThousandth'  // fms_eco_retarder_distance
      },
      12021: {
        convert: 'unsignedThousandth'  // fms_eco_retarder_fuel_used
      },
      12022: {
        convert: 'unsignedValue'  // fms_eco_retarder_time
      },
      12023: {
        convert: 'unsignedThousandth'  // fms_eco_cruise_distance
      },
      12024: {
        convert: 'unsignedThousandth'  // fms_eco_cruise_fuel_used
      },
      12025: {
        convert: 'unsignedValue'  // fms_eco_cruise_time
      },
      12026: {
        convert: 'unsignedThousandth'  // fms_eco_torque_distance
      },
      12027: {
        convert: 'unsignedThousandth'  // fms_eco_torque_fuel_used
      },
      12028: {
        convert: 'unsignedValue'  // fms_eco_torque_time
      },
      12029: {
        convert: 'unsignedThousandth'  // fms_eco_pto_distance
      },
      12030: {
        convert: 'unsignedThousandth'  // fms_eco_pto_fuel_used
      },
      12031: {
        convert: 'unsignedValue'  // fms_eco_pto_time
      },
      12032: {
        convert: 'unsignedThousandth'  // fms_eco_fuel_while_driving_fuel
      },
      12033: {
        convert: 'unsignedThousandth'  // fms_eco_fuel_while_idle_fuel
      },
      12034: {
        convert: 'unsignedThousandth'  // fms_eco_engine_load_fuel
      },
      12035: {
        convert: 'unsignedThousandth'  // fms_eco_total_distance
      },
      12036: {
        convert: 'unsignedThousandth'  // fms_eco_total_fuel_used
      },
      12037: {
        convert: 'unsignedValue'  // fms_eco_total_time
      },
      12100: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_1_distance
      },
      12101: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_2_distance
      },
      12102: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_3_distance
      },
      12103: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_4_distance
      },
      12104: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_5_distance
      },
      12105: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_6_distance
      },
      12106: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_7_distance
      },
      12107: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_8_distance
      },
      12108: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_9_distance
      },
      12109: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_10_distance
      },
      12110: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_1_fuel_used
      },
      12111: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_2_fuel_used
      },
      12112: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_3_fuel_used
      },
      12113: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_4_fuel_used
      },
      12114: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_5_fuel_used
      },
      12115: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_6_fuel_used
      },
      12116: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_7_fuel_used
      },
      12117: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_8_fuel_used
      },
      12118: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_9_fuel_used
      },
      12119: {
        convert: 'unsignedThousandth'  // fms_eco_speed_range_10_fuel_used
      },
      12120: {
        convert: 'unsignedValue'  // fms_eco_speed_range_1_time
      },
      12121: {
        convert: 'unsignedValue'  // fms_eco_speed_range_2_time
      },
      12122: {
        convert: 'unsignedValue'  // fms_eco_speed_range_3_time
      },
      12123: {
        convert: 'unsignedValue'  // fms_eco_speed_range_4_time
      },
      12124: {
        convert: 'unsignedValue'  // fms_eco_speed_range_5_time
      },
      12125: {
        convert: 'unsignedValue'  // fms_eco_speed_range_6_time
      },
      12126: {
        convert: 'unsignedValue'  // fms_eco_speed_range_7_time
      },
      12127: {
        convert: 'unsignedValue'  // fms_eco_speed_range_8_time
      },
      12128: {
        convert: 'unsignedValue'  // fms_eco_speed_range_9_time
      },
      12129: {
        convert: 'unsignedValue'  // fms_eco_speed_range_10_time
      },
      12130: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_1_distance
      },
      12131: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_2_distance
      },
      12132: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_3_distance
      },
      12133: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_4_distance
      },
      12134: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_5_distance
      },
      12135: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_6_distance
      },
      12136: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_7_distance
      },
      12137: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_8_distance
      },
      12138: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_9_distance
      },
      12139: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_10_distance
      },
      12140: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_1_fuel_used
      },
      12141: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_2_fuel_used
      },
      12142: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_3_fuel_used
      },
      12143: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_4_fuel_used
      },
      12144: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_5_fuel_used
      },
      12145: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_6_fuel_used
      },
      12146: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_7_fuel_used
      },
      12147: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_8_fuel_used
      },
      12148: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_9_fuel_used
      },
      12149: {
        convert: 'unsignedThousandth'  // fms_eco_rpm_range_10_fuel_used
      },
      12150: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_1_time
      },
      12151: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_2_time
      },
      12152: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_3_time
      },
      12153: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_4_time
      },
      12154: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_5_time
      },
      12155: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_6_time
      },
      12156: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_7_time
      },
      12157: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_8_time
      },
      12158: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_9_time
      },
      12159: {
        convert: 'unsignedValue'  // fms_eco_rpm_range_10_time
      },
      12160: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_1_distance
      },
      12161: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_2_distance
      },
      12162: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_3_distance
      },
      12163: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_4_distance
      },
      12164: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_5_distance
      },
      12165: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_6_distance
      },
      12166: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_7_distance
      },
      12167: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_8_distance
      },
      12168: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_9_distance
      },
      12169: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_10_distance
      },
      12170: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_1_fuel_used
      },
      12171: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_2_fuel_used
      },
      12172: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_3_fuel_used
      },
      12173: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_4_fuel_used
      },
      12174: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_5_fuel_used
      },
      12175: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_6_fuel_used
      },
      12176: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_7_fuel_used
      },
      12177: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_8_fuel_used
      },
      12178: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_9_fuel_used
      },
      12179: {
        convert: 'unsignedThousandth'  // fms_eco_torque_range_10_fuel_used
      },
      12180: {
        convert: 'unsignedValue'  // fms_eco_torque_range_1_time
      },
      12181: {
        convert: 'unsignedValue'  // fms_eco_torque_range_2_time
      },
      12182: {
        convert: 'unsignedValue'  // fms_eco_torque_range_3_time
      },
      12183: {
        convert: 'unsignedValue'  // fms_eco_torque_range_4_time
      },
      12184: {
        convert: 'unsignedValue'  // fms_eco_torque_range_5_time
      },
      12185: {
        convert: 'unsignedValue'  // fms_eco_torque_range_6_time
      },
      12186: {
        convert: 'unsignedValue'  // fms_eco_torque_range_7_time
      },
      12187: {
        convert: 'unsignedValue'  // fms_eco_torque_range_8_time
      },
      12188: {
        convert: 'unsignedValue'  // fms_eco_torque_range_9_time
      },
      12189: {
        convert: 'unsignedValue'  // fms_eco_torque_range_10_time
      },
      12190: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_1_distance
      },
      12191: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_2_distance
      },
      12192: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_3_distance
      },
      12193: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_4_distance
      },
      12194: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_5_distance
      },
      12195: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_6_distance
      },
      12196: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_7_distance
      },
      12197: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_8_distance
      },
      12198: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_9_distance
      },
      12199: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_10_distance
      },
      12200: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_1_fuel_used
      },
      12201: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_2_fuel_used
      },
      12202: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_3_fuel_used
      },
      12203: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_4_fuel_used
      },
      12204: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_5_fuel_used
      },
      12205: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_6_fuel_used
      },
      12206: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_7_fuel_used
      },
      12207: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_8_fuel_used
      },
      12208: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_9_fuel_used
      },
      12209: {
        convert: 'unsignedThousandth'  // fms_eco_braking_range_10_fuel_used
      },
      12210: {
        convert: 'unsignedValue'  // fms_eco_braking_range_1_time
      },
      12211: {
        convert: 'unsignedValue'  // fms_eco_braking_range_2_time
      },
      12212: {
        convert: 'unsignedValue'  // fms_eco_braking_range_3_time
      },
      12213: {
        convert: 'unsignedValue'  // fms_eco_braking_range_4_time
      },
      12214: {
        convert: 'unsignedValue'  // fms_eco_braking_range_5_time
      },
      12215: {
        convert: 'unsignedValue'  // fms_eco_braking_range_6_time
      },
      12216: {
        convert: 'unsignedValue'  // fms_eco_braking_range_7_time
      },
      12217: {
        convert: 'unsignedValue'  // fms_eco_braking_range_8_time
      },
      12218: {
        convert: 'unsignedValue'  // fms_eco_braking_range_9_time
      },
      12219: {
        convert: 'unsignedValue'  // fms_eco_braking_range_10_time
      }
    };
  }
}

module.exports = Codec8;

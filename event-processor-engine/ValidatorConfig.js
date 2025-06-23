class ValidatorConfig {
    static Events = {
        PANIC: "panic",
        HARSH_ACCEL: "harsh_accel",
        HARSH_BRAKE: "harsh_brake",
        HARSH_CORNER: "harsh_corner",
        POWER_LOW: "power_low",
        POWER_HIGH: "power_high",
        POWER_DISCONNECT: "power_disconnect",
        POWER_RECONNECT: "power_reconnect",
        BATTERY_LOW: "battery_low",
        BATTERY_DISCONNECT: "battery_disconnect",
        BATTERY_RECONNECT: "battery_reconnect",
        BATTERY_ACTIVE: "battery_active",
        GSM_SIGNAL_LOW: "gsm_signal_low",
        GSM_ANTENNA_FAULT: "gsm_antenna_fault",
        GSM_JAMMED: "gsm_jammed",
        GPS_FAILURE: "gps_failure",
        GPS_SIGNAL_LOW: "gps_signal_low",
        GPS_ANTENNA_FAULT: "gps_antenna_fault",
        GPS_JAMMED: "gps_jammed",
        IMPACT: "impact",
        UNAUTHORIZED_MOVEMENT: "unauthorized_movement",
        MOTION_START: "motion_start",
        MOTION_END: "motion_end",
        TOWING: "towing",
        OVER_RPM: "over_rpm",
        EXCESSIVE_STOP_START: "excessive_stop_start",
        EXCESSIVE_STOP_END: "excessive_stop_end",
        VOICE_CALL_STARTED: "voice_call_started",
        VOICE_CALL_ENDED: "voice_call_ended",
        VOICE_CALLBACK: "voice_callback",
        ALARM_ACTIVE: "alarm_active",
        ALARM_ARMED: "alarm_armed",
        ALARM_DISARMED: "alarm_disarmed",
        CURFEW_VIOLATION: "curfew_violation",
        POWER_ON: "power_on",
        POWER_OFF: "power_off",
        ANALOG_RANGE: "analog_range",
        ANALOG_JUMP: "analog_jump",
        TILT: "tilt",
        VIN_CHANGED: "vin_changed",
    }

    static getEventType(eventName) {
        return this.Events[eventName];
    }

    static addEvent(name, type) {
        this.Events[name] = type;
    }
}
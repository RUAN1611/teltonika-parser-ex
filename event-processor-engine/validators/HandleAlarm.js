const ValidatorConfig = require("../ValidatorConfig");

class HandleAlarm {
  validate(telemetryValue, label) {
    const isAlarmTriggered = telemetryValue === 1;

    if (isAlarmTriggered) {
      return {
        shouldTriggerEvent: true,
        eventClassText: "Alarm Event",
        eventType: "alarm_event",
        eventTelemetry: label,
        eventValue: telemetryValue,
        eventAdditionalTelemetryColumn: ValidatorConfig.Events.PANIC,
      };
    }

    return {
      shouldTriggerEvent: false,
      reason: "Alarm not triggered",
    };
  }
}

module.exports = HandleAlarm;

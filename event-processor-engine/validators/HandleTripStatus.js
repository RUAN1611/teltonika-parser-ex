// Reviewed with Werner
const ValidationEngine = require('../ValidationEngine');

class HandleTripStatus {

    constructor() {
        this.eventAdditionalTelemetryColumns = [];
    }

    addEventAdditionalTelemetryColumn(columnName, value) {
        this.eventAdditionalTelemetryColumns.push({
            columnName: columnName,
            value: value
        });
    }

    validate(telemetryValue, label) {
        let shouldTriggerEvent = true;
        if(telemetryValue === 0) {
            this.addEventAdditionalTelemetryColumn("trip", telemetryValue);
            return {
                shouldTriggerEvent: shouldTriggerEvent,
                eventClassText: "Trip Event",
                eventType: "stop",
                eventTelemetry: label,
                eventValue: telemetryValue,
                eventAdditionalTelemetryColumns: this.eventAdditionalTelemetryColumns,
                reason: 'Trip stopped',
            };
        }
        else if(telemetryValue >= 1) {
            this.addEventAdditionalTelemetryColumn("trip", telemetryValue);
            if(telemetryValue === 2) {
                this.addEventAdditionalTelemetryColumn("business", telemetryValue);
                return {
                    shouldTriggerEvent: shouldTriggerEvent,
                    eventClassText: "Trip Event",
                    eventType: "business_status",
                    eventTelemetry: label,
                    eventValue: telemetryValue,
                    eventAdditionalTelemetryColumns: this.eventAdditionalTelemetryColumns,
                    reason: 'Business trip',
                };
            }
            else if(telemetryValue === 3) {
                this.addEventAdditionalTelemetryColumn("private", telemetryValue);
                return {
                    shouldTriggerEvent: shouldTriggerEvent,
                    eventClassText: "Trip Event",
                    eventType: "private_status",
                    eventTelemetry: label,
                    eventValue: telemetryValue,
                    eventAdditionalTelemetryColumns: this.eventAdditionalTelemetryColumns,
                    reason: 'Private trip',
                };
            }
            else if(telemetryValue >= 4 && telemetryValue <= 9) {
                this.addEventAdditionalTelemetryColumn("custom", telemetryValue);
                return {
                    shouldTriggerEvent: shouldTriggerEvent,
                    eventClassText: "Trip Event",
                    eventType: "custom_status",
                    eventTelemetry: label,
                    eventValue: telemetryValue,
                    eventAdditionalTelemetryColumns: this.eventAdditionalTelemetryColumns,
                    reason: 'Custom trip',
                };
            }
            else {
                return {
                    shouldTriggerEvent: false,
                    reason: 'Trip status unknown',
                };
            }
        }
        else  {
            return {
                shouldTriggerEvent: false,
                reason: 'Trip status unknown',
            };
        }
    }
}

module.exports = HandleTripStatus;
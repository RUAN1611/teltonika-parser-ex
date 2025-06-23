class ValidatorConfig {
    static Events = {
        PANIC: "panic"
    }

    static getEventType(eventName) {
        return this.Events[eventName];
    }

    static addEvent(name, type) {
        this.Events[name] = type;
    }
}
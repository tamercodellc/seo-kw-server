const Main = require("./Main");
const {Op} = require("sequelize");

class CalendarEvent extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'calendar_event');
    }

    static async listCalendarEvent(method, options = {}) {
        const instance = new CalendarEvent();
        return await instance.list(method, options);
    }

    static async listCalendarEventByPk(id, options) {
        const instance = new CalendarEvent({});
        return await instance.listByPk(id, options);
    }

    static updateCalendarEvent(transaction, calendar_event, user, options) {
        const instance = new CalendarEvent(calendar_event, user);
        return instance.update(transaction, options);
    }

    static async createCalendarEventFactory(transaction, calendar_event, user) {
        checkCalendarEventRequirement(calendar_event);

        let newCalendarEvent = new CalendarEvent(calendar_event, user);

        return await newCalendarEvent.create(transaction);
    }

    static async updateCalendarEventFactory(transaction, calendar_event, user) {
        checkCalendarEventRequirement(calendar_event);

        let options = {
            where: {
                calendar_event_id: {
                    [Op.eq]: calendar_event.calendar_event_id
                }
            }
        };

        return await CalendarEvent.updateCalendarEvent(transaction, calendar_event, user, options);
    }

    static async deleteCalendarEvent(transaction, calendar_event_id, user) {
        let options = {
            where: {
                calendar_event_id: {
                    [Op.eq]: calendar_event_id
                }
            }
        };
        const instance = new CalendarEvent({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'calendar_event_start_date',
        'calendar_event_end_date',
        'calendar_event_start_time',
        'calendar_event_end_time',
        'calendar_event_title',
        'calendar_event_description',
        'calendar_event_color',
        'deleted_at'
    ];
}

function checkCalendarEventRequirement(calendar_event) {
    if (!calendar_event.calendar_event_start_date) {
        throw new Error('Calendar Event start date is required');
    }

    if (!calendar_event.calendar_event_end_date) {
        throw new Error('Calendar Event end date is required');
    }

    if (!calendar_event.calendar_event_start_time) {
        throw new Error('Calendar Event start time is required');
    }

    if (!calendar_event.calendar_event_end_time) {
        throw new Error('Calendar Event end time is required');
    }

    if (!calendar_event.calendar_event_title) {
        throw new Error('Calendar Event title is required');
    }
}

module.exports = CalendarEvent;

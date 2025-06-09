const {handleDataToReturn, handleError} = require("../../helper");
const CalendarEvent = require("../../classes/CalendarEvent");
const {Op} = require("sequelize");
const {caregiver} = require('../../database');
const models = require("../../database");

const _calendar_event = {
    async listCalendarEvent(req, res) {
        try {
            let query = {}
            const insurances = await CalendarEvent.listCalendarEvent('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listCalendarEventByPk(req, res) {
        const {calendar_event_id} = req.params;

        try {
            const options = {}
            const insurance = await CalendarEvent.listCalendarEventByPk(calendar_event_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createCalendarEvent(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let calendar_event = await CalendarEvent.createCalendarEventFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(calendar_event, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateCalendarEvent(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let calendar_event = await CalendarEvent.updateCalendarEventFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(calendar_event, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteCalendarEvent(req, res) {
        const {calendar_event_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await CalendarEvent.deleteCalendarEvent(transaction, calendar_event_id, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn({}, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    }
}

module.exports = _calendar_event;
const {handleDataToReturn, handleError} = require("../../helper");
const Time_sheet = require("../../classes/TimeSheet");
const models = require("../../database");

const _time_sheet = {
    async listTimeSheet(req, res) {
        try {
            let query = {}
            const insurances = await Time_sheet.listTimeSheet('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listTimeSheetByPk(req, res) {
        const {time_sheet_id} = req.params;

        try {
            const options = {}
            const insurance = await Time_sheet.listTimeSheetByPk(time_sheet_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createTimeSheet(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let time_sheet = await Time_sheet.createTimeSheetFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(time_sheet, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateTimeSheet(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let time_sheet = await Time_sheet.updateTimeSheetFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(time_sheet, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteTimeSheet(req, res) {
        const {time_sheet_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await Time_sheet.deleteTimeSheet(transaction, time_sheet_id, req.authUser);

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

module.exports = _time_sheet;
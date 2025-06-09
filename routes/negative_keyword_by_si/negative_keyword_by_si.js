const {handleDataToReturn, handleError} = require("../../helper");
const Negative_keyword_by_si = require("../../classes/NegativeKeywordBySi");
const models = require("../../database");

const _negative_keyword_by_si = {
    async listNegativeKeywordBySi(req, res) {
        try {
            let query = {}
            const insurances = await Negative_keyword_by_si.listNegativeKeywordBySi('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listNegativeKeywordBySiByPk(req, res) {
        const {negative_keyword_by_si_id} = req.params;

        try {
            const options = {}
            const insurance = await Negative_keyword_by_si.listNegativeKeywordBySiByPk(negative_keyword_by_si_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createNegativeKeywordBySi(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let negative_keyword_by_si = await Negative_keyword_by_si.createNegativeKeywordBySiFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(negative_keyword_by_si, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateNegativeKeywordBySi(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let negative_keyword_by_si = await Negative_keyword_by_si.updateNegativeKeywordBySiFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(negative_keyword_by_si, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteNegativeKeywordBySi(req, res) {
        const {negative_keyword_by_si_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await Negative_keyword_by_si.deleteNegativeKeywordBySi(transaction, negative_keyword_by_si_id, req.authUser);

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

module.exports = _negative_keyword_by_si;
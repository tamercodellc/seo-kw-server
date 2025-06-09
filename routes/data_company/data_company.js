const {handleDataToReturn, handleError} = require("../../helper");
const DataCompany = require("../../classes/DataCompany");
const models = require("../../database");

const _data_company = {
    async listDataCompany(req, res) {
        try {
            let query = {}
            const insurances = await DataCompany.listDataCompany('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listDataCompanyByPk(req, res) {
        const {data_company_id} = req.params;

        try {
            const options = {}
            const insurance = await DataCompany.listDataCompanyByPk(data_company_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createDataCompany(req, res) {
        let data = req.body;

        if (!Array.isArray(data)) {
            data = [data];
        }

        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            let data_company;

            for (let company of data) {
                data_company = await DataCompany.createDataCompanyFactory(transaction, company, req.authUser);
            }
            await transaction.commit();

            res.json(handleDataToReturn(data_company, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateDataCompany(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let data_company = await DataCompany.updateDataCompanyFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(data_company, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteDataCompany(req, res) {
        const {data_company_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await DataCompany.deleteDataCompany(transaction, data_company_id, req.authUser);

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

module.exports = _data_company;
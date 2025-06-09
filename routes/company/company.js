const {handleDataToReturn, handleError} = require("../../helper");
const Company = require("../../classes/Company");
const models = require("../../database");

const _company = {
    async listCompany(req, res) {
        try {
            let query = {
                include: [
                    {
                        model: models.employee,
                        as: 'company_owner'
                    }
                ],
            }
            const insurances = await Company.listCompany('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listCompanyByPk(req, res) {
        const {company_id} = req.params;

        try {
            const options = {}
            const insurance = await Company.listCompanyByPk(company_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createCompany(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let company = await Company.createCompanyFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(company, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateCompany(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let company = await Company.updateCompanyFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(company, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteCompany(req, res) {
        const {company_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await Company.deleteCompany(transaction, company_id, req.authUser);

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

module.exports = _company;
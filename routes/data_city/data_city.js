const {handleDataToReturn, handleError} = require("../../helper");
const DataCity = require("../../classes/DataCity");
const models = require("../../database");

const _data_city = {
    async listDataCity(req, res) {
        try {
            let query = {}
            const insurances = await DataCity.listDataCity('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listDataCityByPk(req, res) {
        const {data_city_id} = req.params;

        try {
            const options = {}
            const insurance = await DataCity.listDataCityByPk(data_city_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createDataCity(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let data_city = await DataCity.createDataCityFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(data_city, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateDataCity(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let data_city = await DataCity.updateDataCityFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(data_city, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteDataCity(req, res) {
        const {data_city_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await DataCity.deleteDataCity(transaction, data_city_id, req.authUser);

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

module.exports = _data_city;
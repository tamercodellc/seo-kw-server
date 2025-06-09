const {handleDataToReturn, handleError} = require("../../helper");
const Address = require("../../classes/Address");
const models = require("../../database");

const _address = {
    async listAddress(req, res) {
        try {
            let query = {}
            const insurances = await Address.listAddress('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listAddressByPk(req, res) {
        const {address_id} = req.params;

        try {
            const options = {}
            const insurance = await Address.listAddressByPk(address_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createAddress(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let address = await Address.createAddressFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(address, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateAddress(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let address = await Address.updateAddressFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(address, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteAddress(req, res) {
        const {address_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await Address.deleteAddress(transaction, address_id, req.authUser);

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

module.exports = _address;
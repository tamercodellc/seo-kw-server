const {handleDataToReturn, handleError} = require("../../helper");
const Employee = require("../../classes/Employee");
const models = require("../../database");
const User = require("../../classes/User");
const {phone} = models;

const _employee = {
    async listEmployee(req, res) {
        try {
            let options = {
                include: [{
                    model: phone
                }]
            }
            const insurances = await Employee.listEmployee('findAndCountAll', options)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            await handleError(res, e);
        }
    },

    async listEmployeeByPk(req, res) {
        const {employee_id} = req.params;

        try {
            const options = {}
            const insurance = await Employee.listEmployeeByPk(employee_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            await handleError(res, e);
        }
    },

    async createEmployee(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let employee = await Employee.createEmployeeFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(employee, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async updateEmployee(req, res) {
        let {data} = req.body;
        let transaction;
        try {
            if (data) data = JSON.parse(data);
            transaction = await models.sequelize.transaction();
            await Employee.updateEmployeeFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn({}, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e);
        }
    }
}

module.exports = _employee;
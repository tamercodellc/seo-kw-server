const Main = require("./Main");
const User = require("./User");
const {Op} = require("sequelize");
const {employee} = require("../database");
const Company = require("./Company");

class Employee extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'employee');
    }

    static async listEmployee(method, options = {}) {
        const instance = new Employee();
        return await instance.list(method, options);
    }

    static async listEmployeeByPk(id, options) {
        const instance = new Employee({});
        return await instance.listByPk(id, options);
    }

    static async create(transaction, data, user) {
        const instance = new Employee(data, user);
        return await instance.create(transaction);
    }

    static async createEmployeeFactory(transaction, employee, user) {
        checkEmployeeRequirements(employee)

        let createdEmployee = await Employee.create(transaction, employee, user);

        let company = await Company.listCompanyByPk(createdEmployee.company_company_id, {});

        if (company && !company.dataValues.company_owner_id) {
            await Company.updateCompanyFactory(transaction, {company_id: createdEmployee.company_company_id, company_owner_id: createdEmployee.employee_id}, user);
        }

        if (employee.employee_needs_user) {
            let createdUser = await User.createUserFactory(transaction, {
                ...employee,
                employee_id: createdEmployee.employee_id
            }, user);

            await Employee.updateEmployeeFactory(transaction, {
                employee_id: createdEmployee.employee_id,
                user_user_id: createdUser.user_id
            }, user);

            createdEmployee.dataValues.user_user_id = createdUser.dataValues.user_id;
        }

        return createdEmployee;
    }

    static async updateEmployee(transaction, record, user, options) {
        const instance = new Employee(record, user);
        return await instance.update(transaction, options);
    }

    static async updateEmployeeFactory(transaction, employee, user) {
        let options = {
            where: {
                employee_id: {
                    [Op.eq]: employee.employee_id
                }
            }
        };

        if (employee.employee_needs_user) {
            let createdUser = await User.createUserFactory(transaction, {
                ...employee,
                employee_id: employee.employee_id
            }, user);

            employee.user_user_id = createdUser.user_id;
        }

        return await Employee.updateEmployee(transaction, employee, user, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'employee_first_name',
        'employee_last_name',
        'employee_email',
        'employee_driver_license',
        'employee_notes',
        'employee_hire_date',
        'employee_termination_date',
        'user_user_id',
        'company_company_id',
    ];
}

function checkEmployeeRequirements(employee) {
    if (!employee.employee_first_name) {
        throw new Error('Employee first name is required');
    }

    if (!employee.employee_last_name) {
        throw new Error('Employee last name is required');
    }
}

module.exports = Employee;

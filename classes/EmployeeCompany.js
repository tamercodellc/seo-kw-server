const Main = require("./Main");

class EmployeeCompany extends Main {
    constructor(data = {}, user) {
        super(data, user, [], 'employee_company');
    }

    static async listUserCompany(method, options = {}) {
        const instance = new EmployeeCompany();
        return await instance.list(method, options);
    }

    static async listUserCompanyByPk(userId, companyId, options) {
        const instance = new EmployeeCompany({});
        return await instance.listByPk({user_user_id: userId, company_company_id: companyId}, options);
    }
}

module.exports = EmployeeCompany;

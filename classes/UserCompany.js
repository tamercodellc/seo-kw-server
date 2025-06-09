const Main = require("./Main");

class UserCompany extends Main {
    constructor(data = {}, user) {
        super(data, user, [], 'user_company'); // Assuming no create fields
    }

    static async listUserCompany(method, options = {}) {
        const instance = new UserCompany();
        return await instance.list(method, options);
    }

    static async listUserCompanyByPk(userId, companyId, options) {
        const instance = new UserCompany({});
        return await instance.listByPk({user_user_id: userId, company_company_id: companyId}, options);
    }
}

module.exports = UserCompany;

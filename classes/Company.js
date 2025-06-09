const Main = require("./Main");
const {Op} = require("sequelize");

class Company extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'company');
    }

    static async listCompany(method, options = {}) {
        const instance = new Company();
        return await instance.list(method, options);
    }

    static async listCompanyByPk(id, options) {
        const instance = new Company({});
        return await instance.listByPk(id, options);
    }

    static updateCompany(transaction, address, user, options) {
        const instance = new Company(address, user);
        return instance.update(transaction, options);
    }

    static async createCompanyFactory(transaction, address, user) {
        checkCompanyRequirement(address);

        let newCompany = new Company(address, user);

        return await newCompany.create(transaction);
    }

    static async updateCompanyFactory(transaction, address, user) {
        checkCompanyRequirement(address);

        let options = {
            where: {
                address_id: {
                    [Op.eq]: address.address_id
                }
            }
        };

        return await Company.updateCompany(transaction, address, user, options);
    }

    static async deleteCompany(transaction, address_id, user) {
        let options = {
            where: {
                address_id: {
                    [Op.eq]: address_id
                }
            }
        };
        const instance = new Company({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'company_name',
        'company_representative',
        'company_active',
        'company_credit',
    ];
}

function checkCompanyRequirement(address) {
    if (!address.company_name) {
        throw new Error('Company street is required');
    }
}

module.exports = Company;

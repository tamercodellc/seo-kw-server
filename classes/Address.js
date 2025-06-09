const Main = require("./Main");
const {Op} = require("sequelize");

class Address extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'address');
    }

    static async listAddress(method, options = {}) {
        const instance = new Address();
        return await instance.list(method, options);
    }

    static async listAddressByPk(id, options) {
        const instance = new Address({});
        return await instance.listByPk(id, options);
    }

    static updateAddress(transaction, address, user, options) {
        const instance = new Address(address, user);
        return instance.update(transaction, options);
    }

    static async createAddressFactory(transaction, address, user) {
        checkAddressRequirement(address);

        let newAddress = new Address(address, user);

        return await newAddress.create(transaction);
    }

    static async updateAddressFactory(transaction, address, user) {
        checkAddressRequirement(address);

        let options = {
            where: {
                address_id: {
                    [Op.eq]: address.address_id
                }
            }
        };

        return await Address.updateAddress(transaction, address, user, options);
    }

    static async deleteAddress(transaction, address_id, user) {
        let options = {
            where: {
                address_id: {
                    [Op.eq]: address_id
                }
            }
        };
        const instance = new Address({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'address_primary',
        'address_street',
        'address_type',
        'address_apt',
        'address_city',
        'address_state',
        'address_zip',
        'address_country',
        'company_company_id',
        "user_user_id",
        'employee_employee_id',
        'deleted_at'
    ];
}

function checkAddressRequirement(address) {
    if (!address.address_street) {
        throw new Error('Address street is required');
    }

    if (!address.address_city) {
        throw new Error('Address city is required');
    }

    if (!address.address_state) {
        throw new Error('Address state is required');
    }

    if (!address.address_zip) {
        throw new Error('Address zip is required');
    }
}

module.exports = Address;

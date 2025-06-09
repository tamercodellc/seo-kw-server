const Main = require("./Main");
const jwt = require('jwt-simple');
const Helpers = require('../helper');
const Firebase = require('./firebase/Firebase');
const Employee = require('./Employee');
const {Op} = require("sequelize");
const {permission, company, employee} = require("../database");

class User extends Main {
    constructor(data, user) {
        super(data, user, getCreateWhitelistFields(), 'user');
    }

    static async list(method, options) {
        const instance = new User({});
        return await instance.list(method, options);
    }

    static async listByPk(id, options) {
        const instance = new User({});
        return await instance.listByPk(id, options);
    }

    static async create(transaction, data, user) {
        const instance = new User(data, user);
        return await instance.create(transaction);
    }

    static async updateUser(transaction, record, user, options) {
        const instance = new Employee(record, user);
        return await instance.update(transaction, options);
    }

    static async createUserFactory(transaction, data, user) {
        let displayName = data.employee_first_name + ' ' + data.employee_last_name,
            password = data.user_password,
            email = data.user_email;

        //creates a firebase user
        data.user_uid = await Firebase.createUser(displayName, email, password);

        let userData = {
            user_email: data.user_email,
            user_uid: data.user_uid,
            employee_employee_id: data.employee_id,
            company_company_id: data.company_company_id,
        };

        //creates a user in the database
        return await User.create(transaction, userData, user);
    };

    static async manageToken(user_token, ip) {

        let dbUser, user_uid, decodedUser;

        try {
            decodedUser = jwt.decode(user_token, process.env.SIMPLE_CRYPTO_SECRET);
            user_uid = decodedUser.user.user_uid;
        } catch (e) {
            console.log('token is not from Ez Server');
        }

        try {
            let {uid} = await Firebase.verifyIdToken(user_token);

            const options = {
                where: [{
                    user_uid: {
                        [Op.eq]: user_uid || uid
                    }
                }],
                include: [{
                    model: permission,
                    through: {
                        attributes: []
                    },
                }, {
                    model: company,
                    through: {
                        attributes: []
                    },
                }, {
                    model: employee
                }]
            }

            dbUser = await User.list('findOne', options);

            if (!dbUser) {
                throw new Error('Unauthorized, user not found');
            }

            user_uid = user_uid || uid;

        } catch (e) {
            console.log(e.message);
            throw new Error(e.message);
        }

        if (decodedUser) {
            if (ip !== decodedUser.ip) {
                throw new Error('Unauthorized, Client ip changed was detected, log in again');
            }

            if (!Helpers.isExpired(decodedUser.exp)) {
                return {
                    user_uid,
                    user: dbUser.dataValues,
                    user_token: prepareToken(dbUser.dataValues, ip)
                }
            }
            console.log('Unauthorized, token is expired');
            throw new Error('Unauthorized, token is expired');
        } else {
            return {
                user_uid,
                user: dbUser.dataValues,
                user_token: prepareToken(dbUser.dataValues, ip)
            }
        }
    }
}

function prepareToken(user, ip) {
    const expires = Helpers.expiresIn(1, 'hours')
    return jwt.encode({
        exp: expires,
        ip,
        user,
    }, process.env.SIMPLE_CRYPTO_SECRET);
}

function getCreateWhitelistFields() {
    return [
        'user_email',
        'user_uid',
        'user_active',
        'user_last_login',
        'company_company_id'
    ];
}

module.exports = User;
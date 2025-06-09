const models = require("../database");

class Main {
    constructor(data, authUser, fields, module) {
        this.fields = [];
        this.authUser = authUser;
        this.module = module;

        for (const field of fields) {
            if (data.hasOwnProperty(field)) {
                this[field] = data[field];
                this.fields.push(field);
            }
        }
    }

    create(transaction) {
        let me = this;
        return new Promise((resolve, reject) => {
            models[this.module].create(me, {
                fields: this.fields,
                options: {
                    authUser: this.authUser
                },
                transaction: transaction || null,
                individualHooks: true
            })
                .then(results => {
                    resolve(results);
                }).catch(error => {
                reject(error);
            });
        });
    }

    bulkCreate(transaction, records) {
        let me = this;
        return new Promise(function (resolve, reject) {
            models[me.module].bulkCreate(records, {
                fields: me.fields,
                options: {
                    authUser: me.authUser
                },
                ignoreDuplicates: true,
                validate: false,
                transaction: transaction || null,
            })
                .then(function (response) {
                    resolve(response);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    list(method, options = {}) {
        options.distinct = true;
        return new Promise((resolve, reject) => {
            models[this.module][method](options)
                .then(results => {
                    resolve(results);
                }).catch(error => {
                reject(error);
            });
        });
    }

    listByPk(id, options = {}) {
        return new Promise((resolve, reject) => {
            models[this.module].findByPk(id, options)
                .then(results => {
                    resolve(results);
                }).catch(error => {
                reject(error);
            });
        });
    }

    update(transaction, options) {
        return new Promise((resolve, reject) => {
            models[this.module].update(this, {
                fields: this.fields,
                options: {
                    authUser: this.authUser
                },
                transaction: transaction || null,
                individualHooks: true,
                ...options,
            })
                .then(async (results) => {
                    resolve(results);
                }).catch(error => {
                reject(error);
            });
        });
    }

    delete(transaction, options) {
        let me = this;
        return new Promise((resolve, reject) => {
            models[this.module].update(me, {
                options: {
                    authUser: this.authUser
                },
                transaction: transaction || null,
                ...options,
            })
                .then(async (results) => {
                    resolve(results);
                }).catch(error => {
                reject(error);
            });
        });
    }
}

module.exports = Main;
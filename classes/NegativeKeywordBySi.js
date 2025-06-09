const Main = require("./Main");
const {Op} = require("sequelize");

class NegativeKeywordBySi extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'negative_keyword_by_si');
    }

    static async listNegativeKeywordBySi(method, options = {}) {
        const instance = new NegativeKeywordBySi();
        return await instance.list(method, options);
    }

    static async listNegativeKeywordBySiByPk(id, options) {
        const instance = new NegativeKeywordBySi({});
        return await instance.listByPk(id, options);
    }

    static updateNegativeKeywordBySi(transaction, negative_keyword_by_si, user, options) {
        const instance = new NegativeKeywordBySi(negative_keyword_by_si, user);
        return instance.update(transaction, options);
    }

    static async createNegativeKeywordBySiFactory(transaction, negative_keyword_by_si, user) {
        checkNegativeKeywordBySiRequirement(negative_keyword_by_si);

        let newNegativeKeywordBySi = new NegativeKeywordBySi(negative_keyword_by_si, user);

        return await newNegativeKeywordBySi.create(transaction);
    }

    static async updateNegativeKeywordBySiFactory(transaction, negative_keyword_by_si, user) {
        checkNegativeKeywordBySiRequirement(negative_keyword_by_si);

        let options = {
            where: {
                negative_keyword_by_si_id: {
                    [Op.eq]: negative_keyword_by_si.negative_keyword_by_si_id
                }
            }
        };

        return await NegativeKeywordBySi.updateNegativeKeywordBySi(transaction, negative_keyword_by_si, user, options);
    }

    static async deleteNegativeKeywordBySi(transaction, negative_keyword_by_si_id, user) {
        let options = {
            where: {
                negative_keyword_by_si_id: {
                    [Op.eq]: negative_keyword_by_si_id
                }
            }
        };
        const instance = new NegativeKeywordBySi({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'negative_keyword_by_si_intent',
        'negative_keyword_by_si_word',
        'deleted_at'
    ];
}

function checkNegativeKeywordBySiRequirement(negative_keyword_by_si) {
    if (!negative_keyword_by_si.negative_keyword_by_si_word) {
        throw new Error('NegativeKeywordBySi street is required');
    }
}

module.exports = NegativeKeywordBySi;

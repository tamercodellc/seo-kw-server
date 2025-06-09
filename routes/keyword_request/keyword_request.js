const {handleDataToReturn, handleError} = require("../../helper");
const KeywordRequest = require("../../classes/KeywordRequest");
const models = require("../../database");
const {Op} = require("sequelize");
const {getGoogleAdsKeywordDifferences} = require("../../classes/AI");

const _keyword_request = {
    async listKeywordRequest(req, res) {
        try {
            let query = {
                where: {}
            }
            if (req.query.user_user_id) {
                query.where.user_user_id = {
                    [Op.eq]: req.query.user_user_id
                };
            }

            const keyword_request = await KeywordRequest.listKeywordRequest('findAndCountAll', query)
            res.json(handleDataToReturn(keyword_request, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listKeywordRequestByPk(req, res) {
        const {keyword_request_id} = req.params;

        try {
            const options = {}
            const keywordRequest = await KeywordRequest.listKeywordRequestByPk(+keyword_request_id, options);
            res.json(handleDataToReturn(keywordRequest, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createKeywordRequest(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let keyword_request = await KeywordRequest.createKeywordRequestFactory(transaction, data, req.authUser);

            await transaction.commit();

            KeywordRequest.manageKeywordRequest().then();

            res.json(handleDataToReturn(keyword_request, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateKeywordRequest(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let keyword_request = await KeywordRequest.updateKeywordRequestFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(keyword_request, req.auth));

            if (data.get_difference) {
                getGoogleAdsKeywordDifferences(data).then()
            } else {
                KeywordRequest.manageKeywordRequest().then();
            }

        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteKeywordRequest(req, res) {
        const {keyword_request_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await KeywordRequest.deleteKeywordRequest(transaction, keyword_request_id, req.authUser);

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

module.exports = _keyword_request;
const {handleDataToReturn, handleError} = require("../../helper");
const Document = require("../../classes/Document");
const models = require("../../database");

const _document = {
    async listDocument(req, res) {
        try {
            let query = {}
            const insurances = await Document.listDocument('findAndCountAll', query)
            res.json(handleDataToReturn(insurances, req.auth))
        } catch (e) {
            console.log(e.message);
            await handleError(res, e)
        }

    },

    async listDocumentByPk(req, res) {
        const {document_id} = req.params;

        try {
            const options = {}
            const insurance = await Document.listDocumentByPk(document_id, options);
            res.json(handleDataToReturn(insurance, req.auth));
        } catch (e) {
            console.log(e.message);
            await handleError(res, e);
        }
    },

    async createDocument(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let document = await Document.createDocumentFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(document, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async updateDocument(req, res) {
        let data = req.body;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            let document = await Document.updateDocumentFactory(transaction, data, req.authUser);

            await transaction.commit();

            res.json(handleDataToReturn(document, req.auth));
        } catch (e) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.log(e.message);
            await handleError(res, e)
        }
    },

    async deleteDocument(req, res) {
        const {document_id} = req.params;
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            await Document.deleteDocument(transaction, document_id, req.authUser);

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

module.exports = _document;
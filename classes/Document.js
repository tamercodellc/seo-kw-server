const Main = require("./Main");
const {Op} = require("sequelize");

class Document extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'document');
    }

    static async listDocument(method, options = {}) {
        const instance = new Document();
        return await instance.list(method, options);
    }

    static async listDocumentByPk(id, options) {
        const instance = new Document({});
        return await instance.listByPk(id, options);
    }

    static updateDocument(transaction, document, user, options) {
        const instance = new Document(document, user);
        return instance.update(transaction, options);
    }

    static async createDocumentFactory(transaction, document, user) {
        checkDocumentRequirement(document);

        let newDocument = new Document(document, user);

        return await newDocument.create(transaction);
    }

    static async updateDocumentFactory(transaction, document, user) {
        checkDocumentRequirement(document);

        let options = {
            where: {
                document_id: {
                    [Op.eq]: document.document_id
                }
            }
        };

        return await Document.updateDocument(transaction, document, user, options);
    }

    static async deleteDocument(transaction, document_id, user) {
        let options = {
            where: {
                document_id: {
                    [Op.eq]: document_id
                }
            }
        };
        const instance = new Document({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'document_url',
        'document_expiration_date',
        'document_title',
        'company_company_id',
        'document_template_document_template_id',
        'employee_employee_id',
        'deleted_at'
    ];
}

function checkDocumentRequirement(document) {
    if (!document.document_url) {
        throw new Error('Document street is required');
    }
}

module.exports = Document;

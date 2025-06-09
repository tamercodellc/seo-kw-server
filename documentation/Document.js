module.exports = {
    '/api/v1/document': {
        get: {
            summary: `Return a list of documents`,
        },
        post: {
            summary: `create an document and returns it`,
        },
        put: {
            summary: `Returns nothing`,
        }
    },

    '/api/v1/document/{document_id}': {
        get: {
            summary: `Return a document by document_id`,
            parameters: [{
                name: 'document_id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer',
                    example: 1
                }
            }]
        },
        delete: {
            summary: `Delete a document by document_id`,
            parameters: [{
                name: 'document_id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer',
                    example: 1
                }
            }]
        }
    }
}
module.exports = {
    '/api/v1/company': {
        get: {
            summary: `Return a list of companies`,
        },
        post: {
            summary: `create a company and returns it`,
        },
        put: {
            summary: `Returns nothing`,
        }
    },

    '/api/v1/company/{company_id}': {
        get: {
            summary: `Return a company by company_id`,
            parameters: [{
                name: 'company_id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer',
                    example: 1
                }
            }]
        },
        delete: {
            summary: `Delete a company by company_id`,
            parameters: [{
                name: 'company_id',
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
3

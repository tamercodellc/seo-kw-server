module.exports = {
    '/api/v1/address': {
        get: {
            summary: `Return a list of addresses`,
        },
        post: {
            summary: `create an address and returns it`,
        },
        put: {
            summary: `Returns nothing`,
        }
    },

    '/api/v1/address/{address_id}': {
        get: {
            summary: `Return a address by address_id`,
            parameters: [{
                name: 'address_id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer',
                    example: 1
                }
            }]
        },
        delete: {
            summary: `Delete a address by address_id`,
            parameters: [{
                name: 'address_id',
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
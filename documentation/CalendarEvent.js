module.exports = {
    '/api/v1/calendar_event': {
        get: {
            summary: `Return a list of calendar_events`,
        },
        post: {
            summary: `create an calendar_event and returns it`,
        },
        put: {
            summary: `Returns nothing`,
        }
    },

    '/api/v1/calendar_event/{calendar_event_id}': {
        get: {
            summary: `Return a calendar_event by calendar_event_id`,
            parameters: [{
                name: 'calendar_event_id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer',
                    example: 1
                }
            }]
        },
        delete: {
            summary: `Delete a calendar_event by calendar_event_id`,
            parameters: [{
                name: 'calendar_event_id',
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
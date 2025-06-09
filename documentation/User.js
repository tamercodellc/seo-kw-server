module.exports = {
    '/api/login': {
        post: {
            summary: `Login a User and return a user`,
        }
    },

    '/api/v1/user': {
        get: {
            summary: `Return a list of users`,
        }
    },

    '/api/v1/user/1': {
        get: {
            summary: `Return a user by user_id`,
        }
    }
}
const {handleDataToReturn, handleError} = require("../../helper");
const {permission} = require("../../database")
const User = require("../../classes/User");

const _user = {
    async listUser(req, res) {
        try {
            const users = await User.list('findAndCountAll')
            res.json(handleDataToReturn(users, req.auth))
        } catch (e) {
            await handleError(res, e)
        }
    },

    async listUserByPk(req, res) {
        const {user_id} = req.params;

        try {
            const options = {
                include: [{
                    model: permission,
                    through: {
                        attributes: []
                    },
                }]
            }
            const users = await User.listByPk(user_id, options);
            res.json(handleDataToReturn(users, req.auth));
        } catch (e) {
            await handleError(res, e);
        }
    },

    async login(req, res) {
        let token = req.headers['x-access-token'];
        try {
            let auth = await User.manageToken(token, req.clientIp);

            res.json(handleDataToReturn({}, auth));

        } catch (e) {
            console.error(e.message);
            await handleError(res, e, 401);
        }
    }
}

module.exports = _user;
const {manageToken} = require("../classes/User");
const {handleError} = require("../helper");

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') return res.end();

    let token = req.headers['x-access-token'],
        {clientIp} = req;

    if (token) {
        try {
            let auth = await manageToken(token, clientIp);

            req.authUser = {
                ...auth.user,
                user_token: token.user_token,
                info: {
                    host: clientIp,
                    path: {
                        url: req?.originalUrl?.split('?')[0],
                        method: req.method
                    }
                }
            };

            req.auth = auth;

            req.query.limit = +req?.query?.limit || 25;
            next();
        } catch (e) {
            await handleError(res, e, 401);
        }
    } else {
        await handleError(res, 'Unauthorized, Token was not provided', 401);
    }
}
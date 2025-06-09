const moment = require('moment');

module.exports = {
    handleDataToReturn(data = {}, auth) {
        let content = {success: true, data: data?.rows || data, auth}
        if (data.rows) {
            content.dataCount = data.count;
        }
        return content;
    },

    async handleError(res, error, code = 400) {
        let message = error?.message || error;
        res.status(code);
        res.json({
            status: code,
            message,
            success: false
        });
    },

    expiresIn(amount, unit) {
        return moment().add(amount, unit);
    },

    isExpired(dateString) {
        return moment(dateString).isBefore(moment());
    }
}
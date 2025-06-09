const Main = require("./Main");
const {Op} = require("sequelize");

class TimeSheet extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'time_sheet');
    }

    static async listTimeSheet(method, options = {}) {
        const instance = new TimeSheet();
        return await instance.list(method, options);
    }

    static async listTimeSheetByPk(id, options) {
        const instance = new TimeSheet({});
        return await instance.listByPk(id, options);
    }

    static updateTimeSheet(transaction, time_sheet, user, options) {
        const instance = new TimeSheet(time_sheet, user);
        return instance.update(transaction, options);
    }

    static async createTimeSheetFactory(transaction, time_sheet, user) {

        let newTimeSheet = new TimeSheet(time_sheet, user);

        return await newTimeSheet.create(transaction);
    }

    static async updateTimeSheetFactory(transaction, time_sheet, user) {

        let options = {
            where: {
                time_sheet_id: {
                    [Op.eq]: time_sheet.time_sheet_id
                }
            }
        };

        return await TimeSheet.updateTimeSheet(transaction, time_sheet, user, options);
    }

    static async deleteTimeSheet(transaction, time_sheet_id, user) {
        let options = {
            where: {
                time_sheet_id: {
                    [Op.eq]: time_sheet_id
                }
            }
        };
        const instance = new TimeSheet({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'time_sheet_action',
        'user_user_id'
    ];
}

module.exports = TimeSheet;

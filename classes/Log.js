const Main = require("./Main");
const {log} = require('../database/');

class Log extends Main {
    constructor(data = {}, user) {
        super(data, user, [], 'log');
    }

    static async listLog(method, options = {}) {
        const instance = new Log();
        return await instance.list(method, options);
    }

    static async listLogByPk(id, options) {
        const instance = new Log({});
        return await instance.listByPk(id, options);
    }

    static handleValues(instance, options, table) {
        options = {options}
        let user = options?.authUser,
            ipAddress = user?.info?.host || null,
            path = user?.info?.path || null,
            method = path?.method || null,
            url = path?.url || null,
            {_previousDataValues, dataValues, _changed} = instance;

        return {
            user: user,
            oldValues: _previousDataValues,
            newValues: dataValues,
            changed: _changed,
            log_table: table,
            log_method: method,
            ip_address: ipAddress,
            log_path: url,
            instance
        }
    }

    static async post(params, transaction) {
        let newValues = params.newValues,
            oldValues = params.oldValues,
            result,
            whiteListFields = ['log_table', 'created_by', 'log_method', 'log_value', 'log_field', 'log_ip_address', 'log_path'],
            {user} = params,
            created_by = user?.user_id || null;

        let associationDictionary = {
            address: 'address_address_id',
            calendar_event: 'calendar_event_calendar_event_id',
            company: 'company_company_id',
            document: 'document_document_id',
            document_template: 'document_template_document_template_id',
            employee: 'employee_employee_id',
            keyword_request: 'keyword_request_keyword_request_id',
            payment: 'payment_payment_id',
            permission: 'permission_permission_id',
            phone: 'phone_phone_id',
            timesheet: 'time_sheet_time_sheet_id',
            time_sheet: 'time_sheet_id',
            user: 'user_user_id',
            website: 'website_website_id'
        };

        whiteListFields.push(associationDictionary[params.log_table]);

        let log_field = [],
            log_value = [];

        for (let field of params.changed) {

            if (!['updated_at', 'created_at'].includes(field)) {
                log_field.push(field);
                log_value.push({
                    field: field,
                    newValue: newValues[field],
                    oldValue: oldValues[field]
                });
            }
        }

        result = {
            log_table: params.log_table,
            log_method: params.log_method,
            log_path: params.log_path,
            log_ip_address: params.ip_address,
            log_field: log_field,
            log_value: log_value,
            created_by: created_by,
            address_address_id: newValues.address_id,
            calendar_event_calendar_event_id: newValues.calendar_event_id,
            company_company_id: newValues.company_id,
            document_document_id: newValues.document_id,
            document_template_document_template_id: newValues.document_template_id,
            employee_employee_id: newValues.employee_id,
            keyword_request_keyword_request_id: newValues.keyword_request_id,
            payment_payment_id: newValues.payment_id,
            permission_permission_id: newValues.permission_id,
            phone_phone_id: newValues.phone_id,
            time_sheet_time_sheet_id: newValues.time_sheet_id,
            user_user_id: newValues.user_id,
            website_website_id: newValues.website_id,
        };

        try {
            if (!log_field.length) {
                return;
            }
            await log.create(result, {
                fields: whiteListFields,
                transaction: transaction || null
            });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = Log;
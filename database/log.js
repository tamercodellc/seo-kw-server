module.exports = function (sequelize, {INTEGER, JSON, STRING}) {
    const Model = sequelize.define('log', {
        log_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        log_table: {
            type: STRING,
            allowNull: true
        },
        log_method: {
            type: STRING,
            allowNull: true
        },
        log_path: {
            type: STRING,
            allowNull: true
        },
        log_ip_address: {
            type: STRING,
            allowNull: true
        },
        log_field: {
            type: JSON,
            allowNull: true
        },
        log_value: {
            type: JSON,
            allowNull: true
        },
        address_address_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'addresses',
                key: 'address_id'
            }
        },
        calendar_event_calendar_event_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'calendar_events',
                key: 'calendar_event_id'
            }
        },
        company_company_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'company_id'
            }
        },
        document_document_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'documents',
                key: 'document_id'
            }
        },
        document_template_document_template_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'document_templates',
                key: 'document_template_id'
            }
        },
        employee_employee_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'employee_id'
            }
        },
        keyword_request_keyword_request_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'keyword_requests',
                key: 'keyword_request_id'
            }
        },
        payment_payment_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'payments',
                key: 'payment_id'
            }
        },
        permission_permission_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'permissions',
                key: 'permission_id'
            }
        },
        phone_phone_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'phones',
                key: 'phone_id'
            }
        },
        time_sheet_time_sheet_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'timesheets',
                key: 'time_sheet_id'
            }
        },
        user_user_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        created_by: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        website_website_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'websites',
                key: 'website_id'
            }
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated_at: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        deleted_at: {
            type: 'TIMESTAMP',
            allowNull: true
        },
    }, {
        underscored: true,
        timestamps: true,
        paranoid: true,
        deletedAt: 'deleted_at',
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    Model.associate = function ({
        address, calendar_event, company, document, document_template, employee, keyword_request, payment, permission,
        phone, timesheet, user, website
    }) {
        Model.belongsTo(address, {foreignKey: 'address_address_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(calendar_event, {foreignKey: 'calendar_event_calendar_event_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(document, {foreignKey: 'document_document_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(document_template, {foreignKey: 'document_template_document_template_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(keyword_request, {foreignKey: 'keyword_request_keyword_request_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(payment, {foreignKey: 'payment_payment_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(permission, {foreignKey: 'permission_permission_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(phone, {foreignKey: 'phone_phone_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(timesheet, {foreignKey: 'time_sheet_time_sheet_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(user, {foreignKey: 'user_user_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(user, {foreignKey: 'created_by', as: 'created', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(website, {foreignKey: 'website_website_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
}
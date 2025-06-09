module.exports = function (sequelize, {INTEGER, STRING, TEXT, ENUM}) {
    const Model = sequelize.define('company', {
        company_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        company_status: {
            type: ENUM,
            values: ['Potential Client', 'Welcome Email Sent', 'Active', 'Inactive'],
            defaultValue: 'Potential Client',
            allowNull: false,
        },
        company_name: {
            type: STRING(255),
            allowNull: true,
            comment: 'TechCorp'
        },
        company_representative: {
            type: STRING(255),
            allowNull: false,
            comment: 'John Doe'
        },
        company_email: {
            type: STRING(255),
            validate: {isEmail: true},
            allowNull: false,
            comment: 'contact@techcorp.com'
        },
        company_notes: {
            type: TEXT,
            allowNull: true
        },
        company_service_starts_at: {
            type: 'TIMESTAMP',
            allowNull: true
        },
        company_service_ends_at: {
            type: 'TIMESTAMP',
            allowNull: true
        },
        company_owner_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'employee_id'
            }
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated_at: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
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
        hooks: {
            afterCreate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'company'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'company'), options.transaction);
            }
        }
    });

    Model.associate = function ({
                                    address,
                                    calendar_event,
                                    company_permission,
                                    document,
                                    document_template,
                                    employee,
                                    log,
                                    payment,
                                    permission,
                                    phone,
                                    timesheet,
                                    user,
                                    website
                                }) {
        Model.hasMany(address, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(calendar_event, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(document, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(document_template, {
            foreignKey: 'company_company_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasMany(employee, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {
            foreignKey: 'company_owner_id',
            as: 'company_owner',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasMany(log, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(payment, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsToMany(permission, {
            foreignKey: 'company_company_id',
            through: company_permission,
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasMany(phone, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(timesheet, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(user, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(website, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    }

    return Model;
}

module.exports = function (sequelize, {INTEGER, BOOLEAN, STRING, TEXT, ENUM}) {
    const Model = sequelize.define('phone', {
        phone_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        phone_type: {
            type: ENUM,
            values: ['Mobile', 'Home', 'Work', 'Fax', 'Other'],
        },
        phone_number: {
            type: STRING(20),
            allowNull: false,
        },
        phone_comment: {
            type: TEXT('long'),
            allowNull: true,
        },
        phone_primary: {
            type: ENUM,
            values: ['Yes', 'No'],
            defaultValue: 'No',
            allowNull: false,
        },
        company_company_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'company_id'
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
        user_user_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'user_id'
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

                await Log.post(Log.handleValues(instance, options, 'phone'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'phone'), options.transaction);
            },
        }
    });

    Model.associate = function ({user, employee, company}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(user, {foreignKey: 'user_user_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
}
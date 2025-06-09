module.exports = function (sequelize, {INTEGER, STRING}) {
    const Model = sequelize.define('user', {
        user_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_email: {
            type: STRING(64),
            allowNull: false
        },
        user_uid: {
            type: STRING(100),
            allowNull: false,
        },
        user_last_login: {
            type: 'TIMESTAMP',
            allowNull: true,
            defaultValue: null
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
        }
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

                await Log.post(Log.handleValues(instance, options, 'user'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'user'), options.transaction);
            }
        }
    });

    Model.associate = function ({company, employee, permission, timesheet, user_permission}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsToMany(permission, {
            foreignKey: 'permission_permission_id',
            through: user_permission,
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasMany(timesheet, {foreignKey: 'user_user_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    }

    return Model
}
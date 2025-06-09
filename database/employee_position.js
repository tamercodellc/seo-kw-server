module.exports = function (sequelize, {INTEGER, STRING}) {
    const Model = sequelize.define('employee_position', {
        employee_position_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        employee_position_name: {
            type: STRING(75),
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

                await Log.post(Log.handleValues(instance, options, 'employee_position'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'employee_position'), options.transaction);
            },
        },
    });

    Model.associate = function ({company, employee, employee_position_permission, log, user, permission}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasOne(employee, {
            foreignKey: 'employee_position_employee_position_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasMany(log, {
            foreignKey: 'employee_position_employee_position_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasOne(user, {
            foreignKey: 'employee_position_employee_position_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.belongsToMany(permission, {
            foreignKey: 'employee_position_employee_position_id',
            through: employee_position_permission,
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
    };

    return Model;
};
module.exports = function (sequelize, {INTEGER, STRING}) {
    const Model = sequelize.define('permission', {
        permission_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        permission_description: {
            type: STRING,
            allowNull: false,
        },
        permission_module: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            },
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

                await Log.post(Log.handleValues(instance, options, 'permission'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'permission'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, log, user, user_permission}) {
        Model.belongsToMany(company, {
            foreignKey: 'permission_permission_id',
            through: 'company_permission',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.hasMany(log, {foreignKey: 'permission_permission_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsToMany(user, {
            foreignKey: 'permission_permission_id',
            through: user_permission,
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
    };

    return Model;
};
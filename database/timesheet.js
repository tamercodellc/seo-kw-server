module.exports = function (sequelize, {INTEGER, ENUM}) {
    const Model = sequelize.define('timesheet', {
        time_sheet_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        time_sheet_action: {
            type: ENUM,
            values: ['Check In', 'Check Out'],
            allowNull: false,
            defaultValue: 'Check In'
        },
        user_user_id: {
            type: INTEGER,
            allowNull: false,
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

                await Log.post(Log.handleValues(instance, options, 'time_sheet'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'time_sheet'), options.transaction);
            },
        }
    });

    Model.associate = function ({user}) {
        Model.belongsTo(user, {foreignKey: 'user_user_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
}
module.exports = function (sequelize, {INTEGER, STRING, DECIMAL, TEXT}) {
    const Model = sequelize.define('tax', {
        tax_id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        tax_name: {
            type: STRING(100),
            allowNull: false
        },
        tax_percentage: {
            type: DECIMAL(5, 2),
            allowNull: false,
        },
        tax_description: {
            type: TEXT,
            allowNull: true,
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        hooks: {
            afterCreate: async (instance, options) => {
                const Log = require('../classes/Log');
                await Log.post(Log.handleValues(instance, options, 'tax'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                const Log = require('../classes/Log');
                await Log.post(Log.handleValues(instance, options, 'tax'), options.transaction);
            },
        }
    });

    Model.associate = function ({payment}) {
        Model.belongsToMany(payment, {
            through: 'payment_tax',
            foreignKey: 'tax_tax_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
    };

    return Model;
};

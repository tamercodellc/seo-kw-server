module.exports = function (sequelize, {INTEGER, DECIMAL, TEXT}) {
    const Model = sequelize.define('payment_tax', {
        payment_tax_id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        payment_tax_amount: {
            type: DECIMAL(12, 2),
            allowNull: false,
        },
        payment_tax_notes: {
            type: TEXT,
            allowNull: true,
        },
        payment_payment_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'payments',
                key: 'payment_id'
            }
        },
        company_company_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'company_id'
            }
        },
        tax_tax_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'taxes',
                key: 'tax_id'
            }
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
        }
    }, {
        underscored: true,
        timestamps: true,
        paranoid: false,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        hooks: {
            afterCreate: async (instance, options) => {
                const Log = require('../classes/Log');
                await Log.post(Log.handleValues(instance, options, 'payment_tax'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                const Log = require('../classes/Log');
                await Log.post(Log.handleValues(instance, options, 'payment_tax'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, payment, tax}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(payment, {foreignKey: 'payment_payment_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(tax, {foreignKey: 'tax_tax_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
};

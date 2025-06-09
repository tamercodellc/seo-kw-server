module.exports = function (sequelize, {INTEGER, STRING, DECIMAL, DATEONLY, TEXT, ENUM}) {
    const Model = sequelize.define('payment', {
        payment_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        payment_amount: {
            type: DECIMAL(12, 2),
            allowNull: false,
        },
        payment_type: {
            type: INTEGER,
            allowNull: false,
        },
        payment_date: {
            type: DATEONLY,
            allowNull: false,
        },
        payment_method: {
            type: INTEGER,
            allowNull: false,
        },
        payment_currency: {
            type: STRING(10),
            allowNull: false,
            defaultValue: 'USD'
        },
        payment_status: {
            type: ENUM,
            values: ['Pending', 'Completed', 'Failed', 'Declined'],
            defaultValue: 'Pending',
            allowNull: false,
        },
        payment_transaction_reference: {
            type: STRING(255),
            allowNull: true,
        },
        payment_notes: {
            type: TEXT,
            allowNull: true,
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
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        hooks: {
            afterCreate: async (instance, options) => {
                const Log = require('../classes/Log');
                await Log.post(Log.handleValues(instance, options, 'payment'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                const Log = require('../classes/Log');
                await Log.post(Log.handleValues(instance, options, 'payment'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, employee}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
};

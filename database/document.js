module.exports = function (sequelize, {INTEGER, STRING, TEXT, DATE}) {
    const Model = sequelize.define('document', {
        document_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        document_url: {
            type: STRING(500),
            allowNull: false,
            comment: 'https://www.mycompany.com/document.pdf'
        },
        document_expiration_date: {
            type: DATE,
            allowNull: true
        },
        document_title: {
            type: TEXT,
            allowNull: true
        },
        company_company_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'company_id'
            },
            comment: '1'
        },
        document_template_document_template_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'document_templates',
                key: 'document_template_id'
            },
            comment: '1'
        },
        employee_employee_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'employee_id'
            },
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
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'document'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'document'), options.transaction);
            }
        }
    });

    Model.associate = function ({company, document_template, employee, log}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(document_template, {
            foreignKey: 'document_template_document_template_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id', onDelete: "CASCADE", onUpdate: "NO ACTION"});
        Model.hasMany(log, {foreignKey: 'document_document_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
};

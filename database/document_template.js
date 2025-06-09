module.exports = function (sequelize, {INTEGER, STRING, TEXT, ENUM}) {
    const Model = sequelize.define('document_template', {
        document_template_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        document_template_type: {
            type: ENUM,
            values: ['Employee', 'Company', 'Tax'],
            allowNull: false,
        },
        document_template_name: {
            type: STRING(255),
            allowNull: false,
        },
        document_template_url: {
            type: TEXT,
            allowNull: false,
        },
        document_template_description: {
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        hooks: {
            afterCreate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'document_template'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'document_template'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, document, log}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(document, {foreignKey: 'document_document_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(log, {
            foreignKey: 'document_template_document_template_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
    };

    return Model;
};

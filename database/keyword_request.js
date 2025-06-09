module.exports = function (sequelize, { INTEGER, JSON, ENUM, STRING }) {
    const Model = sequelize.define('keyword_request', {
        keyword_request_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        keyword_request_title: {
            type: STRING(25),
            allowNull: false
        },
        keyword_request_search_volume: {
            type: INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: '100'
        },
        keyword_request_positive_keyword: {
            type: JSON,
            allowNull: false,
            comment: '["keywords1", "keywords2"]'
        },
        keyword_request_extra_positive_keyword: {
            type: JSON,
            allowNull: true,
            comment: '["keywords1", "keywords2"]'
        },
        keyword_request_negative_keyword: {
            type: JSON,
            allowNull: true,
            comment: '["word1", "word2"]'
        },
        keyword_request_generated_negative_keyword: {
            type: JSON,
            allowNull: true,
            comment: '["word1", "word2"]'
        },
        keyword_request_generated_positive_keyword: {
            type: JSON,
            allowNull: true,
            comment: '["word1", "word2"]'
        },
        keyword_request_generated_positive_keyword_full_info: {
            type: JSON,
            allowNull: true,
            comment: '["word1", "word2"]'
        },
        keyword_request_city: {
            type: JSON,
            allowNull: true,
            comment: '["hialeah", "miami"]'
        },
        keyword_request_all_city: {
            type: ENUM,
            values: ['Yes', 'No'],
            defaultValue: 'No',
            allowNull: false
        },
        keyword_request_region: {
            type: JSON,
            allowNull: true,
            comment: '["hialeah", "miami"]'
        },
        keyword_request_language: {
            type: STRING(25),
            allowNull: true
        },
        keyword_request_brand: {
            type: JSON,
            allowNull: true,
            comment: `[{
                "category": {
                    "children": [{
                        name: "brand",
                        active: true
                    }, {
                        name: "brand2",
                        active: false
                    }],
                    "active": true
                }, {
                "category2": {
                    "name": "brand",
                    "active": true
                },
                "active": true
            }]`
        },
        keyword_request_status: {
            type: ENUM,
            values: ['Draft', 'Created' , 'In Progress', 'Finished', 'Cancelled'],
            defaultValue: 'Created',
            allowNull: false
        },
        keyword_request_finished: {
            type: ENUM,
            values: ['Yes', 'No'],
            defaultValue: 'No',
            allowNull: false
        },
        keyword_request_type: {
            type: ENUM,
            values: ['Informational', 'Transactional'],
            allowNull: false
        },
        keyword_request_priority: {
            type: ENUM,
            values: ['Yes', 'No'],
            defaultValue: 'No',
            allowNull: false
        },
        company_company_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'company_id'
            },
            comment: '1'
        },
        user_user_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'user_id'
            },
            comment: '1'
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

                // await Log.post(Log.handleValues(instance, options, 'keyword_request'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                // await Log.post(Log.handleValues(instance, options, 'keyword_request'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, employee, log}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {foreignKey: 'user_user_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});

        Model.hasMany(log, {foreignKey: 'keyword_request_keyword_request_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
}
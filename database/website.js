module.exports = (sequelize, {INTEGER, STRING, TEXT, ENUM}) => {
    const Model = sequelize.define('website', {
        website_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        website_status: {
            type: ENUM,
            values: ['Inactive', 'Active', 'Under Maintenance'],
            defaultValue: 'Active',
            allowNull: false,
        },
        website_url: {
            type: STRING(255),
            allowNull: false,
        },
        website_technology_stack: {
            type: STRING(255),
            allowNull: true,
        },
        website_description: {
            type: TEXT,
            allowNull: true,
        },
        website_purpose: {
            type: ENUM,
            values: ['E-commerce', 'Blog', 'Portfolio', 'Informational', 'Corporate', 'Other'],
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
            allowNull: false,
        },
        updated_at: {
            type: 'TIMESTAMP',
        },
        deleted_at: {
            type: 'TIMESTAMP',
        }
    }, {
        underscored: true,
        timestamps: true,
        paranoid: true,
        deletedAt: 'deleted_at',
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    Model.associate = function ({company, log}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION'});
        Model.hasMany(log, {foreignKey: 'website_website_id', onDelete: 'NO ACTION', onUpdate: 'NO ACTION'});
    };

    return Model;
};

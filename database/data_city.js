module.exports = function (sequelize, {INTEGER, STRING}) {
    const Model = sequelize.define('data_city', {
        data_city_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        data_city_name: {
            type: STRING(255),
            allowNull: false,
            comment: 'New York'
        },
        data_city_state_name: {
            type: STRING(255),
            allowNull: true,
            comment: 'New York'
        },
        data_city_county: {
            type: STRING(255),
            allowNull: true,
            comment: 'Queens'
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

        }
    });

    Model.associate = function () {
        // associations can be defined here
    }

    return Model;
}

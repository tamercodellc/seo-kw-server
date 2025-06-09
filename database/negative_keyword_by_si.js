module.exports = function (sequelize, {INTEGER, STRING, ENUM}) {
    const Model = sequelize.define('negative_keyword_by_si', {
        negative_keyword_by_si_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        negative_keyword_by_si_intent: {
            type: ENUM,
            values: ['Transactional', 'Informational'],
            defaultValue: 'Transactional',
            allowNull: false
        },
        negative_keyword_by_si_word: {
            type: STRING(50),
            allowNull: false,
            comment: 'price'
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

    Model.associate = function () {};

    return Model;
}
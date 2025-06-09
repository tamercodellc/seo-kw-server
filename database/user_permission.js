module.exports = function (sequelize, {INTEGER}) {
    return sequelize.define('user_permission', {
        user_user_id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        permission_permission_id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'permissions',
                key: 'permission_id'
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
        deletedAt: 'deleted_at',
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });
};
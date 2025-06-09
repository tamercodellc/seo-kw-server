module.exports = function (sequelize, {INTEGER, STRING, DATEONLY, TIME}) {
    const Model = sequelize.define('calendar_event', {
        calendar_event_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        calendar_event_start_date: {
            type: DATEONLY,
            allowNull: false,
            comment: '2020-01-01'
        },
        calendar_event_end_date: {
            type: DATEONLY,
            allowNull: false,
            comment: '2020-01-01'
        },
        calendar_event_start_time: {
            type: TIME,
            allowNull: true
        },
        calendar_event_end_time: {
            type: TIME,
            allowNull: true
        },
        calendar_event_title: {
            type: STRING(50),
            allowNull: false,
            comment: 'Meeting with John Doe'
        },
        calendar_event_description: {
            type: STRING(255),
            allowNull: true
        },
        calendar_event_color: {
            type: STRING(15),
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

                await Log.post(Log.handleValues(instance, options, 'calendar_event'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'calendar_event'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, employee, log}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id'});
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id'});
        Model.hasMany(log, {
            foreignKey: 'calendar_event_calendar_event_id',
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION"
        });
    };

    return Model;
}
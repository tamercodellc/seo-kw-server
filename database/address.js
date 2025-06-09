module.exports = function (sequelize, {INTEGER, STRING, ENUM, DECIMAL, VIRTUAL}) {
    const Model = sequelize.define('address', {
        address_id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        address_primary: {
            type: ENUM,
            values: ['Yes', 'No'],
            defaultValue: 'Yes',
            allowNull: false
        },
        address_type: {
            type: ENUM,
            values: ['Home', 'Work', 'PO Box', 'Other'],
            defaultValue: 'Home',
            allowNull: true
        },
        address_street: {
            type: STRING(50),
            allowNull: false,
            comment: '123 Main St.'
        },
        address_apt: {
            type: STRING(25),
            allowNull: true
        },
        address_city: {
            type: STRING(25),
            allowNull: false,
            comment: 'Los Angeles'
        },
        address_zip: {
            type: STRING(25),
            allowNull: false,
            comment: '90001'
        },
        address_state: {
            type: STRING(25),
            allowNull: false,
            comment: 'CA'
        },
        address_country: {
            type: STRING(25),
            allowNull: false,
            comment: 'USA'
        },
        address_latitude: {
            type: DECIMAL(10, 7),
            allowNull: true
        },
        address_longitude: {
            type: DECIMAL(10, 7),
            allowNull: true
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
        employee_employee_id: {
            type: INTEGER,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'employee_id'
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
        fullAddress: {
            type: VIRTUAL,
            get() {
                let fullAddress = `${this.get('address_street')},`

                if (this.get('address_apt')) {
                    fullAddress += ` ${this.get('address_apt')}`
                }

                fullAddress += ` ${this.get('address_city')}, ${this.get('address_state')}, ${this.get('address_zip')}, ${this.get('address_country')}`;
                return fullAddress;
            },
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

                await Log.post(Log.handleValues(instance, options, 'address'), options.transaction);
            },
            afterUpdate: async (instance, options) => {
                let Log = require('../classes/Log');

                await Log.post(Log.handleValues(instance, options, 'address'), options.transaction);
            },
        }
    });

    Model.associate = function ({company, employee, log}) {
        Model.belongsTo(company, {foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.belongsTo(employee, {foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
        Model.hasMany(log, {foreignKey: 'address_address_id', onDelete: "NO ACTION", onUpdate: "NO ACTION"});
    };

    return Model;
}
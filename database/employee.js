module.exports = function(sequelize, {INTEGER, STRING, VIRTUAL, DATEONLY, TEXT}) {
	const Model = sequelize.define('employee', {
		employee_id: {
			type: INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		employee_first_name: {
			type: STRING(50),
			allowNull: false,
			comment: 'John'
		},
		employee_middle_name: {
			type: STRING(1),
			allowNull: true,
			comment: 'H'
		},
		employee_last_name: {
			type: STRING(50),
			allowNull: false,
			comment: 'Doe'
		},
		employee_email: {
			type: STRING(100),
			allowNull: false,
			validate: {
				isEmail: true
			},
			comment: 'contact@techcorp.com'
		},
		employee_driver_license: {
			type: STRING(50),
			allowNull: true,
		},
		employee_notes: {
			type: TEXT('long'),
			allowNull: true,
		},
		employee_hire_date: {
			type: DATEONLY,
			allowNull: true,
		},
		employee_termination_date: {
			type: DATEONLY,
			allowNull: true,
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
		fullName: {
			type: VIRTUAL,
			get() {
				let fullName = `${this.get('employee_first_name')}`

				if (this.get('employee_middle_name')) {
					fullName += ` ${this.get('employee_middle_name')}`
				}

				fullName += ` ${this.get('employee_last_name')}`;
				return fullName;
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

				await Log.post(Log.handleValues(instance, options, 'employee'), options.transaction);
			},
			afterUpdate: async (instance, options) => {
				let Log = require('../classes/Log');

				await Log.post(Log.handleValues(instance, options, 'employee'), options.transaction);
			},
		}
	});

	Model.associate = function({ address, calendar_event, company, document, document_template, log, payment, phone, timesheet, user }) {
		Model.hasMany(address, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(calendar_event, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.belongsTo(company, { foreignKey: 'company_company_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(document, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(document_template, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(log, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(payment, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(phone, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasMany(timesheet, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
		Model.hasOne(user, { foreignKey: 'employee_employee_id', onDelete: "NO ACTION", onUpdate: "NO ACTION" });
	}
	
	return Model
}
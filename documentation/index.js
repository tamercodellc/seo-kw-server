const swaggerUi = require('swagger-ui-express');

const summaryEnd = ' and auth information for the client'
const header = {
    name: 'X-Access-Token',
    in: 'header',
    required: true,
    description: 'token for authorization',
    schema: {
        type: 'string'
    }
}

const responses = {
    '200': {
        description: `Successful`,
    },
    '400': {
        description: `Bad Request`,
    },
    '401': {
        description: `Unauthorized`,
    },
}

const moduleToModel = [
    'address',
    'calendar_event',
    'company',
    'document',
    'document_template',
    'employee',
    'employee_position',
    'log',
    'payment',
    'permission',
    'phone',
    'tax',
    'timesheet',
    'user',
    'website'
]

const modules = [{
    name: 'address',
    module: require('./Address'),
}, {
    module: require('./Asset'),
}, {
    name: 'company',
    module: require('./Company'),
}, {
    name: 'calendar_event',
    module: require('./CalendarEvent'),
}, {
    name: 'employee',
    module: require('./Employee'),
}, {
    name: 'user',
    module: require('./User'),
}];

const managePost = (module, key, subKey, name) => {
    const models = require("../database"),
        model = models[name],
        attributes = Object.entries(model.rawAttributes);

    let required = [],
        properties = {};

    for (let [field, value] of attributes) {
        if (['TIMESTAMP'].includes(value.type) || value.primaryKey || [undefined, null, true].includes(value.allowNull)) {
            continue;
        }

        let example;

        if (value.defaultValue) {
            example = value.defaultValue;
        } else {
            example = value.comment;
        }

        properties[field] = {
            type: value.type.key,
            example: example
        }
        required.push(field);
    }

    module[key][subKey].requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties,
                    required
                }
            }
        }
    }
}

const getSwaggerDocs = () => {
    const models = require("../database");

    let paths = {};

    for (let moduleObject of modules) {
        let {name, module} = moduleObject;

        for (let [key, value] of Object.entries(module)) {
            for (let [subKey, _] of Object.entries(value)) {
                module[key][subKey].summary += summaryEnd;
                module[key][subKey].responses = responses;

                if (module[key][subKey].parameters) {
                    module[key][subKey].parameters = [...module[key][subKey].parameters, header];
                } else {
                    module[key][subKey].parameters = [header];
                }

                if (subKey === 'post') {
                    managePost(module, key, subKey, name);
                }
            }
        }

        paths = {
            ...paths,
            ...module
        };
    }

    let swaggerDocs = {
        openapi: '3.0.0',
        info: {
            title: `Pancho's API Documentation`,
            version: '1.0.1',
            description: `Pancho's CRM API documentation from routes.`,
        },
        components: {
            schemas: {}
        },
        paths
    };

    for (let m of moduleToModel) {
        let module = models[m],
            data = {},
            attributes = Object.entries(module.rawAttributes);

        for (let [key, value] of attributes) {
            data[key] = {
                type: value.type.key,
                required: !value.allowNull,
            }

            if (value.type.key === 'ENUM') {
                data[key].options = value.values;
            }

            if (value.primaryKey) {
                data[key].primaryKey = true;
            }

            if (['created_at', 'updated_at', 'deleted_at'].includes(key)) {
                data[key] = {
                    type: 'TIMESTAMP'
                }
            }

            if (value.references) {
                data[key].relation = value.references.model
            }

            if (value.defaultValue) {
                data[key].defaultValue = value.defaultValue
            }
        }

        swaggerDocs.components.schemas[m] = {
            type: 'object',
            properties: data
        }
    }

    return swaggerDocs;
}


// Function to setup Swagger documentation
const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getSwaggerDocs()));

};

module.exports = setupSwagger;
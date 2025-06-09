const Main = require("./Main");

class Permission extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'permission');
    }

    static async listPermission(method, options = {}) {
        const instance = new Permission();
        return await instance.list(method, options);
    }

    static async listPermissionByPk(id, options) {
        const instance = new Permission({});
        return await instance.listByPk(id, options);
    }
}

function getCreateWhitelistFields() {
    return [
        'permission_description',
        'permission_module'
    ];
}

module.exports = Permission;



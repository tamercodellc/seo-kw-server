const Main = require("./Main");
const {Op} = require("sequelize");

const brandSet = new Set();
let globalSubstringMap = new Map();

class DataCompany extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'data_company');
    }

    static async listDataCompany(method, options = {}) {
        const instance = new DataCompany();
        return await instance.list(method, options);
    }

    static async listDataCompanyByPk(id, options) {
        const instance = new DataCompany({});
        return await instance.listByPk(id, options);
    }

    static updateDataCompany(transaction, data_company, user, options) {
        const instance = new DataCompany(data_company, user);
        return instance.update(transaction, options);
    }

    static async createDataCompanyFactory(transaction, data_company, user) {
        checkDataCompanyRequirement(data_company);

        let newDataCompany = new DataCompany(data_company, user);

        return await newDataCompany.create(transaction);
    }

    static bulkCreate(records) {
        const instance = new DataCompany({
            data_company_name: 'test',
        });
        return instance.bulkCreate(null, records);
    }

    static async updateDataCompanyFactory(transaction, data_company, user) {
        checkDataCompanyRequirement(data_company);

        let options = {
            where: {
                data_company_id: {
                    [Op.eq]: data_company.data_company_id
                }
            }
        };

        return await DataCompany.updateDataCompany(transaction, data_company, user, options);
    }

    static async deleteDataCompany(transaction, data_company_id, user) {
        let options = {
            where: {
                data_company_id: {
                    [Op.eq]: data_company_id
                }
            }
        };
        const instance = new DataCompany({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }

    static async loadDataCompany() {
        brandSet.clear();
        globalSubstringMap.clear();

        const rows = await DataCompany.listDataCompany('findAll', {
            attributes: ['data_company_name'],
            raw: true,
        });

        for (const row of rows) {
            const rawName = row?.data_company_name;
            if (!rawName || typeof rawName !== 'string') continue;

            const normalized = normalize(rawName);
            if (typeof normalized !== 'string' || !normalized) continue;

            brandSet.add(normalized);

            globalSubstringMap.set(normalized, new Set([normalized]));

            if (normalized === 'digital') {
                console.log(normalized, rawName);
            }
        }

        if (brandSet.has('')) console.warn('⚠️ El Set contiene entrada vacía');
        console.log(`✅ Loaded ${brandSet.size} brand names`);
    }

    static async findDataCompanyByName(name) {
        if (!brandSet.size) {
            await DataCompany.loadDataCompany();
        }

        const input = normalize(name).replace(/[0-9]/g, '');
        const words = input.split(/\s+/);

        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j <= words.length; j++) {
                const sub = words.slice(i, j).join(' ');

                if (globalSubstringMap.has(sub)) {
                    return sub;
                }
            }
        }

        return false;
    }
}

function getCreateWhitelistFields() {
    return [
        'data_company_name',
        'deleted_at'
    ];
}

function checkDataCompanyRequirement(data_company) {
    if (!data_company.data_company_name) {
        throw new Error('DataCompany name is required');
    }
}

function normalize(text) {
    return text
        .toLowerCase()
        .normalize('NFD') // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .trim();
}

module.exports = DataCompany;

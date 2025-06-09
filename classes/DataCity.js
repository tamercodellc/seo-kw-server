const Main = require("./Main");
const {Op} = require("sequelize");
const citySet = new Set();
const globalSubstringMap = new Map();

class DataCity extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'data_city');
    }

    static async listDataCity(method, options = {}) {
        const instance = new DataCity();
        return await instance.list(method, options);
    }

    static async listDataCityByPk(id, options) {
        const instance = new DataCity({});
        return await instance.listByPk(id, options);
    }

    static updateDataCity(transaction, data_city, user, options) {
        const instance = new DataCity(data_city, user);
        return instance.update(transaction, options);
    }

    static async createDataCityFactory(transaction, data_city, user) {
        checkDataCityRequirement(data_city);

        let newDataCity = new DataCity(data_city, user);

        return await newDataCity.create(transaction);
    }

    static bulkCreate(records) {
        const instance = new DataCity({
            data_city_name: 'test',
            data_city_state_name: 'test',
            data_city_county: 'test',
        });
        return instance.bulkCreate(null, records);
    }

    static async updateDataCityFactory(transaction, data_city, user) {
        checkDataCityRequirement(data_city);

        let options = {
            where: {
                data_city_id: {
                    [Op.eq]: data_city.data_city_id
                }
            }
        };

        return await DataCity.updateDataCity(transaction, data_city, user, options);
    }

    static async deleteDataCity(transaction, data_city_id, user) {
        let options = {
            where: {
                data_city_id: {
                    [Op.eq]: data_city_id
                }
            }
        };
        const instance = new DataCity({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }

    static async loadDataCity() {
        citySet.clear();
        globalSubstringMap.clear();

        const rows = await DataCity.listDataCompany('findAll', {
            attributes: ['name'],
            raw: true,
        });

        for (const row of rows) {
            const rawName = row?.name;
            if (!rawName || typeof rawName !== 'string') continue;

            const normalized = normalize(rawName);
            if (typeof normalized !== 'string' || !normalized) continue;

            citySet.add(normalized);

            globalSubstringMap.set(normalized, new Set([normalized]));

            if (normalized === 'digital') {
                console.log(normalized, rawName);
            }
        }

        if (citySet.has('')) console.warn('⚠️ El Set contiene entrada vacía');
        console.log(`✅ Loaded ${citySet.size} brand names`);
    }

    static async findDataCityByName(name) {
        if (!citySet.size) {
            await DataCity.loadDataCity();
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
        'data_city_name',
        'data_city_state_name',
        'data_city_county',
        'deleted_at'
    ];
}

function checkDataCityRequirement(data_city) {
    if (!data_city.data_city_name) {
        throw new Error('City Name is required');
    }
}

function normalize(text) {
    return text
        .toLowerCase()
        .normalize('NFD') // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .trim();
}

module.exports = DataCity;

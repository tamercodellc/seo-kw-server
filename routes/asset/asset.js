const Asset = require('../../classes/Asset');
const {handleDataToReturn} = require("../../helper");

let asset = {
    listData(req, res) {
        const {asset_name} = req.params;

        let query = req.query,
            filters;

        if (query?.filter) {
            filters = JSON.parse(query.filter);
            if (filters.length) {
                filters = filters[0]?.value || null;
            }
        }

        try {
            res.json(handleDataToReturn(Asset.getData(asset_name, filters), req.auth));
        } catch (error) {
            res.status(400);
            res.json({
                status: 400,
                message: error.message,
                success: false
            });
        }
    },

    listAllData(req, res) {
        try {
            res.json(handleDataToReturn(Asset.getAllData(), req.auth));
        } catch (error) {
            res.status(400);
            res.json({
                status: 400,
                message: error.message,
                success: false
            });
        }
    },
};

module.exports = asset;
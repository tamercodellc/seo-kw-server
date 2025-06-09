const express = require('express');
const {listAllData, listData} = require("./asset");
const router = express.Router();

/** asset **/
//get asset list
router.get('/', listAllData);

//get asset by name
router.get('/:asset_name', listData);

module.exports = router;
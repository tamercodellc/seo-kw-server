const express = require('express');
const {listUser, listUserByPk} = require("./user");
const router = express.Router();

/** user **/
//get user list
router.get('/', listUser);
router.get('/:user_id', listUserByPk);

module.exports = router;
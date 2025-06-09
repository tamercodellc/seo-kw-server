const express = require('express');
const router = express.Router();

const {listAddress, listAddressByPk, createAddress, updateAddress, deleteAddress} = require('./address');

/** address **/
//list address
router.get('/', listAddress);

//list address by pk
router.get('/:address_id', listAddressByPk);

//create address
router.post('/', createAddress);

//update address
router.put('/', updateAddress);

//delete address
router.delete('/:address_id', deleteAddress);

module.exports = router;
const express = require('express');
const router = express.Router();

const {listDataCity, listDataCityByPk, createDataCity, updateDataCity, deleteDataCity} = require('./data_city');

/** data_city **/
//list data_city
router.get('/', listDataCity);

//list data_city by pk
router.get('/:data_city_id', listDataCityByPk);

//create data_city
router.post('/', createDataCity);

//update data_city
router.put('/', updateDataCity);

//delete data_city
router.delete('/:data_city_id', deleteDataCity);

module.exports = router;
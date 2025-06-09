const express = require('express');
const router = express.Router();

const {listDataCompany, listDataCompanyByPk, createDataCompany, updateDataCompany, deleteDataCompany} = require('./data_company');

/** data_company **/
router.get('/', listDataCompany);
router.get('/:data_company_id', listDataCompanyByPk);

//create data_company
router.post('/', createDataCompany);

//update data_company
router.put('/', updateDataCompany);

//delete data_company
router.delete('/:data_company_id', deleteDataCompany);

module.exports = router;
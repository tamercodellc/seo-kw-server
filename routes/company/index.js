const express = require('express');
const router = express.Router();

const {listCompany, listCompanyByPk, createCompany, updateCompany, deleteCompany} = require('./company');

/** company **/
router.get('/', listCompany);
router.get('/:company_id', listCompanyByPk);

//create company
router.post('/', createCompany);

//update company
router.put('/', updateCompany);

//delete company
router.delete('/:company_id', deleteCompany);

module.exports = router;
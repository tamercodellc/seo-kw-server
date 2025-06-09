const express = require('express');
const router = express.Router();

const {listEmployee, listEmployeeByPk, createEmployee, updateEmployee} = require('./employee');

/** employee **/

//get employee list
router.get('/', listEmployee);
router.get('/:employee_id', listEmployeeByPk);

//create employee
router.post('/', createEmployee);

//update employee
router.put('/', updateEmployee);

module.exports = router;
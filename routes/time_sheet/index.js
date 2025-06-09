const express = require('express');
const router = express.Router();

const {listTimeSheet, listTimeSheetByPk, createTimeSheet, updateTimeSheet, deleteTimeSheet} = require('./time_sheet');

/** time_sheet **/
router.get('/', listTimeSheet);
router.get('/:time_sheet_id', listTimeSheetByPk);

//create time_sheet
router.post('/', createTimeSheet);

//update time_sheet
router.put('/', updateTimeSheet);

//delete time_sheet
router.delete('/:time_sheet_id', deleteTimeSheet);

module.exports = router;
const express = require('express');
const router = express.Router();

const {listNegativeKeywordBySi, listNegativeKeywordBySiByPk, createNegativeKeywordBySi, updateNegativeKeywordBySi, deleteNegativeKeywordBySi} = require('./negative_keyword_by_si');

/** negative_keyword_by_si **/
//list negative_keyword_by_si
router.get('/', listNegativeKeywordBySi);

//list negative_keyword_by_si by pk
router.get('/:negative_keyword_by_si_id', listNegativeKeywordBySiByPk);

//create negative_keyword_by_si
router.post('/', createNegativeKeywordBySi);

//update negative_keyword_by_si
router.put('/', updateNegativeKeywordBySi);

//delete negative_keyword_by_si
router.delete('/:negative_keyword_by_si_id', deleteNegativeKeywordBySi);

module.exports = router;
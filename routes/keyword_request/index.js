const express = require('express');
const router = express.Router();

const {listKeywordRequest, listKeywordRequestByPk, createKeywordRequest, updateKeywordRequest, deleteKeywordRequest} = require('./keyword_request');

/** keyword_request **/
//list keyword_request
router.get('/', listKeywordRequest);

//list keyword_request by pk
router.get('/:keyword_request_id', listKeywordRequestByPk);

//create keyword_request
router.post('/', createKeywordRequest);

//update keyword_request
router.put('/', updateKeywordRequest);

//delete keyword_request
router.delete('/:keyword_request_id', deleteKeywordRequest);

module.exports = router;
const express = require('express');
const router = express.Router();

const {listDocument, listDocumentByPk, createDocument, updateDocument, deleteDocument} = require('./document');

/** document **/
//list document
router.get('/', listDocument);

//list document by pk
router.get('/:document_id', listDocumentByPk);

//create document
router.post('/', createDocument);

//update document
router.put('/', updateDocument);

//delete document
router.delete('/:document_id', deleteDocument);

module.exports = router;
const express = require('express');
const router = express.Router();

const {getSimilar, getSimilarNegative, getBrandSelection, getKeywordSearch, getKeywordLanguage, getKeywordRegion} = require("./ai");

router.get('/similar', getSimilar);
router.get('/negative', getSimilarNegative);
router.get('/brand_selection', getBrandSelection);
router.get('/keyword_research', getKeywordSearch);
router.get('/keyword_language', getKeywordLanguage);
router.get('/keyword_region', getKeywordRegion);

module.exports = router;
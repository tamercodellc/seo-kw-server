const {askOllama} = require("../../classes/ollama/Ollama");
const {handleDataToReturn} = require("../../helper");
const {getBrandSelection, getKeywordSearch, getLanguageSelection, getRegionSelection} = require("../../classes/AI");

const _ai = {
    async getKeywordSearch(req, res) {
        let {keyword} = req.query;

        let picture = await getKeywordSearch(keyword);

        res.json(handleDataToReturn(picture));
    },

    async getKeywordLanguage(req, res) {
        const app = require("../../app");
        let io = app?.get('io');

        let {language} = req.query;

        res.json(handleDataToReturn({}));

        let response = await getLanguageSelection(language);

        io.emit('language' + 1, {
            data: response
        });
    },

    async getKeywordRegion(req, res) {
        const app = require("../../app");
        let io = app?.get('io');

        let {region} = req.query;

        res.json(handleDataToReturn({}));

        let response = await getRegionSelection(region);

        io.emit('region' + 1, {
            data: response
        });
    },

    async getSimilar(req, res) {
        let {keywords} = req.query;

        if (!Array.isArray(keywords)) {
            keywords = [keywords];
        }

        let phrases = keywords;
        let info = `Give me a list of phrases related or similar to this/theses “${phrases.join(', ')}”, including synonyms, antonyms, grammatical variations,
            and phrases from the same semantic field, DO NOT GIVE ANY NOTE OR EXPLANATION, always answer in a list format, 
            with each word separated with a comma and NO ADDITIONAL TEXT OR TITLE OR EXPLANATION OR NOTES, just the list.
            EXAMPLE: phrase1, phrase2, phrase3, phrase4, phrase5`;

        let answer = await askOllama(info);

        answer = answer.toLowerCase();

        try {
            answer = answer.split(',').map(item => item.trim());

            for (let keyword of keywords) {
                answer = answer.filter(item => item.toLowerCase() !== keyword.toLowerCase() || item.toLowerCase().includes('here is'));
            }
        } catch (e) {
        }

        res.json(handleDataToReturn(answer.join(',')));
    },

    async getSimilarNegative(req, res) {
        let {keywords} = req.query;

        if (!Array.isArray(keywords)) {
            keywords = [keywords];
        }

        let phrases = keywords;
        let info = `Give me a list of phrases related or similar to this/theses “${phrases.join(', ')}”, including synonyms, antonyms, grammatical variations,
            and phrases from the same semantic field, DO NOT GIVE ANY NOTE OR EXPLANATION, always answer in a list format, 
            with each word separated with a comma and NO ADDITIONAL TEXT OR TITLE OR EXPLANATION OR NOTES, just the list.
            EXAMPLE: phrase1, phrase2, phrase3, phrase4, phrase5`;

        let answer = await askOllama(info);

        answer = answer.toLowerCase();

        try {
            answer = answer.split(',').map(item => item.trim());

            for (let keyword of keywords) {
                answer = answer.filter(item => item.toLowerCase() !== keyword.toLowerCase() || item.toLowerCase().includes('here is'));
            }
        } catch (e) {
        }

        res.json(handleDataToReturn(answer.join(',')));
    },

    async getBrandSelection(req, res) {
        const app = require("../../app");
        let io = app?.get('io');
        let {keywords, language, region} = req.query;

        res.json(handleDataToReturn({}));

        let response = await getBrandSelection(keywords, language, region);

        io.emit('keywords_brand_alert' + 1, {
            data: response
        });
    },
};

module.exports = _ai;


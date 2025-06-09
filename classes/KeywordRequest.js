const Main = require("./Main");
const {Op} = require("sequelize");
const {getGoogleAdsKeywords} = require("./AI");
const moment = require("moment");

class KeywordRequest extends Main {
    constructor(data = {}, user) {
        super(data, user, getCreateWhitelistFields(), 'keyword_request');
    }

    static async listKeywordRequest(method, options = {}) {
        const instance = new KeywordRequest();
        return await instance.list(method, options);
    }

    static async listKeywordRequestByPk(id, options) {
        const instance = new KeywordRequest({});
        return await instance.listByPk(id, options);
    }

    static updateKeywordRequest(transaction, keyword_request, user, options) {
        const instance = new KeywordRequest(keyword_request, user);
        return instance.update(transaction, options);
    }

    static async createKeywordRequestFactory(transaction, keyword_request, user) {
        checkKeywordRequestRequirement(keyword_request);

        //removing the brands that are not needed in the request
        if (keyword_request?.keyword_request_brand) {
            for (let [key, value] of Object.entries(keyword_request.keyword_request_brand)) {
                keyword_request.keyword_request_brand[key].children = value.children.filter(child => !child.active);
            }
        }

        let newKeywordRequest = new KeywordRequest(keyword_request, user);

        return await newKeywordRequest.create(transaction);
    }

    static async updateKeywordRequestFactory(transaction, keyword_request, user, avoidReset = false) {

        let currentKeywordRequest = await KeywordRequest.listKeywordRequestByPk(keyword_request.keyword_request_id, {});
        if (keyword_request.positiveKeywordsToAdd?.length) {
            keyword_request.keyword_request_extra_positive_keyword = [...currentKeywordRequest.keyword_request_extra_positive_keyword, ...keyword_request.positiveKeywordsToAdd];
            currentKeywordRequest.keyword_request_extra_positive_keyword = keyword_request.keyword_request_extra_positive_keyword;

            keyword_request.keyword_request_negative_keyword = currentKeywordRequest.keyword_request_negative_keyword.filter(word => !keyword_request.positiveKeywordsToAdd.includes(word));
            currentKeywordRequest.keyword_request_negative_keyword = keyword_request.keyword_request_negative_keyword

            keyword_request.keyword_request_generated_negative_keyword = currentKeywordRequest.keyword_request_generated_negative_keyword.filter(word => !keyword_request.positiveKeywordsToAdd.includes(word));
            currentKeywordRequest.keyword_request_generated_negative_keyword = keyword_request.keyword_request_generated_negative_keyword
        }

        if (keyword_request.negativeKeywordsToAdd?.length) {
            keyword_request.keyword_request_negative_keyword = [...currentKeywordRequest.keyword_request_negative_keyword, ...keyword_request.negativeKeywordsToAdd];
            currentKeywordRequest.keyword_request_negative_keyword = keyword_request.keyword_request_negative_keyword;

            keyword_request.keyword_request_positive_keyword = currentKeywordRequest.keyword_request_positive_keyword.filter(word => !keyword_request.negativeKeywordsToAdd.includes(word));
            currentKeywordRequest.keyword_request_positive_keyword = keyword_request.keyword_request_positive_keyword;

            keyword_request.keyword_request_extra_positive_keyword = currentKeywordRequest.keyword_request_extra_positive_keyword.filter(word => !keyword_request.negativeKeywordsToAdd.includes(word));
            currentKeywordRequest.keyword_request_extra_positive_keyword = keyword_request.keyword_request_extra_positive_keyword;
        }

        if (keyword_request.positiveKeywordsToDelete?.length) {
            keyword_request.keyword_request_positive_keyword = currentKeywordRequest.keyword_request_positive_keyword.filter(word => !keyword_request.positiveKeywordsToDelete.includes(word));
            currentKeywordRequest.keyword_request_positive_keyword = keyword_request.keyword_request_positive_keyword;

            keyword_request.keyword_request_extra_positive_keyword = currentKeywordRequest.keyword_request_extra_positive_keyword.filter(word => !keyword_request.positiveKeywordsToDelete.includes(word));
            currentKeywordRequest.keyword_request_extra_positive_keyword = keyword_request.keyword_request_extra_positive_keyword;

            keyword_request.keyword_request_negative_keyword = [...currentKeywordRequest.keyword_request_negative_keyword, ...keyword_request.positiveKeywordsToDelete];
            currentKeywordRequest.keyword_request_negative_keyword = keyword_request.keyword_request_negative_keyword;
        }

        if (keyword_request.negativeKeywordsToDelete?.length) {
            keyword_request.keyword_request_negative_keyword = currentKeywordRequest.keyword_request_negative_keyword.filter(word => !keyword_request.negativeKeywordsToDelete.includes(word));
            currentKeywordRequest.keyword_request_negative_keyword = keyword_request.keyword_request_negative_keyword;

            keyword_request.keyword_request_generated_negative_keyword = currentKeywordRequest.keyword_request_generated_negative_keyword.filter(word => !keyword_request.negativeKeywordsToDelete.includes(word));
            currentKeywordRequest.keyword_request_generated_negative_keyword = keyword_request.keyword_request_generated_negative_keyword;

            keyword_request.keyword_request_extra_positive_keyword = [...currentKeywordRequest.keyword_request_extra_positive_keyword, ...keyword_request.negativeKeywordsToDelete];
            currentKeywordRequest.keyword_request_extra_positive_keyword = keyword_request.keyword_request_extra_positive_keyword;
        }

        if (currentKeywordRequest.keyword_request_status === 'Finished' && !avoidReset) {
            if (!keyword_request.get_difference) {
                keyword_request.keyword_request_generated_negative_keyword = [];
                keyword_request.keyword_request_generated_positive_keyword = [];
                keyword_request.keyword_request_finished = 'No';
                keyword_request.keyword_request_status = 'In Progress';
            }
        }

        let options = {
            where: {
                keyword_request_id: {
                    [Op.eq]: keyword_request.keyword_request_id
                }
            }
        };

        return await KeywordRequest.updateKeywordRequest(transaction, keyword_request, user, options);
    }

    static async deleteKeywordRequest(transaction, keyword_request_id, user) {
        let options = {
            where: {
                keyword_request_id: {
                    [Op.eq]: keyword_request_id
                }
            }
        };
        const instance = new KeywordRequest({deleted_at: new Date()}, user);
        return await instance.delete(transaction, options);
    }

    static async manageKeywordRequest () {
        const start = moment();

        if (process.env.REQUEST_KEYWORD_ACTIVE === '1') return;

        process.env.REQUEST_KEYWORD_ACTIVE = '1';

        let nextInQueue;

        try {
            // Get the next code request in queue who paid for priority
            nextInQueue = await KeywordRequest.listKeywordRequest('findOne', {
                where: {
                    keyword_request_priority: {
                        [Op.eq]: 'Yes'
                    },
                    keyword_request_finished: {
                        [Op.eq]: 'No'
                    }
                },
                order: [
                    ['keyword_request_id', 'ASC']
                ]
            });

            // If there is no code request in queue who paid for priority, get the next code request in queue
            if (!nextInQueue) {
                nextInQueue = await KeywordRequest.listKeywordRequest('findOne', {
                    where: {
                        keyword_request_finished: {
                            [Op.eq]: 'No'
                        }
                    },
                    order: [
                        ['keyword_request_id', 'ASC']
                    ]
                });
            }

            if (!nextInQueue) return;

            await getGoogleAdsKeywords(nextInQueue);

            const end = moment();
            const durationMs = end.diff(start);

            console.log(`Keyword request processed in ${durationMs} ms`);
        } catch (e) {
            await KeywordRequest.manageKeywordRequest ()
        } finally {
            process.env.REQUEST_KEYWORD_ACTIVE = '0';

            if (nextInQueue) {
                await KeywordRequest.manageKeywordRequest();
            }
        }
    }
}

function getCreateWhitelistFields() {
    return [
        'keyword_request_title',
        'keyword_request_type',
        'keyword_request_search_volume',
        'keyword_request_positive_keyword',
        'keyword_request_extra_positive_keyword',
        'keyword_request_negative_keyword',
        'keyword_request_generated_negative_keyword',
        'keyword_request_generated_positive_keyword',
        'keyword_request_brand',
        'keyword_request_city',
        'keyword_request_all_city',
        'keyword_request_region',
        'keyword_request_status',
        'keyword_request_language',
        'keyword_request_finished',
        'keyword_request_generated_positive_keyword_full_info',
        'company_company_id',
        'user_user_id',
        'deleted_at'
    ];
}

function checkKeywordRequestRequirement(keyword_request) {
    if (!keyword_request.keyword_request_positive_keyword) {
        throw new Error('Positive Keyword are required');
    }

    if (!keyword_request.company_company_id) {
        throw new Error('Company ID is required');
    }

    if (!keyword_request.user_user_id) {
        throw new Error('User ID is required');
    }
}

module.exports = KeywordRequest;

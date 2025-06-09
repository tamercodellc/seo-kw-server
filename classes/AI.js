const puppeteer = require('puppeteer-core');
const {resolve, join} = require("node:path");
const {readdirSync, unlinkSync, statSync, readFileSync, existsSync, mkdirSync} = require("node:fs");
const {Op} = require("sequelize");
const {findDataCompanyByName} = require("./DataCompany");
const {listNegativeKeywordBySi} = require("./NegativeKeywordBySi");
const {listDataCity} = require("./DataCity");

const wait = async (time = 1000) => {
    await new Promise(resolve => setTimeout(resolve, time));
}

let lastDocument = null;

let usedKeywords = [];

const DOWNLOAD_PATH = resolve(__dirname, 'downloads');

module.exports = {
    async getKeywordSearch (keyword) {
        const browser = await puppeteer.connect({
            headless: false,
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });

        const page = await browser.newPage();

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;

        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        await page.waitForSelector('#search', { visible: true });

        await page.setViewport({
            width: 950,
            height: 3000
        });

        const screenshotBuffer = await page.screenshot({ fullPage: true });

        await page.close();
        return screenshotBuffer.toString('base64');
    },

    async getLanguageSelection (language = 'english') {
        const browser = await puppeteer.connect({
            headless: false,
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });

        let googleAddsPage = await browser.newPage();

        await googleAddsPage.goto('https://ads.google.com/aw/keywordplanner/home', { waitUntil: 'networkidle2' });

        // Step 2: Click "Discover new keywords"
        await googleAddsPage.waitForSelector('[aria-label="Discover new keywords"][role="button"]', { visible: true });
        await googleAddsPage.click('[aria-label="Discover new keywords"][role="button"]');

        await googleAddsPage.click('.nav-wrapper');
        await wait(1000);

        // Step 4: Select language
        await googleAddsPage.waitForSelector('div.language-button[aria-label^="Language settings"]', { visible: true });
        await googleAddsPage.click('div.language-button[aria-label^="Language settings"]');

        // Step 5: Wait for input and paste
        const inputSelector = 'input[aria-label="Search languages"]';
        await googleAddsPage.waitForSelector(inputSelector, { visible: true });
        await googleAddsPage.focus(inputSelector);
        await googleAddsPage.click(inputSelector);
        await paste(language, googleAddsPage); // your clipboard-based paste method
        await wait(3000);

        let suggestions = [];

        try {
            await googleAddsPage.waitForFunction(() => {
                const list = document.querySelector('material-list.suggestion-list');
                return list && list.children.length > 0;
            }, { timeout: 5000 });

            suggestions = await googleAddsPage.evaluate(() => {
                const list = document.querySelector('material-list.suggestion-list');
                if (!list) return [];

                return Array.from(list.children).map(el => el.innerText.trim()).filter(Boolean);
            });
            suggestions.map(item => item.toLowerCase());
        } catch (e) {
            console.log('Error while fetching language suggestions:', e.message);
        } finally {
            await googleAddsPage.close();
        }

        return suggestions;
    },

    async getRegionSelection (region = 'united states') {
        const browser = await puppeteer.connect({
            headless: false,
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });

        let googleAddsPage = await browser.newPage();

        await googleAddsPage.goto('https://ads.google.com/aw/keywordplanner/home', { waitUntil: 'networkidle2' });

        // Step 2: Click "Discover new keywords"
        await googleAddsPage.waitForSelector('[aria-label="Discover new keywords"][role="button"]', { visible: true });
        await googleAddsPage.click('[aria-label="Discover new keywords"][role="button"]');

        await googleAddsPage.click('.nav-wrapper');
        await wait(1000);

        // Step 3: click Location
        await googleAddsPage.waitForSelector('div.location-button[aria-label^="Locations settings"]', { visible: true });
        await googleAddsPage.click('div.location-button[aria-label^="Locations settings"]');

        // Step 4: remove all locations
        const buttonClose = 'i[aria-label="Remove all targeted locations"]';
        await googleAddsPage.waitForSelector(buttonClose, { visible: true });
        await googleAddsPage.click(buttonClose);

        // Step 5: Wait for input and paste region
        const inputSelector = 'div[role="dialog"] material-input input.input.input-area';
        await googleAddsPage.waitForSelector(inputSelector, { visible: true });
        await googleAddsPage.focus(inputSelector);

        await paste(region, googleAddsPage); // your clipboard-based paste method
        await wait(3000);

        let suggestions = [];

        try {
            suggestions = await googleAddsPage.evaluate(() => {
                const entries = Array.from(document.querySelectorAll('location-data-suggestion-entry'));

                return entries.map(entry => {
                    const name = entry.querySelector('.name')?.innerText.trim().toLowerCase();
                    const type = entry.querySelector('.type')?.innerText.trim().toLowerCase();
                    return { name, type };
                });
            });
        } catch (e) {
            console.log('Error while fetching region suggestions:', e.message);
        } finally {
            await googleAddsPage.close();
        }

        return suggestions;
    },

    async getBrandSelection (keywords, language = 'english', region = [{name: 'United States', type: 'Country'}]) {
        const browser = await puppeteer.connect({
            headless: false,
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });

        let options = {};

        let chunks = splitInChunks(keywords, 10);

        for (let chunk of chunks) {
            //opens a tab to work with Google Ads
            let googleAddsPage = await browser.newPage();

            await loadPageAndTypeDesiredKeywords(chunk.join(', '), googleAddsPage, language, region);

            await wait(2000);

            const excludeChipHandle = await googleAddsPage.evaluateHandle(() => {
                const chips = Array.from(document.querySelectorAll('material-chip'));
                return chips.find(el => el.textContent.includes('Exclude adult ideas')) || null;
            });

            if (excludeChipHandle) {
                const deleteButton = await excludeChipHandle.$('div.delete-icon-container [aria-label="Delete"]');
                if (deleteButton) {
                    await deleteButton.click();
                    console.log('❌ Removed "Exclude adult ideas" chip');
                }
            }
            await googleAddsPage.waitForSelector('.expand-all', { visible: true });
            await googleAddsPage.click('.expand-all');

            await wait(3000);

            await googleAddsPage.evaluate(async () => {
                const sideDrawer = document.querySelector('.side-drawer');
                if (!sideDrawer) return;

                while (true) {
                    const loadMoreBtn = sideDrawer.querySelector('button.material-table-load-more-button');
                    if (!loadMoreBtn || loadMoreBtn.disabled) break;

                    loadMoreBtn.click();

                    // Wait for DOM to grow (adjust delay if needed)
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            });

            const tableData = await googleAddsPage.evaluate(() => {
                const data = {};
                const sideDrawer = document.querySelector('.side-drawer');
                if (!sideDrawer) return data;

                // Get all .particle-table-header elements inside .side-drawer
                const headerSections = Array.from(sideDrawer.querySelectorAll('.particle-table-header'));

                for (const headerSection of headerSections) {
                    const headers = Array.from(headerSection.querySelectorAll('.particle-header-title')).map(h => h.innerText.trim());

                    headers.forEach(header => {
                        if (!["Non-Brands", "Keywords"].includes(header)) {
                            if (!data[header]) data[header] = {children: [], active: true};
                        }
                    });

                    // Get all .particle-table-row siblings after this header
                    let row = headerSection.nextElementSibling;
                    while (row && row.classList.contains('particle-table-row')) {
                        const cells = row.querySelectorAll('ess-cell, .concept-name, .keyword-count'); // adjust if more classes are used

                        cells.forEach((cell, i) => {
                            const textField = cell.querySelector('text-field');
                            const value = textField?.innerText.trim();
                            if (value && headers[i]) {
                                if (!["Non-Brands", "Keywords"].includes(headers[i])) {
                                    data[headers[i]].children.push({
                                        name: value,
                                        active: true,
                                    });
                                }
                            }
                        });

                        row = row.nextElementSibling;
                    }
                }

                return data;
            });

            for (let header of Object.keys(tableData)) {
                if (options[header]) {
                    options[header].children = [...new Set([...options[header].children, ...tableData[header].children])];
                } else {
                    options[header] = tableData[header];
                }
            }

            await googleAddsPage.close();
        }
        return options;
    },

    async getGoogleAdsKeywords (keywordRequest) {
        const KeywordRequest = require('./KeywordRequest');
        const app = require("../app");
        let io = app?.get('io');

        try {
            const {
                keyword_request_positive_keyword, keyword_request_extra_positive_keyword,
                keyword_request_negative_keyword, keyword_request_generated_negative_keyword,
                keyword_request_search_volume, keyword_request_type, keyword_request_generated_positive_keyword,
                keyword_request_brand, keyword_request_language, keyword_request_region, keyword_request_city, keyword_request_all_city,
                keyword_request_generated_positive_keyword_full_info
            } = keywordRequest;

            let positiveKeywords = keyword_request_positive_keyword,
                extraKeywords = keyword_request_extra_positive_keyword || [],
                undesiredKeywords = keyword_request_negative_keyword || [],
                generatedNegativeKeywords = keyword_request_generated_negative_keyword || [],
                generatedPositiveKeywords = keyword_request_generated_positive_keyword || [],
                researchVolume = keyword_request_search_volume || 10,
                needsToIncludeCity = keyword_request_all_city === 'Yes',
                citiesToInclude = keyword_request_city || [],
                brands = keyword_request_brand,
                language = keyword_request_language || 'english',
                region = keyword_request_region || [{name: 'united states', type: 'country'}],
                fullInfo = keyword_request_generated_positive_keyword_full_info || [];

            let searchWords = await listNegativeKeywordBySi('findAll', {
                where: {
                    negative_keyword_by_si_intent: {
                        [Op.eq]: keyword_request_type
                    }
                },
                attributes: ['negative_keyword_by_si_word']
            })

            let dbCities = await listDataCity('findAll', {
                attributes: ['data_city_name']
            });

            dbCities = dbCities.map(item => item.data_city_name);

            if (needsToIncludeCity) {
                if (dbCities?.length) {
                    citiesToInclude = dbCities;
                }
            }

            if (citiesToInclude?.length) {
                extraKeywords = [...extraKeywords, ...citiesToInclude.map(item => item.toLowerCase())];
            }

            searchWords?.length && (undesiredKeywords = [...searchWords.map(item => item.negative_keyword_by_si_word), ...undesiredKeywords]);

            if (generatedNegativeKeywords?.length) {
                usedKeywords = generatedNegativeKeywords;
            }

            if (undesiredKeywords.length) {
                undesiredKeywords = undesiredKeywords.join(', ');
            }

            //creates download folder if does not exists
            if (!existsSync(DOWNLOAD_PATH)) {
                mkdirSync(DOWNLOAD_PATH);
            }

            //remove all files in the folder
            readdirSync(DOWNLOAD_PATH).forEach(file => {
                unlinkSync(join(DOWNLOAD_PATH, file));
            });

            //creates browser connection on port 9222
            const browser = await puppeteer.connect({
                headless: false,
                browserURL: 'http://localhost:9222',
                defaultViewport: null
            });

            let generalCSV = [];
            let positiveChunks = splitInChunks(positiveKeywords, 10);

            let googleAddsPage;

            for (let chunk of positiveChunks) {
                //opens a tab to work with Google Ads

                googleAddsPage = await browser.newPage();
                //modifies the download behavior to download files to the download folder
                const client = await googleAddsPage.target().createCDPSession();
                await client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: DOWNLOAD_PATH,
                });

                //navigates to Google Ads and goes to the Keyword Planner
                await loadPageAndTypeDesiredKeywords(chunk.join(', '), googleAddsPage, language, region);

                await manageFilters();

                await unselectBrands();

                await downloadKeywords();

                generalCSV = [...generalCSV, ...await getCSVData()];

                readdirSync(DOWNLOAD_PATH).forEach(file => {
                    unlinkSync(join(DOWNLOAD_PATH, file));
                });

                await googleAddsPage.close();
            }

            generalCSV = [...new Set(generalCSV)];

            await manageBrandKeywords(generalCSV);

            async function manageBrandKeywords(csv) {

                let negativeBrands = [];

                let request = await KeywordRequest.listKeywordRequest('findOne', {
                    where: {
                        keyword_request_id: {
                            [Op.eq]: keywordRequest.keyword_request_id
                        }
                    }
                });

                let oldNegativeGeneratedKeywords = request.keyword_request_generated_negative_keyword || [];

                let count = 0
                for (let keyword of csv) {
                    usedKeywords.push(keyword);
                    const originalKeyword = keyword;

                    if (+keyword["Avg. monthly searches"] < researchVolume) {
                        continue;
                    }

                    keyword = keyword.Keyword;

                    let answer = await findDataCompanyByName(keyword);

                    if (keyword_request_city?.length && !needsToIncludeCity) {
                        for (let city of keyword_request_city) {
                            city = city.data_city_name;
                            if (keyword.toLowerCase().includes(city.toLowerCase())) {
                                answer = city;
                                break;
                            }
                        }
                    }

                    if (answer) {
                        for (let extraKey of [...positiveKeywords, ...extraKeywords]) {
                            if (keyword.toLowerCase().includes(extraKey.toLowerCase())) {
                                answer = false;
                                if (!generatedPositiveKeywords.includes(keyword)) {
                                    generatedPositiveKeywords.push(keyword);
                                    fullInfo.push(originalKeyword);
                                    count++;
                                }
                                break;
                            }
                        }
                        if (answer && !negativeBrands.includes(answer.toLowerCase())) {
                            negativeBrands.push(answer.toLowerCase());

                            console.log(`✅ Found brand: ${keyword}`);
                        }
                    }

                    if (!answer) {
                        if (!generatedPositiveKeywords.includes(keyword)) {
                            generatedPositiveKeywords.push(keyword);
                            fullInfo.push(originalKeyword);
                            count++;
                        }

                        if (count < 100) {
                            continue;
                        }
                    }

                    if (count >= 100) {
                        await saveGeneratedKeywords();

                        positiveKeywords = request.keyword_request_positive_keyword;
                        extraKeywords = request.keyword_request_extra_positive_keyword;
                        undesiredKeywords = request.keyword_request_negative_keyword;
                        generatedNegativeKeywords = oldNegativeGeneratedKeywords;

                        console.log(`------------------------------------------------------------------------------`);
                        console.log(`------------------------------------------------------------------------------`);
                        console.log(`------------------------------------------------------------------------------`);
                        count = 0;
                    }
                }
                if (count > 0) {
                    await saveGeneratedKeywords('Yes')
                }

                async function saveGeneratedKeywords(finished = 'No') {
                    for (let brand of negativeBrands) {

                        if (!oldNegativeGeneratedKeywords.includes(brand)) {
                            let needsToContinue = false;
                            for (let extraKey of [...positiveKeywords, ...extraKeywords]) {
                                if (brand.toLowerCase().includes(extraKey.toLowerCase())) {
                                    needsToContinue = true;
                                    break;
                                }
                            }
                            if (needsToContinue) {
                                continue;
                            }
                            oldNegativeGeneratedKeywords.push(brand);
                        }
                    }

                    if (finished === 'Yes') {
                        generatedPositiveKeywords = [...new Set(generatedPositiveKeywords)];
                        fullInfo = [...new Set(fullInfo)];
                        oldNegativeGeneratedKeywords = [...new Set(oldNegativeGeneratedKeywords)];
                        generatedPositiveKeywords.sort()
                        oldNegativeGeneratedKeywords.sort();

                        io.emit('keyword_request' + keywordRequest.user_user_id, {
                            code: 1,
                            title: request.keyword_request_title,
                            keyword_request_id: request.keyword_request_id,
                            keywords: usedKeywords?.length || 0,
                            totalKeywords: csv?.length || 0,
                        });
                    }

                    await KeywordRequest.updateKeywordRequestFactory(null, {
                        keyword_request_id: request.keyword_request_id,
                        keyword_request_generated_negative_keyword: oldNegativeGeneratedKeywords,
                        keyword_request_generated_positive_keyword: generatedPositiveKeywords,
                        keyword_request_generated_positive_keyword_full_info: fullInfo,
                        keyword_request_finished: finished,
                        keyword_request_status: finished === 'Yes' ? 'Finished' : 'In Progress',
                    }, {user_id: keywordRequest.user_user_id}, true);

                    if (finished === 'No') {
                        request = await KeywordRequest.listKeywordRequest('findOne', {
                            where: {
                                keyword_request_id: {
                                    [Op.eq]: keywordRequest.keyword_request_id
                                }
                            }
                        });
                    }
                }
            }

            async function manageFilters() {
                // Step 1: Remove "Exclude adult ideas" chip if it exists
                const excludeChipHandle = await googleAddsPage.evaluateHandle(() => {
                    const chips = Array.from(document.querySelectorAll('material-chip'));
                    return chips.find(el => el.textContent.includes('Exclude adult ideas')) || null;
                });

                if (excludeChipHandle) {
                    const deleteButton = await excludeChipHandle.$('div.delete-icon-container [aria-label="Delete"]');
                    if (deleteButton) {
                        await deleteButton.click();
                        console.log('❌ Removed "Exclude adult ideas" chip');
                    }
                }

                //clicks on the nav wrapper to open the change the filter from textfield to dropdown button
                await googleAddsPage.click('.nav-wrapper');
                await wait(1000);

                await excludeKeywords(undesiredKeywords);
            }

            async function restoreSearchResults() {
                if (!generatedNegativeKeywords?.length) return;

                let chunks = splitInChunks(generatedNegativeKeywords, 100);

                for (let chunk of chunks) {
                    await excludeKeywords(chunk.join(', '));
                    await wait(30000);
                }
            }

            async function excludeKeywords(keywords) {
                //clicks on the nav wrapper to open the change the filter from textfield to dropdown button
                await googleAddsPage.click('.nav-wrapper');
                await wait(1000);

                // Step 1: Click on the "Add filter" button
                await googleAddsPage.waitForSelector('material-button.add-filter-btn', { visible: true });
                await googleAddsPage.click('material-button.add-filter-btn');

                // Step 2: Click on the "Keyword" option
                await googleAddsPage.type('.popup-search-box', 'Keyword', { delay: 30 });
                //waits for the dropdown option to appear
                await wait(1500);

                // Step 3: Click on the "Keyword" option
                await googleAddsPage.waitForSelector('material-select-item[aria-label*="Keyword"]', { visible: true });
                await googleAddsPage.click('material-select-item[aria-label*="Keyword"]');
                await googleAddsPage.click('div[role="button"][aria-label*="Select operator"]');
                await googleAddsPage.waitForSelector('material-select-dropdown-item .label', { visible: true });

                // Step 4 Get all visible options and click the "does not contain" option
                const options = await googleAddsPage.$$('material-select-dropdown-item .label');

                // Loop through the options and click the one that contains "does not contain"
                for (const option of options) {
                    const text = await googleAddsPage.evaluate(el => el.textContent.trim(), option);
                    if (text === 'does not contain') {
                        await option.click();
                        break;
                    }
                }

                // Wait for the textarea input to appear
                await googleAddsPage.waitForSelector('textarea[aria-label="Value"]', { visible: true });
                await wait(1000);

                // Step 6: Type the keywords
                await googleAddsPage.click('textarea[aria-label="Value"]');
                await paste(keywords, googleAddsPage);
                await wait(1000);

                // Click the Apply button
                await googleAddsPage.click('material-button[aria-label="Apply"]');
            }

            async function unselectBrands() {
                await googleAddsPage.waitForSelector('.expand-all', { visible: true });
                await googleAddsPage.click('.expand-all');

                await wait(3000);

                await googleAddsPage.evaluate(async () => {
                    const sideDrawer = document.querySelector('.side-drawer');
                    if (!sideDrawer) return;

                    while (true) {
                        const loadMoreBtn = sideDrawer.querySelector('button.material-table-load-more-button');
                        if (!loadMoreBtn || loadMoreBtn.disabled) break;

                        loadMoreBtn.click();

                        // Wait for DOM to grow (adjust delay if needed)
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                });

                let options = [];

                for (let brand of Object.values(brands)) {
                    if (brand.children) {
                        for (const child of brand.children) {
                            if (!child.active) {
                                options.push(child.name);
                            }
                        }
                    } else {
                        options.push(...[]);
                    }
                }

                for (const label of options) {
                    const checkboxHandle = await googleAddsPage.evaluateHandle((labelText) => {
                        const rows = Array.from(document.querySelectorAll('.particle-table-row'));
                        for (const row of rows) {
                            const textEl = row.querySelector('text-field');
                            const name = textEl?.innerText?.trim().toLowerCase();
                            if (name === labelText.toLowerCase()) {
                                return row.querySelector('mat-checkbox .mat-checkbox-container');
                            }
                        }
                        return null;
                    }, label);

                    const checkboxElement = checkboxHandle.asElement();

                    if (checkboxElement) {
                        await checkboxElement.click();
                        await wait(300);
                    }
                }

                await wait(10000);
            }

            async function downloadKeywords() {
                const downloadButtons = await googleAddsPage.$$('material-button');
                let clicked = false;

                for (const button of downloadButtons) {
                    const text = await googleAddsPage.evaluate(el => el.innerText.trim(), button);
                    if (text.includes('file_download')) {
                        await button.click();
                        clicked = true;
                        break;
                    }
                }
                if (!clicked) {
                    await wait(1000);
                    return await downloadKeywords();
                }

                // Wait for the menu to appear and click ".csv"
                await googleAddsPage.waitForSelector('material-select-item[aria-label=".csv"]');
                await wait(2000);
                await googleAddsPage.click('material-select-item[aria-label=".csv"]');
            }

            async function getCSVData () {
                const files = readdirSync(DOWNLOAD_PATH)
                    .filter(f => f.endsWith('.csv'))
                    .map(f => ({
                        name: f,
                        time: statSync(join(DOWNLOAD_PATH, f)).mtime.getTime()
                    }))
                    .sort((a, b) => b.time - a.time);

                if (!files.length) {
                    await wait(500);
                    return await getCSVData();
                }

                const latestCSVPath = join(DOWNLOAD_PATH, files[0].name);

                if (lastDocument === latestCSVPath) {
                    await wait(500);
                    return await getCSVData();
                }

                lastDocument = latestCSVPath;

                const csvRaw = readFileSync(latestCSVPath, 'utf16le');
                const lines = csvRaw.split('\n').slice(2); // skip 2 header lines

                const headers = lines[0].trim().split('\t');

                let results = [];

                for (let line of lines.slice(1)) {
                    const values = line.trim().split('\t');
                    let obj = {};

                    let needsToContinue = false;
                    for (let header of headers) {
                        if (!values[headers.indexOf('Keyword')] || parseInt(values[headers.indexOf('Avg. monthly searches')]) < researchVolume) {
                            needsToContinue = true;
                            break;
                        }

                        if (values[headers.indexOf(header)]) obj[header] = values[headers.indexOf(header)];
                    }

                    if (needsToContinue) {
                        continue;
                    }
                    results.push(obj);
                }
                return results;
            }
        } catch (e) {
            console.error(e);
        }
    },

    async getGoogleAdsKeywordDifferences (keywordRequest) {
        const KeywordRequest = require('./KeywordRequest');
        const app = require("../app");
        let io = app?.get('io');

        let request = await KeywordRequest.listKeywordRequest('findOne', {
            where: {
                keyword_request_id: {
                    [Op.eq]: keywordRequest.keyword_request_id
                }
            }
        });

        try {
            let {
                keyword_request_positive_keyword, keyword_request_extra_positive_keyword,
                keyword_request_negative_keyword, keyword_request_generated_negative_keyword,
                keyword_request_search_volume, keyword_request_type, keyword_request_generated_positive_keyword,
                keyword_request_brand, keyword_request_language, keyword_request_region, keyword_request_city, keyword_request_all_city
            } = request;

            keyword_request_positive_keyword = keywordRequest.positiveKeywordsToAdd;

            let positiveKeywords = keyword_request_positive_keyword,
                extraKeywords = keyword_request_extra_positive_keyword || [],
                undesiredKeywords = keyword_request_negative_keyword || [],
                generatedNegativeKeywords = keyword_request_generated_negative_keyword || [],
                generatedPositiveKeywords = keyword_request_generated_positive_keyword || [],
                researchVolume = keyword_request_search_volume || 10,
                needsToIncludeCity = keyword_request_all_city === 'Yes',
                citiesToInclude = keyword_request_city || [],
                brands = keyword_request_brand,
                language = keyword_request_language || 'english',
                region = keyword_request_region || [{name: 'united states', type: 'country'}];

            let searchWords = await listNegativeKeywordBySi('findAll', {
                where: {
                    negative_keyword_by_si_intent: {
                        [Op.eq]: keyword_request_type
                    }
                },
                attributes: ['negative_keyword_by_si_word']
            })

            let dbCities = await listDataCity('findAll', {
                attributes: ['data_city_name']
            });

            dbCities = dbCities.map(item => item.data_city_name);

            if (needsToIncludeCity) {
                if (dbCities?.length) {
                    citiesToInclude = dbCities;
                }
            }

            if (citiesToInclude?.length) {
                extraKeywords = [...extraKeywords, ...citiesToInclude.map(item => item.toLowerCase())];
            }

            searchWords?.length && (undesiredKeywords = [...searchWords.map(item => item.negative_keyword_by_si_word), ...undesiredKeywords]);

            if (generatedNegativeKeywords?.length) {
                usedKeywords = generatedNegativeKeywords;
            }

            if (undesiredKeywords.length) {
                undesiredKeywords = undesiredKeywords.join(', ');
            }

            //creates download folder if does not exists
            if (!existsSync(DOWNLOAD_PATH)) {
                mkdirSync(DOWNLOAD_PATH);
            }

            //remove all files in the folder
            readdirSync(DOWNLOAD_PATH).forEach(file => {
                unlinkSync(join(DOWNLOAD_PATH, file));
            });

            //creates browser connection on port 9222
            const browser = await puppeteer.connect({
                headless: false,
                browserURL: 'http://localhost:9222',
                defaultViewport: null
            });

            let generalCSV = [];
            let positiveChunks = splitInChunks(positiveKeywords, 10);

            let googleAddsPage;

            for (let chunk of positiveChunks) {
                //opens a tab to work with Google Ads

                googleAddsPage = await browser.newPage();
                //modifies the download behavior to download files to the download folder
                const client = await googleAddsPage.target().createCDPSession();
                await client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: DOWNLOAD_PATH,
                });

                //navigates to Google Ads and goes to the Keyword Planner
                await loadPageAndTypeDesiredKeywords(chunk.join(', '), googleAddsPage, language, region);

                await manageFilters();

                await unselectBrands();

                await downloadKeywords();

                generalCSV = [...generalCSV, ...await getCSVData()];

                readdirSync(DOWNLOAD_PATH).forEach(file => {
                    unlinkSync(join(DOWNLOAD_PATH, file));
                });

                await googleAddsPage.close();
            }

            generalCSV = [...new Set(generalCSV)];

            await manageBrandKeywords(generalCSV);

            async function manageBrandKeywords(csv) {

                let negativeBrands = [];

                let oldNegativeGeneratedKeywords = request.keyword_request_generated_negative_keyword || [];

                let newKeywords = [];
                for (let keyword of csv) {
                    usedKeywords.push(keyword);

                    if (+keyword["Avg. monthly searches"] < researchVolume) {
                        continue;
                    }

                    keyword = keyword.Keyword;

                    let answer = await findDataCompanyByName(keyword);

                    if (keyword_request_city?.length && !needsToIncludeCity) {
                        for (let city of keyword_request_city) {
                            city = city.data_city_name;
                            if (keyword.toLowerCase().includes(city.toLowerCase())) {
                                answer = city;
                                break;
                            }
                        }
                    }

                    if (answer) {
                        for (let extraKey of [...positiveKeywords, ...extraKeywords]) {
                            if (keyword.toLowerCase().includes(extraKey.toLowerCase())) {
                                answer = false;
                                if (!generatedPositiveKeywords.includes(keyword)) {
                                    generatedPositiveKeywords.push(keyword);
                                    newKeywords.push(keyword);
                                }
                                break;
                            }
                        }

                        if (answer && !negativeBrands.includes(answer.toLowerCase())) {
                            negativeBrands.push(answer.toLowerCase());

                            console.log(`✅ Found brand: ${keyword}`);
                        }
                    }

                    if (!answer) {
                        if (!generatedPositiveKeywords.includes(keyword)) {
                            generatedPositiveKeywords.push(keyword);
                            newKeywords.push(keyword);
                        }
                    }
                }
                await saveGeneratedKeywords()

                async function saveGeneratedKeywords() {
                    for (let brand of negativeBrands) {
                        if (!oldNegativeGeneratedKeywords.includes(brand)) {
                            let needsToContinue = false;
                            for (let extraKey of [...positiveKeywords, ...extraKeywords]) {
                                if (brand.toLowerCase().includes(extraKey.toLowerCase())) {
                                    needsToContinue = true;
                                    break;
                                }
                            }
                            if (needsToContinue) {
                                continue;
                            }
                            oldNegativeGeneratedKeywords.push(brand);
                        }
                    }

                    generatedPositiveKeywords = [...new Set(generatedPositiveKeywords)];
                    oldNegativeGeneratedKeywords = [...new Set(oldNegativeGeneratedKeywords)];
                    generatedPositiveKeywords.sort()
                    oldNegativeGeneratedKeywords.sort();

                    io.emit('keyword_request_difference' + request.user_user_id, {
                        code: 2,
                        title: request.keyword_request_title,
                        keyword_request_id: request.keyword_request_id,
                        keywords: newKeywords,
                        totalKeywords: newKeywords?.length || 0,
                    });

                    await KeywordRequest.updateKeywordRequestFactory(null, {
                        keyword_request_id: request.keyword_request_id,
                        keyword_request_generated_negative_keyword: oldNegativeGeneratedKeywords,
                        keyword_request_generated_positive_keyword: generatedPositiveKeywords,
                        keyword_request_finished: 'Yes',
                        keyword_request_status: 'Finished',
                    }, {user_id: keywordRequest.user_user_id}, true);
                }
            }

            async function manageFilters() {
                // Step 1: Remove "Exclude adult ideas" chip if it exists
                const excludeChipHandle = await googleAddsPage.evaluateHandle(() => {
                    const chips = Array.from(document.querySelectorAll('material-chip'));
                    return chips.find(el => el.textContent.includes('Exclude adult ideas')) || null;
                });

                if (excludeChipHandle) {
                    const deleteButton = await excludeChipHandle.$('div.delete-icon-container [aria-label="Delete"]');
                    if (deleteButton) {
                        await deleteButton.click();
                        console.log('❌ Removed "Exclude adult ideas" chip');
                    }
                }

                //clicks on the nav wrapper to open the change the filter from textfield to dropdown button
                await googleAddsPage.click('.nav-wrapper');
                await wait(1000);

                await excludeKeywords(undesiredKeywords);
            }

            async function restoreSearchResults() {
                if (!generatedNegativeKeywords?.length) return;

                let chunks = splitInChunks(generatedNegativeKeywords, 100);

                for (let chunk of chunks) {
                    await excludeKeywords(chunk.join(', '));
                    await wait(30000);
                }
            }

            async function excludeKeywords(keywords) {
                //clicks on the nav wrapper to open the change the filter from textfield to dropdown button
                await googleAddsPage.click('.nav-wrapper');
                await wait(1000);

                // Step 1: Click on the "Add filter" button
                await googleAddsPage.waitForSelector('material-button.add-filter-btn', { visible: true });
                await googleAddsPage.click('material-button.add-filter-btn');

                // Step 2: Click on the "Keyword" option
                await googleAddsPage.type('.popup-search-box', 'Keyword', { delay: 30 });
                //waits for the dropdown option to appear
                await wait(1500);

                // Step 3: Click on the "Keyword" option
                await googleAddsPage.waitForSelector('material-select-item[aria-label*="Keyword"]', { visible: true });
                await googleAddsPage.click('material-select-item[aria-label*="Keyword"]');
                await googleAddsPage.click('div[role="button"][aria-label*="Select operator"]');
                await googleAddsPage.waitForSelector('material-select-dropdown-item .label', { visible: true });

                // Step 4 Get all visible options and click the "does not contain" option
                const options = await googleAddsPage.$$('material-select-dropdown-item .label');

                // Loop through the options and click the one that contains "does not contain"
                for (const option of options) {
                    const text = await googleAddsPage.evaluate(el => el.textContent.trim(), option);
                    if (text === 'does not contain') {
                        await option.click();
                        break;
                    }
                }

                // Wait for the textarea input to appear
                await googleAddsPage.waitForSelector('textarea[aria-label="Value"]', { visible: true });
                await wait(1000);

                // Step 6: Type the keywords
                await googleAddsPage.click('textarea[aria-label="Value"]');
                await paste(keywords, googleAddsPage);
                await wait(1000);

                // Click the Apply button
                await googleAddsPage.click('material-button[aria-label="Apply"]');
            }

            async function unselectBrands() {
                await googleAddsPage.waitForSelector('.expand-all', { visible: true });
                await googleAddsPage.click('.expand-all');

                await wait(3000);

                await googleAddsPage.evaluate(async () => {
                    const sideDrawer = document.querySelector('.side-drawer');
                    if (!sideDrawer) return;

                    while (true) {
                        const loadMoreBtn = sideDrawer.querySelector('button.material-table-load-more-button');
                        if (!loadMoreBtn || loadMoreBtn.disabled) break;

                        loadMoreBtn.click();

                        // Wait for DOM to grow (adjust delay if needed)
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                });

                let options = [];

                for (let brand of Object.values(brands)) {
                    if (brand.children) {
                        for (const child of brand.children) {
                            if (!child.active) {
                                options.push(child.name);
                            }
                        }
                    } else {
                        options.push(...[]);
                    }
                }

                for (const label of options) {
                    const checkboxHandle = await googleAddsPage.evaluateHandle((labelText) => {
                        const rows = Array.from(document.querySelectorAll('.particle-table-row'));
                        for (const row of rows) {
                            const textEl = row.querySelector('text-field');
                            const name = textEl?.innerText?.trim().toLowerCase();
                            if (name === labelText.toLowerCase()) {
                                return row.querySelector('mat-checkbox .mat-checkbox-container');
                            }
                        }
                        return null;
                    }, label);

                    const checkboxElement = checkboxHandle.asElement();

                    if (checkboxElement) {
                        await checkboxElement.click();
                        await wait(300);
                    }
                }

                await wait(10000);
            }

            async function downloadKeywords() {
                const downloadButtons = await googleAddsPage.$$('material-button');
                let clicked = false;

                for (const button of downloadButtons) {
                    const text = await googleAddsPage.evaluate(el => el.innerText.trim(), button);
                    if (text.includes('file_download')) {
                        await button.click();
                        clicked = true;
                        break;
                    }
                }
                if (!clicked) {
                    await wait(1000);
                    return await downloadKeywords();
                }

                // Wait for the menu to appear and click ".csv"
                await googleAddsPage.waitForSelector('material-select-item[aria-label=".csv"]');
                await googleAddsPage.click('material-select-item[aria-label=".csv"]');
            }

            async function getCSVData () {
                const files = readdirSync(DOWNLOAD_PATH)
                    .filter(f => f.endsWith('.csv'))
                    .map(f => ({
                        name: f,
                        time: statSync(join(DOWNLOAD_PATH, f)).mtime.getTime()
                    }))
                    .sort((a, b) => b.time - a.time);

                if (!files.length) {
                    await wait(500);
                    return await getCSVData();
                }

                const latestCSVPath = join(DOWNLOAD_PATH, files[0].name);

                if (lastDocument === latestCSVPath) {
                    await wait(500);
                    return await getCSVData();
                }

                lastDocument = latestCSVPath;

                const csvRaw = readFileSync(latestCSVPath, 'utf16le');
                const lines = csvRaw.split('\n').slice(2); // skip 2 header lines

                const headers = lines[0].trim().split('\t');

                let results = [];

                for (let line of lines.slice(1)) {
                    const values = line.trim().split('\t');
                    let obj = {};

                    let needsToContinue = false;
                    for (let header of headers) {
                        if (!values[headers.indexOf('Keyword')] || parseInt(values[headers.indexOf('Avg. monthly searches')]) < researchVolume) {
                            needsToContinue = true;
                            break;
                        }

                        if (values[headers.indexOf(header)]) obj[header] = values[headers.indexOf(header)];
                    }

                    if (needsToContinue) {
                        continue;
                    }
                    results.push(obj);
                }
                return results;
            }
        } catch (e) {
            console.error(e);
        }
    },

    async generateExcel(keywordRequest = 12) {
        const ExcelJS = require('exceljs');
        const path = require('path');
        const fs = require('fs');
        const {sendExcelEmail} = require('./Email');

        const KeywordRequest = require('./KeywordRequest');

        // Define the save location
        const folderPath = path.join(__dirname, 'exports');
        const fileName = 'keyword_data.xlsx';
        const filePath = path.join(folderPath, fileName);

        // Ensure the folder exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Keyword Data');

        let request = await KeywordRequest.listKeywordRequest('findOne', {
            where: {
                keyword_request_id: {
                    [Op.eq]: keywordRequest
                }
            }
        });

        let width = [50, 13, 25, 50, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

        const sorted = [...request.dataValues.keyword_request_generated_positive_keyword_full_info].sort((a, b) =>
            parseInt(b["Avg. monthly searches"]) - parseInt(a["Avg. monthly searches"])
        );

        // Add header
        const headers = [
            'Keyword',
            'Competition',
            'Avg. monthly searches',
            'Annual Trend',
            ...getOrderedSearchMonthKeys(sorted[0]),
            'Top of page bid (low range)',
            'Top of page bid (high range)'
        ];

        worksheet.columns = headers.map((key, index) => {
            return {
                header: key, key,
                width: width[index] || 61,
            }
        });

        // Add rows
        sorted.forEach(row => {
            let rowData = [
                row.Keyword,
                row.Competition,
                row["Avg. monthly searches"],
                row["Annual Trend"],
                ...getOrderedSearchMonthKeys(sorted[0]).map(key => row[key] || ''),
                row["Top of page bid (low range)"],
                row["Top of page bid (high range)"]
            ];

            worksheet.addRow(rowData)
        });

        let colors = [
            "#F86669", // Darkest red
            "#F97B68",
            "#F98F68",
            "#F9A368",
            "#FAB768",
            "#FACC68",
            "#D7D16F",
            "#A6D676",
            "#86D97A",
            "#74DB7A",
            "#69DC7A",
            "#62BD7A"  // Darkest green
        ];

        worksheet.eachRow((row, rowNumber) => {
            try {
                if (rowNumber === 1) return; // saltar cabecera
                let searches = getMonthlySearchesFromRow(row, worksheet);

                searches.sort((a, b) =>
                    parseInt(a.value) - parseInt(b.value)
                )

                let lastValue = 0;
                for (let i = 0; i < colors.length; i++) {
                    let index = i;
                    if (i > 0 && searches[i].value === searches[i - 1].value) {
                        index = lastValue;
                    } else {
                        lastValue = i;
                    }

                    searches[i].color = colors[index].replace('#', '');
                }

                row.eachCell(cell => {
                    let color = searches.find(s => s.cellNumber === cell.address)?.color;
                    if (color) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: color }
                        };
                    }
                });
            } catch (e) {
                console.error(`Error processing row ${rowNumber}:`, e.message);
            }

        });

        // Style header row
        worksheet.getRow(1).eachCell(cell => {
            if (cell.value.startsWith('Searches:')) {
                let val = cell.value.replace('Searches:', '').trim();
                cell.value = val.split(' ')[0]
            }

            if (cell.value === 'Top of page bid (low range)') {
                cell.value = 'Low Range';
            }

            if (cell.value === 'Top of page bid (high range)') {
                cell.value = 'High Range';
            }

            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDDDDD' }
            };
        });

        await workbook.xlsx.writeFile(filePath);
        console.log(`✅ Saved Excel to ${filePath}`);

        sendExcelEmail(filePath);

        function getMonthlySearchesFromRow(row, sheet) {
            const result = [];
            const headers = sheet.getRow(1).values; // Cabecera está en la fila 1

            for (let colIndex = 1; colIndex < headers.length; colIndex++) {
                const header = headers[colIndex];
                if (typeof header === 'string' && header.includes('Searches:')) {
                    const cellValue = row.getCell(colIndex).value;
                    result.push({
                        header,
                        value: +(typeof cellValue === 'object' ? cellValue?.result : cellValue),
                        cellNumber: row.getCell(colIndex).address,
                    })
                }
            }

            return result;
        }

        function getOrderedSearchMonthKeys(entry) {
            const monthMap = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3,
                May: 4, Jun: 5, Jul: 6, Aug: 7,
                Sep: 8, Oct: 9, Nov: 10, Dec: 11,
            };

            return Object.keys(entry)
                .filter(k => k.startsWith("Searches: "))
                .map(k => {
                    const match = k.match(/Searches: (\w+) (\d{4})/);
                    if (!match) return null;

                    const [_, monthName, year] = match;
                    const monthAbbr = monthName.slice(0, 3);
                    const monthIndex = monthMap[monthAbbr];

                    if (monthIndex === undefined) return null;

                    return {
                        key: k,
                        date: new Date(2025, monthIndex)
                    };
                })
                .filter(Boolean)
                .sort((a, b) => a.date - b.date)
                .map(item => item.key);
        }


    }
}

async function loadPageAndTypeDesiredKeywords(keywords, googleAddsPage, language, region) {
    // Step 1: Go to Keyword Planner
    await googleAddsPage.goto('https://ads.google.com/aw/keywordplanner/home?ocid=247321891&ascid=247321891&euid=1033175489&__u=8508135161&uscid=1585842924&__c=1760462476&authuser=0&__e=6151653339', { waitUntil: 'networkidle2' });

    // Step 2: Click "Discover new keywords"
    await googleAddsPage.waitForSelector('[aria-label="Discover new keywords"][role="button"]', { visible: true });

    await googleAddsPage.click('[aria-label="Discover new keywords"][role="button"]');

    await googleAddsPage.click('.nav-wrapper');
    await wait(1000);

    if (language.toLowerCase() !== 'english') {
        // Step 3: Select language
        await googleAddsPage.waitForSelector('div.language-button[aria-label^="Language settings"]', {visible: true});
        await googleAddsPage.click('div.language-button[aria-label^="Language settings"]');

        // Step 4: Wait for input and paste
        const inputLanguageSelector = 'input[aria-label="Search input"]';
        await googleAddsPage.waitForSelector(inputLanguageSelector, {visible: true});

        await paste(language, googleAddsPage); // your clipboard-based paste method
        await wait(1000);

        const options = await googleAddsPage.$$('material-list.suggestion-list');

        // Loop through the options and click the one that matches the desired language
        for (const option of options) {
            const text = await googleAddsPage.evaluate(el => el.textContent.trim(), option);
            if (text.toLowerCase() === language.toLowerCase()) {
                await option.click();
                break;
            }
        }
    }

    await googleAddsPage.click('.nav-wrapper');
    await wait(1000);

    if (region?.length && (region.length === 1 && region[0].name.toLowerCase() !== 'united states')) {
        if (!Array.isArray(region)) {
            try {
                region = JSON.parse(region);
            } catch (e) {
                console.log('Error parsing region:', e.message);
            }
        }
        // Step 5: click Location
        await googleAddsPage.waitForSelector('div.location-button[aria-label^="Locations settings"]', {visible: true});
        await googleAddsPage.click('div.location-button[aria-label^="Locations settings"]');

        // Step 6: remove all locations
        const buttonClose = 'i[aria-label="Remove all targeted locations"]';
        await googleAddsPage.waitForSelector(buttonClose, {visible: true});
        await googleAddsPage.click(buttonClose);

        // Step 7: Wait for input and paste region
        const inputRegionSelector = 'div[role="dialog"] material-input input.input.input-area';
        await googleAddsPage.waitForSelector(inputRegionSelector, {visible: true});
        await googleAddsPage.focus(inputRegionSelector);

        for (let reg of region) {
            await googleAddsPage.waitForSelector(inputRegionSelector, {visible: true});
            await googleAddsPage.focus(inputRegionSelector);

            await paste(reg.name, googleAddsPage); // your clipboard-based paste method
            await wait(1000);

            const options = await googleAddsPage.$$('location-data-suggestion-entry');

            for (const option of options) {
                const text = await googleAddsPage.evaluate(el => el.querySelector('.name')?.innerText.trim().toLowerCase(), option);
                const type = await googleAddsPage.evaluate(el => el.querySelector('.type')?.innerText.trim().toLowerCase(), option);
                if (text === reg.name.toLowerCase() && type === reg.type.toLowerCase()) {
                    await option.click();
                    break;
                }
            }
        }

        await wait(1000);

        const options = await googleAddsPage.$$('material-button');

        for (const option of options) {
            const text = await googleAddsPage.evaluate(el => el.querySelector('.content ')?.innerText.trim().toLowerCase(), option);
            if (text === 'save') {
                try {
                    await option.click();
                } catch (e) {
                    console.log('Error clicking save button:', e.message);
                }
            }
        }
    }

    await googleAddsPage.click('.nav-wrapper');
    await wait(1000);

    // Step 8: Wait for input and paste
    const inputSelector = 'input[aria-label="Search input"]';
    await googleAddsPage.waitForSelector(inputSelector, {visible: true});

    await googleAddsPage.focus(inputSelector);
    await googleAddsPage.click(inputSelector);
    await paste(keywords, googleAddsPage); // your clipboard-based paste method
    await wait(2000);

    // Step 9: Click "Get results"
    await googleAddsPage.waitForSelector('material-button.submit-button[role="button"] div.content', { visible: true });
    await googleAddsPage.click('material-button.submit-button[role="button"] div.content');

    await wait(2000);
}

async function paste(textToPaste, page) {
    await page.evaluate((text) => {
        navigator.clipboard.writeText(text);
    }, textToPaste);

    await wait(2000);

    await page.keyboard.down('Control');
    await page.keyboard.press('KeyV');
    await page.keyboard.up('Control');
}

function splitInChunks(array, size = 300, avoid = false) {
    const result = [];
    let tempArray = [];

    for (let word of array) {
        if (usedKeywords.includes(word) && !avoid) {
            continue;
        }

        tempArray.push(word);
        if (tempArray.length >= size) {
            result.push(tempArray);
            tempArray = [];
        }
    }
    if (tempArray.length) {
        result.push(tempArray);
    }
    return result;
}
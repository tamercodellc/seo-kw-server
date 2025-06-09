const puppeteer = require('puppeteer-core');
const {resolve, join} = require("node:path");
const {readdirSync, unlinkSync, statSync, readFileSync, existsSync, mkdirSync} = require("node:fs");
const {findDataCompanyByName} = require("../DataCompany");

const wait = async (time = 1000) => {
    await new Promise(resolve => setTimeout(resolve, time));
}

const desiredKeywords = `seo agency, seo company, digital marketing agency, digital marketing company, 
online marketing agency, online marketing company, social media agency, social media company, 
content marketing agency, content marketing company`;

// email marketing agency, email marketing company,
//     ppc agency, ppc company, google ads agency, google ads company, meta ads agency, meta ads company,
//     search engine optimization agency, search engine optimization company, seo service, seo optimization,
//     best seo company, best seo agency

const undesiredKeywords = 'price, where, how, what, why, when, who';

let lastDocument = null;

const usedKeywords = [];

const DOWNLOAD_PATH = resolve(__dirname, 'downloads');

module.exports = {
    runAds: async () => {

        if (!existsSync(DOWNLOAD_PATH)) {
            mkdirSync(DOWNLOAD_PATH);
        }

        //remove all files in the folder
        readdirSync(DOWNLOAD_PATH).forEach(file => {
            unlinkSync(join(DOWNLOAD_PATH, file));
        })

        const browser = await puppeteer.connect({
            headless: false,
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });

        const googleAddsPage = await browser.newPage();

        const client = await googleAddsPage.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: DOWNLOAD_PATH,
        });

        await loadPageAndTypeDesiredKeywords();

        await manageFilters();

        await unselectBrands();

        await downloadKeywords();

        let csv = await getCSVData();

        if (!csv || csv.length === 0) {
            debugger
        }

        await manageBrandKeywords(csv);
        await wait(5000);
        await downloadKeywords();

        async function loadPageAndTypeDesiredKeywords() {

            // Step 1: Go to Keyword Planner
            await googleAddsPage.goto('https://ads.google.com/aw/keywordplanner/home', { waitUntil: 'networkidle2' });

            // Step 2: Click "Discover new keywords"
            await googleAddsPage.waitForSelector('[aria-label="Discover new keywords"][role="button"]', { visible: true });
            await googleAddsPage.click('[aria-label="Discover new keywords"][role="button"]');

            // Step 3: Type keywords
            await googleAddsPage.waitForSelector('input.search-input[aria-label="Search input"]', { visible: true });

            await paste(desiredKeywords);

            await wait(1000);
            // Step 4: Click "Get results"
            await googleAddsPage.waitForSelector('material-button.submit-button[role="button"] div.content', { visible: true });
            await googleAddsPage.click('material-button.submit-button[role="button"] div.content');

            await wait(2000);
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

            // Step 2: Add "Exclude keywords in my plan"
            await googleAddsPage.waitForSelector('material-button.add-filter-btn', { visible: true });
            await googleAddsPage.click('material-button.add-filter-btn');
            console.log('🎯 Clicked "Add filter" button');

            // Step 2.1: Wait for the popup search box and type the filter
            await googleAddsPage.waitForSelector('.popup-search-box', { visible: true });
            await googleAddsPage.click('.popup-search-box');

            await paste('Exclude keywords in my plan');
            console.log('🔍 Typed filter name');

            await googleAddsPage.waitForSelector('material-select-item[aria-label="Exclude keywords in my plan"]', { visible: true });
            await googleAddsPage.click('material-select-item[aria-label="Exclude keywords in my plan"]');
            console.log('✅ Clicked filter: Exclude keywords in my plan');

            // Step 2.2: add the keywords to exclude
            // Step 2.3: open the menu
            await googleAddsPage.waitForSelector('input.search-box[placeholder="Add filter"]', { visible: true });
            await googleAddsPage.click('.nav-wrapper');
            await wait(1000);

           await excludeKeywords(undesiredKeywords);
        }

        async function excludeKeywords(keywords) {
            await googleAddsPage.waitForSelector('material-button.add-filter-btn', { visible: true });
            await googleAddsPage.click('material-button.add-filter-btn');
            console.log('🎯 Clicked "Add filter" button');

            await googleAddsPage.type('.popup-search-box', 'Keyword', { delay: 30 });
            await wait(1000);
            await googleAddsPage.waitForSelector('material-select-item[aria-label*="Keyword"]', { visible: true });
            await googleAddsPage.click('material-select-item[aria-label*="Keyword"]');
            await googleAddsPage.click('div[role="button"][aria-label*="Select operator"]');
            await googleAddsPage.waitForSelector('material-select-dropdown-item .label', { visible: true });

            // Step 2.5 Get all visible options and click the "does not contain" option
            const options = await googleAddsPage.$$('material-select-dropdown-item .label');

            for (const option of options) {
                const text = await googleAddsPage.evaluate(el => el.textContent.trim(), option);
                if (text === 'does not contain') {
                    await option.click();
                    break;
                }
            }

            // Wait for the textarea input to appear
            await googleAddsPage.waitForSelector('textarea[aria-label="Value"]', { visible: true });

            // Type word
            await wait(1000);
            await googleAddsPage.click('textarea[aria-label="Value"]');
            await paste(keywords);
            await wait(1000);
            // Click the Apply button
            await googleAddsPage.click('material-button[aria-label="Apply"]');

            await googleAddsPage.click('.nav-wrapper');
            await wait(1000);
        }

        async function unselectBrands() {
            await googleAddsPage.waitForSelector('.expand-all', { visible: true });
            await googleAddsPage.click('.expand-all');
            console.log('🧭 Expand all clicked');

            await wait(1000);

            // Step 2: Uncheck "Company", "Retailer", "Other Brands" checkboxes
            const labels = ['Company', 'Retailer', 'Other Brands', 'Electronics Brand'];

            for (const label of labels) {
                const checkbox = await googleAddsPage.evaluateHandle((labelText) => {
                    const headers = Array.from(document.querySelectorAll('.particle-table-header'));
                    for (const header of headers) {
                        const labelNode = header.querySelector('.particle-header-title');
                        if (labelNode?.innerText.trim() === labelText) {
                            return header.querySelector('mat-checkbox');
                        }
                    }
                    return null;
                }, label);

                if (checkbox) {
                    const isChecked = await checkbox?.evaluate(el => el?.getAttribute('aria-checked') === 'true');
                    if (isChecked) {
                        console.log(`🔧 Unchecking "${label}"`);
                        await checkbox.click();
                        await wait(300);
                    }
                }
            }
        }

        async function downloadKeywords() {
            const downloadButtons = await googleAddsPage.$$('material-button');
            let clicked = false;

            for (const button of downloadButtons) {
                const text = await googleAddsPage.evaluate(el => el.innerText.trim(), button);
                if (text.includes('Download keyword ideas')) {
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
            return lines.slice(1).map(line => {
                const values = line.trim().split('\t');
                return headers.reduce((obj, key, i) => {
                    obj[key] = values[i];
                    return obj;
                }, {});
            });
        }

        async function manageBrandKeywords(csv) {
            let keywords = csv.map(item => item.Keyword);

            let brands = [];

            for (let keyword of keywords) {
                usedKeywords.push(...keyword);

                let answer = findDataCompanyByName(keyword);

                answer = answer.replace(/```/g, '').replace(/json/gi, '');

                if (answer && !brands.includes(keyword)) {
                    brands.push(keyword);
                    console.log(`✅ Found brand: ${keyword}`);
                }

                if (brands.length > 100) {
                    console.log(`------------------------------------------------------------------------------`);
                    console.log(`------------------------------------------------------------------------------`);
                    console.log(`------------------------------------------------------------------------------`);
                    await excludeKeywords(brands.join(', '));
                }
            }
        }

        async function paste(textToPaste) {
            await googleAddsPage.evaluate((text) => {
                navigator.clipboard.writeText(text);
            }, textToPaste);

            await wait(1000);

            await googleAddsPage.keyboard.down('Control');
            await googleAddsPage.keyboard.press('KeyV');
            await googleAddsPage.keyboard.up('Control');
        }
    }
}
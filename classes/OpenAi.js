const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function paste(page, textToPaste) {
    await page.evaluate((text) => {
        navigator.clipboard.writeText(text);
    }, textToPaste);

    await new Promise(resolve => setTimeout(resolve, 1500));

    await page.keyboard.down('Control');
    await page.keyboard.press('KeyV');
    await page.keyboard.up('Control');
}

const askGpt = async (gptExpertise, prompt, model = "gpt-3.5-turbo") => {
    try {
        const response = await openai.chat.completions.create({
            model: model, // Use "gpt-3.5-turbo" if "gpt-4" is not available
            messages: [
                { role: "system", content: gptExpertise || info },
                { role: "user", content: prompt },
            ],
            temperature: 0.1,
            max_tokens: 4096
        });

        // console.log(response.choices[0].message.content);
        return response.choices[0].message.content; // Return the response
    } catch (error) {
        console.error("Error with GPT API:", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch response from OpenAI API.");
    }
}

const askGptCustom = async (page, message) => {
    await page.goto('https://chatgpt.com/g/g-6801aa0a33688191880cb45a036ef02c-extract-brands');

    await page.waitForSelector('textarea');

    await paste(page, message);
    await page.keyboard.press('Enter');

    await page.waitForSelector('.markdown.prose', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    return getResults();

    async function getResults() {
        let results = await page.evaluate(() => {
            const elements = document.querySelectorAll('.markdown.prose');
            console.log(elements);
            return Array.from(elements).map(el => el.innerText);
        });
        await new Promise(resolve => setTimeout(resolve, 500));

        if (results.length && (results[0].includes('json') || results[0] === '[]' || results[0] === '')) {
            await askGptCustom(page, message);
        }

        if (results.length && results[0][results[0].length - 1] === ']') {
            return results[0];
        } else if (results.length && results[0][results[0].length - 1] === '"' && results[0][results[0].length - 2] === ']') {
            return results[0].slice(1, -1);

        } else if (!results.length) {
            debugger
        }

        return getResults();
    }
}

module.exports = {
    askGpt,
    askGptCustom
};

let info = `
I want you to act as a smart brand extractor from a list of keywords.
Your task is to identify and extract only brand names that appear within the list, including variations. Follow these instructions precisely to ensure accuracy:

1. Brand Identification
Analyze each keyword in the list and detect whether it contains a word that appears to be a brand name.

If a brand has a variation (such as a number, model, or suffix attached directly to the brand), treat it as a separate brand.

if you find an example that is like "bambu lab x1c" is obvios that the brand is "bambu lab" keep the "bambu lab x1c" but also add "bambu lab"
Examples:
From "creality 3s1 pro", extract Creality
also if you find a brand variant keep it but add the brand, ie: from "nissan 2000" add nissan to the list

2. Filter Out Common Words
Do not include any word that is a real object, animal, place, or common English word, even if it might also be a brand.
Examples of words you must ignore as brands:
Apple (fruit), Home, Dog, Car, Filament, Printer, Light, Box

If a brand name matches a real-world noun or overly generic word, do not include it — even if it's a known brand.

3. Output Format
Return the results ready to be parsed in a json object, the output is mandatory to be like this
"["brand1", "brand2", "brand3"]"

never give the output in code block or syntax-highlighted code block, always as a string ready to be parsed
Do not repeat brands.

DO NOT INCLUDE EXPLANATIONS OR EXTRA TEXTS OR NOTES OR OBSERVATION — just the final list of brand names.
`
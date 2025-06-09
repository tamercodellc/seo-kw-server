const ollamaServerUrl = 'http://localhost:11434/api/generate';

const context = {};
async function* getAnswer(message, model= 'llama3.1:latest') {
    try {
        const response = await fetch(ollamaServerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: message,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch response from Ollama server.');
        }

        const reader = response.body.getReader();
        let decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (let line of lines) {
                if (line.trim() !== '') {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            yield parsed.response;
                        }
                    } catch (error) {
                        // console.error('Error parsing JSON:', error);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error", error.message);
    }
}

const buildPrompt = (message, info, userId) => {
    if (!context[userId]) {
        context[userId] = {
            context: info,
            userPrompt: message,
        };
    }

    let response = `Context: ${info }`;

    if (context[userId]?.previousPrompt?.length) {
        for (const prompt of context[userId].previousPrompt) {
            response += `User Previous Prompt: ${prompt.prompt}\n Answer: ${prompt.answer}\n`;
        }
    }

    response += `\nUser Prompt: ${message}`;

    return response;

}
module.exports = {
    async askOllama(message, model) {

        let fulResponse = "";
        for await (const responsePart of getAnswer(message, model)) {
            // console.log(responsePart);
            fulResponse += responsePart;
        }

        return fulResponse;
    },
}
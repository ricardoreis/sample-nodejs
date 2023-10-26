import OpenAI from 'openai';

const OPENAI_API_KEY = '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';
const openai = new OpenAI(OPENAI_API_KEY);

async function getChatCompletion(prompt) {
    try {
        const completion = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7,
            n: 1,
            stop: '\n'
        });
        return completion.choices[0].text.trim();
    } catch (error) {
        console.error(error);
    }
}

async function main() {
    const prompt = 'Say this is a test.';
    const completion = await getChatCompletion(prompt);
    console.log(completion);
}

main();

import { ChatGPTAPI } from 'chatgpt';
import { customFetch } from './customFetch';

const chatGPTInstances = new Map();

async function getChatGPTInstance(from, to) {
    const instanceKey = `${from}-${to}`;
    if (chatGPTInstances.has(instanceKey)) {
        return chatGPTInstances.get(instanceKey);
    }

    const systemMessage = `I want you to act as a translator between ${from} and ${to} languages, detect the language, translate it and answer in the corrected and improved version of my text, in ${to}. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level ${to} words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations.`;

    const api = new ChatGPTAPI({
        apiKey: process.env.CHATGPT_API_KEY,
        completionParams: {
            model: 'gpt-3.5-turbo',
            temperature: 0.5,
            top_p: 0.8
        },
        systemMessage,
        fetch: customFetch
    });

    chatGPTInstances.set(instanceKey, api);
    return api;
}

export async function chatgptTranslate(input: { text: string; from?: string; to?: string }) {
    const from = input.from || 'English';
    const to = input.to || 'Simplified Chinese';
    const api = await getChatGPTInstance(from, to);

    // send a message and wait for the response
    let res = await api.sendMessage(`My sentence is "${input.text}"`)
    // console.log(res.text);
    return res.text;
}


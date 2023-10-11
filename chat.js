// file: chat.js
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { sendChunkContent, send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js';
import { insertEvent } from './db.js';
import { chatTemplates } from './messages.js';
import { promptTemplates } from './prompts.js';
import Queue from './queue.js';
import listenAudio from './listenAudio.js';
import { searchGoogle } from "./serpAPI.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL_NAME = 'gpt-4';
const UPSALE_LINK_DELAY = 10000;
const REPLYING_SOON_DELAY = 15000;
const SHARK_APP_URL = 'https://shark-app-bjcoo.ondigitalocean.app/admin/id/';
const HISTORY_CHAR_LIMIT = 20000;
const MAX_CHARACTER_LIMIT = 14000;


const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

let respondingTo = [];
let queue = new Queue();

function removeFromResponding(contact) {
    const index = respondingTo.indexOf(contact);
    if (index > -1) {
        respondingTo.splice(index, 1);
    }
}

function suggestUpsell(eventData) {
    send(eventData, chatTemplates.premiumUpsellMessage);
    insertEvent(eventData);
    setTimeout(() => send(eventData, chatTemplates.premiumUpsellLink), UPSALE_LINK_DELAY);
    setTimeout(() => send(eventData, chatTemplates.dontWorryReplyingSoon), REPLYING_SOON_DELAY);
}

function extractNameFromEventData(eventData) {
    const formattedShortName = eventData.data.chat.contact.formattedShortName;
    const shortName = eventData.data.chat.contact.shortName;

    if (formattedShortName) {
        return `O nome da pessoa que está falando com você é ${formattedShortName}.`;
    } else if (shortName) {
        return `O nome da pessoa que está falando com você é ${shortName}.`;
    }
    return '';
}

async function handleAudioContent(eventData) {
    const content = await listenAudio(eventData);
    return `O usuário enviou um arquivo de áudio. Whisper transcreveu e a seguir está a transcrição: ${content}`;
}

function createMessages(name, url, historyMessages) {
    const promptContent = promptTemplates.default(name, url);
    const messages = [
        {
            role: 'system',
            content: promptContent,
        },
        ...historyMessages
    ];
    return messages;
}

function trimHistory(history) {
    // Calcula o total de caracteres no array de history
    let charCount = history.reduce((sum, message) => sum + JSON.stringify(message).length, 0);
    // Enquanto o total de caracteres for maior que HISTORY_CHAR_LIMIT, remove a mensagem mais antiga
    while (charCount > HISTORY_CHAR_LIMIT && history.length) {
        const removedMessage = history.shift(); // Remove e retorna a primeira mensagem
        charCount -= JSON.stringify(removedMessage).length; // Subtrai o tamanho da mensagem removida do total
    }
    return history;
}

function createEventData(eventData, type, content) {
    eventData.data.body = content;
    eventData.data.type = type;
    if (!eventData.produtivi) {
        eventData.produtivi = {};
    }
    // Adicionando o atributo 'role' com o valor 'system' ao objeto 'produtivi'
    eventData.produtivi.role = 'system';
    return eventData;
}

const processResults = (results, eventData) => {
    let content = `Lista de resultados de busca:\n${JSON.stringify(results, null, 2)}`;
    let newEventData = createEventData(eventData, 'text', content);
    main(newEventData, false);
}

function handleContent(eventData) {
    const contact = getContact(eventData);
    let type = eventData.data.type;
    let content = eventData.data.body;
    if (type == "text" && content.length > MAX_CHARACTER_LIMIT) {
        if (eventData.produtivi.role == 'user') {
            contact.addToHistory("system", chatTemplates.truncatedMessage.user(MAX_CHARACTER_LIMIT));
        }
        if (eventData.produtivi.role == 'system') {
            contact.addToHistory("system", chatTemplates.truncatedMessage.system(MAX_CHARACTER_LIMIT));
        }
        return content.substring(0, MAX_CHARACTER_LIMIT);
    }
    return content;
}

// Recebe mensgem de usuário, cria o array messagens com o prompt, hitorico e ultima mensagem
async function createResponse(eventData, quote) {
    const contact = getContact(eventData);
    const reactionSettings = contact.getSendReaction();
    let role = 'user'; // ou "assistant" ou "system", dependendo da fonte
    // let content = eventData.data.body; // entrada dinâmica
    let content = handleContent(eventData);
    const type = eventData.data.type;

    if (type == 'audio') {
        role = 'system';
        content = await handleAudioContent(eventData);
    }

    if (eventData.produtivi && eventData.produtivi.role === 'system') {
        // Faça algo se 'eventData.produtivi.role' existir e seu valor for 'system'
        role = 'system';
    }

    contact.addToHistory(role, content);
    let history = trimHistory(contact.history);
    history = trimHistory(history);
    const name = extractNameFromEventData(eventData);

    let id = contact.id;
    const url = `${SHARK_APP_URL}${id}`;
    const messages = createMessages(name, url, history);
    console.log(`arquivo chat.js messages:\n ${JSON.stringify(messages, null, 2)}`);
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            stream: true,
        });
        let response = '';
        let accumulatedContent = '';
        let intro = false;
        let longAnswer = false;
        let firstSentence = true;
        let startGoogle = false;
        let searchTerm = '';
        if (reactionSettings) {
            sendReaction(eventData, '💬');
            // setTimeout(() => sendReaction(eventData, '💬'), 3000);
        }
        for await (const chunk of completion) {
            console.log(chunk.choices[0].delta);
            // Verifique se chunk.choices[0].delta.content possui conteúdo
            if (chunk.choices[0].delta.content) {
                accumulatedContent += chunk.choices[0].delta.content;
                response += chunk.choices[0].delta.content;
                if (startGoogle) {
                    searchTerm += chunk.choices[0].delta.content;
                }
                if (cancel && eventData.produtivi && eventData.produtivi.role !== 'system') {
                    cancel = false;
                    console.log('cancelando...');
                    if (reactionSettings) {
                        sendReaction(eventData, '-');
                    }
                    return;
                }
                // Se a possuir uma introdução
                if (accumulatedContent.includes('INTROSTART')) {
                    if (contact.getInteractionCount() < 0) {
                        suggestUpsell(eventData);
                        // Removendo da lista de resposta
                        removeFromResponding(contact);
                        return;
                    }
                    // console.log("Texto da introducao");
                    intro = true;
                    accumulatedContent = accumulatedContent.replace(
                        'INTROSTART',
                        ''
                    );
                }

                //STARTGOOGLE
                if (accumulatedContent.includes('STARTGOOGLE')) {
                    startGoogle = true;
                    accumulatedContent = accumulatedContent.replace(
                        'STARTGOOGLE',
                        '*Buscando:*'
                    );
                }
                if (accumulatedContent.endsWith('INTROEND')) {
                    accumulatedContent = accumulatedContent.replace(
                        'INTROEND',
                        ''
                    );
                    // console.log("FIM a introdução");
                    sendChunkContent(eventData, accumulatedContent, quote);
                    accumulatedContent = '';
                    intro = false;
                    longAnswer = true;
                    contact.decrementInteraction();
                    // console.log("Quantidade de interações após decrementar:", contact.getInteractionCount());
                }
                if (accumulatedContent.endsWith('ENDGOOGLE')) {
                    startGoogle = false;
                    accumulatedContent = accumulatedContent.replace(
                        'ENDGOOGLE',
                        '\nAguarde...'
                    );
                    searchTerm = searchTerm.replace(
                        'ENDGOOGLE',
                        ''
                    );
                    // console.log(`Estou pesquisando por: ${searchTerm}`);
                    // listaDeResultados = buscarNoGoogle(searchTerm);
                    // let eventDataListadeResultados = criarEventData(eventData, type, content);
                    // createResponse(eventData, quote);

                    searchGoogle(searchTerm)
                        .then((results) => {
                            processResults(results, eventData);

                        })
                        .catch((error) => {
                            console.error("Erro ao buscar os resultados:", error);
                            let errorResult = `Infelizmente, não consegui ler o resultado da busca devido a um erro interno no meu sistema. Vou avisar a minha equipe técnica para corrigir essa falha. Agradeço sua compreensão.\n
                        Mas tente acessar esse link, provavelmente aqui tem o que você precisa: https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
                            processResults(errorResult, eventData);
                        });


                }
                if (
                    !longAnswer &&
                    firstSentence &&
                    accumulatedContent.match(/[a-z]\.[ \n]/g)
                ) {
                    // match(/[a-zA-Z]\.(?![0-9])/)
                    // Isso funcionou: [a-z]\.[ \n]
                    // Outra opção     [a-z]\.\s|\.\n
                    firstSentence = false;
                    let str = accumulatedContent;
                    let lastIndex = str.lastIndexOf('.');
                    let primeiraParte = str.substring(0, lastIndex + 1); // A substring começa no início da string e vai até o último ponto encontrado (incluindo o ponto)
                    let segundaParte = str.substring(lastIndex + 1); // A substring começa após o último ponto encontrado e vai até o final da string
                    sendChunkContent(eventData, primeiraParte, quote);
                    accumulatedContent = '';
                    accumulatedContent += segundaParte;
                }
            }
        }
        // Após processar todos os chunks, enviar o conteúdo restante (que seria após INTROEND para mensagens complexas)
        if (accumulatedContent) {
            sendChunkContent(eventData, accumulatedContent, quote);
            accumulatedContent = '';
        }
        // Decrementando a quantidade de interações
        contact.addToHistory('assistant', response);
        if (reactionSettings) {
            // sendReaction(eventData, '-');
            setTimeout(() => sendReaction(eventData, '-'), 5000);
        }
    } catch (error) {
        console.error('Ocorreu um erro ao buscar a resposta:', error.message);
        console.error('Código do erro:', error.code);
        if (error.code == 'context_length_exceeded') {
            send(
                eventData,
                'A mensagem que você enviou é extensa demais, infelizmente não consigo ler e processar textos grandes. Por favor, reduza o tamanho do texto e me envie novamente.'
            );
        }
    }
}
// Fim createResponse()

function getContact(eventData) {
    const fromNumber = eventData.data.fromNumber;
    let contact = dataStore.findContactByPhone(fromNumber);
    if (!contact) {
        contact = dataStore.addNewContact(fromNumber);
    }
    return contact;
}

function isReplyingToThisContact(contact) {
    if (respondingTo.indexOf(contact) === -1) {
        respondingTo.push(contact);
        return false;
    }
    return true;
}

let cancel = false;

async function main(eventData, quote) {
    console.log('\nMensagem recebida:', eventData.data.body);
    const contact = getContact(eventData);
    const replyingToThisContact = isReplyingToThisContact(contact);
    if (replyingToThisContact) {
        const previousMessage = { timestamp: contact.lastMessage.timestamp };
        const currentMessage = { timestamp: new Date().toISOString() };
        const previousDate = new Date(previousMessage.timestamp);
        const currentDate = new Date(currentMessage.timestamp);
        const differenceInMillis = currentDate - previousDate;

        if (differenceInMillis < 10 * 1000) {
            cancel = true;
            await createResponse(eventData, quote);
        } else {
            queue.enqueue(eventData);
        }
    } else {
        contact.setLastMessage(eventData);
        await createResponse(eventData, quote);
        removeFromResponding(contact);
        if (queue.length() > 0) {
            main(queue.peek(), true);
            queue.dequeue();
        }
    }
}

export default main; 
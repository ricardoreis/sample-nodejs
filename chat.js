// file: chat.js

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { sendChunkContent, send, sendReaction } from './wzapchat.js';
import { insertEvent, selectContact, insertContact } from './db.js';
import { chatTemplates } from './messages.js';
import { promptTemplates } from './prompts.js';
import Queue from './queue.js';
import listenAudio from './listenAudio.js';
import { searchGoogle } from "./serpAPI.js";
import { getContact } from './contactUtils.js';
import * as Config from './config.js';
import { eliminateSubstring } from './utils.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let respondingTo = [];
let queue = new Queue();
let cancel = false;

function isReplyingToThisContact(contact) {
    if (respondingTo.indexOf(contact) === -1) {
        respondingTo.push(contact);
        return false;
    }
    return true;
}

function removeFromResponding(contact) {
    const index = respondingTo.indexOf(contact);
    if (index > -1) {
        respondingTo.splice(index, 1);
    }
}

function suggestUpsell(eventData) {
    sendReaction(eventData, '💬');
    send(eventData, chatTemplates.endFreeMessages)
    setTimeout(() => send(eventData, chatTemplates.premiumUpsellLink), Config.UPSALE_LINK_DELAY);
    setTimeout(() => send(eventData, chatTemplates.callToAction), Config.REPLYING_SOON_DELAY);
    setTimeout(() => sendReaction(eventData, '-'), Config.REPLYING_SOON_DELAY);

    // setTimeout(() => send(eventData, chatTemplates.dontWorryReplyingSoon), Config.REPLYING_SOON_DELAY);
}

function createMessages(eventData, contact, historyMessages) {
    const promptContent = promptTemplates.default(eventData, contact);
    // const promptContent = promptTemplates.simple;
    const messages = [
        {
            role: 'system',
            content: promptContent,
        },
        ...historyMessages
    ];
    return messages;
}

// function trimHistory(history) {
//     // Calcula o total de caracteres no array de history
//     let charCount = history.reduce((sum, message) => sum + JSON.stringify(message).length, 0);
//     // Enquanto o total de caracteres for maior que HISTORY_CHAR_LIMIT, remove a mensagem mais antiga
//     while (charCount > Config.HISTORY_CHAR_LIMIT && history.length) {
//         const removedMessage = history.shift(); // Remove e retorna a primeira mensagem
//         charCount -= JSON.stringify(removedMessage).length; // Subtrai o tamanho da mensagem removida do total
//     }
//     return history;
// }

function trimHistory(history) {
    // Verifica se 'history' é uma array
    if (!Array.isArray(history)) {
        console.error('Invalid type: history is not an array.');
        return null; // ou você pode optar por retornar 'history' sem modificação, se preferir
    }
    // Verifica se 'Config' e 'HISTORY_CHAR_LIMIT' estão definidos
    if (typeof Config === 'undefined' || !Config.HISTORY_CHAR_LIMIT) {
        console.error('Config object or HISTORY_CHAR_LIMIT is not defined.');
        return null; // ou você pode lidar com esse caso de forma diferente, conforme necessário
    }
    console.log('Starting with history length:', history.length); // para depuração\
    // Calcula o total de caracteres no array de history
    let charCount = history.reduce((sum, message) => {
        if (typeof message !== 'object' || message === null) {
            console.warn('Unexpected type in history array, message skipped:', message);
            return sum; // não adiciona ao contador se não for um objeto
        }
        const messageLength = JSON.stringify(message).length;
        return sum + messageLength;
    }, 0);
    console.log('Initial character count:', charCount);
    // Enquanto o total de caracteres for maior que HISTORY_CHAR_LIMIT, remove a mensagem mais antiga
    while (charCount > Config.HISTORY_CHAR_LIMIT && history.length) {
        const removedMessage = history.shift(); // Remove e retorna a primeira mensagem
        if (typeof removedMessage === 'object' && removedMessage !== null) {
            charCount -= JSON.stringify(removedMessage).length; // Subtrai o tamanho da mensagem removida do total
        } else {
            console.warn('Removed an unexpected type:', removedMessage);
        }
        console.log('Removed one item from history. New length:', history.length); // para depuração
    }
    console.log('Final character count:', charCount);
    console.log('Trimming complete. Final history length:', history.length);
    return history; // Retorna o array modificado (ou não modificado, se já estava dentro do limite)
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

const processResults = (searchTerm, results, eventData) => {
    let content = `Lista de resultados de busca para a seguinte query "${searchTerm}":\n${JSON.stringify(results)}`;
    let newEventData = createEventData(eventData, 'text', content);
    main(newEventData, false);
}

// function handleContent(eventData) {
//     const contact = getContact(eventData);
//     let type = eventData.data.type;
//     let content = eventData.data.body;
//     if (type == "text" && content.length > Config.MAX_CHARACTER_LIMIT) {
//         if (eventData.produtivi.role == 'user') {
//             contact.addToHistory("system", chatTemplates.truncatedMessage.user(Config.MAX_CHARACTER_LIMIT));
//         }
//         if (eventData.produtivi.role == 'system') {
//             contact.addToHistory("system", chatTemplates.truncatedMessage.system(Config.MAX_CHARACTER_LIMIT));
//         }
//         return content.substring(0, Config.MAX_CHARACTER_LIMIT);
//     }
//     return content;
// }

function handleContent(eventData) {
    // Verificação da existência de 'eventData' e suas propriedades necessárias
    if (!eventData || !eventData.data) {
        console.error('!eventData || !eventData.data: Dados do evento inválidos ou inexistentes.');
        return null; // ou lançar um erro, dependendo de como você deseja lidar com isso
    }

    // Supondo que getContact seja importado ou disponível no escopo global.
    // Adicione verificações de erro se necessário, dependendo de como getContact funciona.
    const contact = getContact(eventData);

    const type = eventData.data.type;
    const content = eventData.data.body;



    // Verificação de 'type' e 'content'
    if (type === "text" && typeof content === "string") {
        if (content.includes("Dfg9878")) {
            send(eventData, "Ok! nossa equipe já está verificando as informações de pagamento e em breve você terá acesso ao serviço. Por favor, aguarde um momento. Agradecemos pela sua paciência!")
            eventData.data.fromNumber = "+555198669809";
            send(eventData, "Alguém pagou!");
            return;
        }
        if (content.length > Config.MAX_CHARACTER_LIMIT) {
            const rolePath = eventData.produtivi; // Possível necessidade de alterar 'produtivi' se for um erro de digitação

            if (!rolePath || !['user', 'system'].includes(rolePath.role)) {
                console.error('Role inválida ou inexistente.');
                return null; // ou lançar um erro
            }

            if (rolePath.role === 'user') {
                contact.addToHistory("system", chatTemplates.truncatedMessage.user(Config.MAX_CHARACTER_LIMIT));
            } else if (rolePath.role === 'system') {
                // contact.addToHistory("system", chatTemplates.truncatedMessage.system(Config.MAX_CHARACTER_LIMIT));
            }

            // Retorna a mensagem truncada
            return content.substring(0, Config.MAX_CHARACTER_LIMIT);
        } else {
            // Acontece quando o conteúdo é um texto, mas não excede o limite de caracteres
            console.info('O conteúdo original foi mantido (não excede o limite de caracteres).');
            return content;
        }
    } else {
        // Acontece quando 'type' não é "text" ou 'content' não é uma string
        console.warn('Tipo de conteúdo não é texto ou conteúdo não é uma string.');
        return content; // ou lidar de maneira diferente, dependendo dos requisitos
    }
}


async function createResponse(eventData, quote) {
    const contact = getContact(eventData);
    const reactionSettings = contact.getSendReaction();
    let role = 'user'; // ou "assistant" ou "system", dependendo da fonte
    let content = handleContent(eventData);
    if (!content) {
        return;
    }
    const type = eventData.data.type;
    if (type == 'audio') {
        role = 'system';
        content = await listenAudio(eventData);
    }
    if (eventData.produtivi && eventData.produtivi.role === 'system') {
        role = 'system';
    }
    contact.addToHistory(role, content);
    let history = trimHistory(contact.history);
    const messages = createMessages(eventData, contact, history);
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
                if (accumulatedContent.includes('INTROSTART')) {
                    intro = true;
                    accumulatedContent = accumulatedContent.replace(
                        'INTROSTART',
                        ''
                    );
                }

                if (accumulatedContent.endsWith('INTROEND')) {
                    accumulatedContent = accumulatedContent.replace(
                        'INTROEND',
                        ''
                    );
                    sendChunkContent(eventData, accumulatedContent, quote);
                    accumulatedContent = '';
                    intro = false;
                    longAnswer = true;
                }
                if (accumulatedContent.includes('STARTGOOGLE')) {
                    startGoogle = true;
                }
                if (accumulatedContent.endsWith('ENDGOOGLE')) {
                    startGoogle = false;
                    // Eliminar da a substring "STARTGOOGLE {termo de busca} ENDGOOGLE"
                    accumulatedContent = eliminateSubstring(accumulatedContent, "STARTGOOGLE", "ENDGOOGLE");
                    searchTerm = searchTerm.replace(
                        'ENDGOOGLE',
                        ''
                    );
                    searchGoogle(searchTerm)
                        .then((results) => {
                            processResults(searchTerm, results, eventData);

                        })
                        .catch((error) => {
                            console.error("Erro ao buscar os resultados:", error);
                            let errorResult = `Infelizmente, não consegui ler o resultado da busca devido a um erro interno no meu sistema. Vou avisar a minha equipe técnica para corrigir essa falha. Agradeço sua compreensão.\n
                        Mas tente acessar esse link, provavelmente aqui tem o que você precisa: https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
                            processResults(searchTerm, errorResult, eventData);
                        });
                }
                if (
                    !longAnswer &&
                    firstSentence &&
                    accumulatedContent.match(/[a-z]\.[ \n]/g)
                ) {
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
        // Salvar o contato no Banco de Dados ou recuperar o dados

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

async function main(eventData, quote) {
    // console.log('\nMensagem recebida:', eventData.data.body);
    const contact = getContact(eventData);
    // Verificação de Interações e Sugestão de Upgrade para Contatos com Plano Gratuito
    if (contact.getSubscriptionPlan() == "free" && contact.getInteractionCount() == 0) {
        suggestUpsell(eventData);
        removeFromResponding(contact);
        return;
    }
    const replyingToThisContact = isReplyingToThisContact(contact);
    if (replyingToThisContact) {
        const previousMessage = { timestamp: contact.lastMessage.timestamp };
        const currentMessage = { timestamp: new Date().toISOString() };
        const previousDate = new Date(previousMessage.timestamp);
        const currentDate = new Date(currentMessage.timestamp);
        const differenceInMillis = currentDate - previousDate;

        if (differenceInMillis < 1 * 1000) {
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
        // FIM DA RESPOSTA
        contact.decrementInteraction();
        // Insere o contato no banco caso ainda nao existir
        // console.log(`isStoredInDatabase: ${contact.isStoredInDatabase}`);
        // console.log(`1 - console dir contact: `);
        // console.dir(contact);
        // console.log(`1 FIM - console dir contact: `);
        if (!contact.isStoredInDatabase) {
            contact.isStoredInDatabase = true;
            const existingContact = await selectContact(contact.phone);
            if (!existingContact) {
                // If the contact does not exist, insert it
                await insertContact(contact);
                // console.log(`contato inserido no banco`);
            } else {
                // console.log(`o contato ja está no banco, pegar informaçoes`);
                contact.sendReaction = existingContact.sendReaction == 1 ? true : false;
                contact.subscriptionPlan = existingContact.subscriptionPlan;
                contact.interactionCount = existingContact.interactionCount;
            }

        }
    }
}

export default main; 
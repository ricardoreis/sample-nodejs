// chat.js
// This code is for v4 of the openai package: npmjs.com/package/openai
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { sendChunkContent, send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js';
import { insertEvent } from './db.js';
import { chatTemplates } from './messages.js';
import { promptTemplates } from './prompts.js';
import Queue from './queue.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let respondingTo = [];

let queue = new Queue();

function removeFromResponding(contact) {
    let index = respondingTo.indexOf(contact);
    if (index > -1) {
        respondingTo.splice(index, 1);
        console.log(
            'removeFromResponding() Número removido do array: ' + contact
        );
    }
}

function suggestUpsell(eventData) {
    // Enviando mensagens
    send(eventData, chatTemplates.premiumUpsellMessage);
    insertEvent(eventData);
    setTimeout(() => {
        send(eventData, chatTemplates.premiumUpsellLink);
    }, 10000);
    setTimeout(() => {
        send(eventData, chatTemplates.dontWorryReplyingSoon);
    }, 15000);
}

function createMessages(name, url, historyMessages) {
    // Primeira parte: prompt
    let promptContent = promptTemplates.defaut(name, url);
    let messages = [
        {
            role: 'system',
            content: promptContent,
        },
    ];
    // Segunda parte: history
    messages = messages.concat(historyMessages);
    // // Terceira parte: lastMessage
    // messages.push({
    //     role: 'user',
    //     content: lastMessageContent,
    // });
    return messages;
}

function trimHistory(history) {
    // Calcula o total de caracteres no array de history
    let charCount = history.reduce(
        (sum, message) => sum + JSON.stringify(message).length,
        0
    );
    // Enquanto o total de caracteres for maior que 1000, remove a mensagem mais antiga
    while (charCount > 20000 && history.length) {
        const removedMessage = history.shift(); // Remove e retorna a primeira mensagem
        charCount -= JSON.stringify(removedMessage).length; // Subtrai o tamanho da mensagem removida do total
    }
    return history;
}

// Recebe mensgem de usuário, cria o array messagens com o prompt, hitorico e ultima mensagem
async function createResponse(eventData, quote) {
    let contact = getContact(eventData);
    let reactionSettings = contact.getSendReaction();
    let role = 'user'; // ou "assistant" ou "system", dependendo da fonte
    let content = eventData.data.body; // entrada dinâmica
    contact.addToHistory(role, content);
    let history = contact.history;
    history = trimHistory(history);
    let name = 'Caso você não souber o nome do usuário, você pode perguntar.';
    let id = contact.id;
    let url = `https://shark-app-bjcoo.ondigitalocean.app/admin/id/${id}`;
    let messages = createMessages(name, url, history);
    console.log(messages);
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
        if (reactionSettings){
            sendReaction(eventData, '💬');
            // setTimeout(() => sendReaction(eventData, '💬'), 3000);
        }
        for await (const chunk of completion) {
            console.log(chunk.choices[0].delta);
            // Verifique se chunk.choices[0].delta.content possui conteúdo
            if (chunk.choices[0].delta.content) {
                accumulatedContent += chunk.choices[0].delta.content;
                response += chunk.choices[0].delta.content;
                if (cancel) {
                    cancel = false;
                    console.log('cancelando...');
                    if (reactionSettings){
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
        if (reactionSettings){
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

// Verifica se o usuário já está em DataStore, se nao estiver acrescentar
function getContact(eventData) {
    let fromNumber = eventData.data.fromNumber;
    let contact = dataStore.findContactByPhone(fromNumber);
    if (!contact) {
        contact = dataStore.addNewContact(fromNumber);
    }
    return contact;
}

// Verifica se o modelo já está respondendo esse usuário
function isReplyingToThisContact(contact) {
    if (respondingTo.indexOf(contact) === -1) {
        respondingTo.push(contact);
        return false;
    } else {
        return true;
    }
}

let cancel = false;
async function main(eventData, quote) {
    // send(eventData, "_digitando..._")
    console.log('\nMensagem recebida:', eventData.data.body);
    let contact = getContact(eventData);
    let replyingToThisContact = isReplyingToThisContact(contact);
    if (replyingToThisContact) {
        // já está respondendo, cancelar e reformular o prompt ou colocar na fila
        console.log(
            '******* já está respondendo, cancelar e reformular o prompt ou colocar na fila *******'
        );
        let previousMessage = {
            timestamp: contact.lastMessage.timestamp,
        };
        let currentMessage = {
            timestamp: new Date().toISOString(),
        };
        // Converta as strings ISO 8601 para objetos Date
        const previousDate = new Date(previousMessage.timestamp);
        const currentDate = new Date(currentMessage.timestamp);
        // Calcule a diferença em milissegundos
        const differenceInMillis = currentDate - previousDate;
        // Verifique se a diferença é menor que 10 segundos
        if (differenceInMillis < 10 * 1000) {
            console.log(
                'A mensagem atual foi recebida menos de 10 segundos após a mensagem anterior.'
            );
            cancel = true;
            await createResponse(eventData, quote);
        } else {
            console.log(
                'A mensagem atual foi recebida 10 segundos ou mais após a mensagem anterior.\nMensagem adicionada na fila.'
            );
            queue.enqueue(eventData);
        }
    } else {
        //não está respondendo para esse contanto, entao responder
        contact.setLastMessage(eventData);
        await createResponse(eventData, quote);
        removeFromResponding(contact);
        if (queue.length() > 0) {
            console.log('A fila nao está vazia.');
            main(queue.peek(), true);
            queue.dequeue();
        } else {
            return;
        }
    }
}

export default main; // Exporta a função main

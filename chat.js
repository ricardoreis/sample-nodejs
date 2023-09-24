// chat.js
// This code is for v4 of the openai package: npmjs.com/package/openai
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";
import { sendChunkContent, send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

let prompt = `
Você é um assistente de inteligência artificial conversando com uma pessoa no aplicativo de chat WhatsApp.
 
O seu objetivo é ajudar, respondendo mensagens e perguntas em diferentes áreas de conhecimento, sempre de forma detalhada e como se você fosse um expert no assunto.
Analise se a mensagem do usuário exige uma resposta simples ou complexa, mas não inclua na sua resposta a conclusão dessa análise.

Se for uma mensagem simples, responda imediatamente de forma breve e objetiva.

Para mensagens que exigem respostas complexas, inicie com o código INTROSTART, informando que compreendeu a questão e que começará a elaborar a resposta imediatamente, pedindo ao usuário para aguardar, pois a resposta será enviada logo em seguida. Após a introdução, use o código INTROEND e, em seguida, forneça a resposta detalhada. Os códigos servem para separar a introdução da resposta principal.
`
let respondingTo = [];

function createMessages(promptContent, historyMessages, lastMessageContent) {
  // Primeira parte: prompt
  let messages = [{
      "role": "system",
      "content": promptContent
  }];
  
  // Segunda parte: history
  messages = messages.concat(historyMessages);
  
  // Terceira parte: lastMessage
  messages.push({
      "role": "user",
      "content": lastMessageContent
  });

  return messages;
}

function trimHistory(history) {
  // Calcula o total de caracteres no array de history
  let charCount = history.reduce((sum, message) => sum + JSON.stringify(message).length, 0);

  // Enquanto o total de caracteres for maior que 1000, remove a mensagem mais antiga
  while (charCount > 20000 && history.length) {
      const removedMessage = history.shift(); // Remove e retorna a primeira mensagem
      charCount -= JSON.stringify(removedMessage).length; // Subtrai o tamanho da mensagem removida do total
  }

  return history;
}
let queue = [];
async function main(eventData, quote) {
  if(eventData.data.type != "text"){
    return
  }
  // send(eventData, "_digitando..._")
  console.log('\nMensagem recebida:', eventData.data.body);
  let fromNumber = eventData.data.fromNumber; 
  if(respondingTo.indexOf(fromNumber) === -1){
    respondingTo.push(fromNumber);
    console.log("Array: " + respondingTo); 
  let contact = dataStore.findContactByPhone(fromNumber);
  if (!contact) {
      contact = dataStore.addNewContact(fromNumber);
  }
  let role = "user";  // ou "assistant" ou "system", dependendo da fonte
  let content = eventData.data.body;  // entrada dinâmica

  contact.addToHistory(role, content);
  // console.log("===== HISTORY ========");
  // console.log(contact.history);
  // console.log("===== HISTORY ========");
  let history = contact.history;
  history = trimHistory(history);
  let messages = createMessages(prompt, history, content);
  

  
    try {
          
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            stream: true,
          });

          let response = "";
          let accumulatedContent = "";
          let answer = ""
          let intro = false;
          let longAnswer = false;
          let firstSentence = true;
          // sendReaction(eventData, "💬")
          // setTimeout(() => sendReaction(eventData, "💬"), 3000);
          for await (const chunk of completion) {
            console.log(chunk.choices[0].delta);
            // Verifique se chunk.choices[0].delta.content possui conteúdo 
            if (chunk.choices[0].delta.content) {
                accumulatedContent += chunk.choices[0].delta.content;
                response += chunk.choices[0].delta.content;
                // Se a possuir uma introdução
                if (accumulatedContent.includes('INTROSTART')) {
                  console.log("Texto da introducao");
                  intro = true;
                  accumulatedContent = accumulatedContent.replace("INTROSTART","")      
                }
                if (accumulatedContent.endsWith('INTROEND')){
                  accumulatedContent = accumulatedContent.replace("INTROEND","")
                  console.log("FIM a introdução");
                  sendChunkContent(eventData, accumulatedContent, quote);
                  accumulatedContent = "";
                  intro = false;
                  longAnswer = true;  
                }
                if (!longAnswer && firstSentence && accumulatedContent.match(/[a-zA-Z]\.(?![0-9])/)) {
                  firstSentence = false;
                  sendChunkContent(eventData, accumulatedContent, quote);
                  accumulatedContent = "";
                }
                
            }
          }
          // Após processar todos os chunks, enviar o conteúdo restante (que seria após INTROEND para mensagens complexas)
          if(accumulatedContent){
            sendChunkContent(eventData, accumulatedContent, quote);
            accumulatedContent = "";
          }
          response = response.replace("INTROSTART","")
          response = response.replace("INTROEND","")
          contact.addToHistory("assistant", response);
          // sendReaction(eventData, "-")
          // setTimeout(() => sendReaction(eventData, "-"), 10000);
          let index = respondingTo.indexOf(fromNumber);
          if (index > -1) {
            respondingTo.splice(index, 1);
            console.log("Número removido do array: " + fromNumber);
            console.log("********** queue 2: "+queue);
            
          }
          if (queue.length > 0) {
            console.log("O array não está vazio.");
            for (let i = 0; i < queue.length; i++) {
              console.log(queue[i]);
              console.log("enviando mensagem que estava na fila");
              contact.addToHistory("system", "A próxima mensagem foi enviada pelo usuário enquanto esperava sua última resposta. É provável que ele a tenha enviado antes de visualizar a resposta imediatamente acima. A mensagem a seguir possivelmente tem relação com a anterior enviada pelo mesmo usuário. Se ela parecer incompleta, confira se complementa ou está vinculada à mensagem anterior dele. Responda considerando esse contexto.");
              main(queue[i], true)
              queue.shift();
            }
            // main(eventData)
          }else{
            return;
          }
          
        

    } catch (error) {
        console.error('Ocorreu um erro ao buscar a resposta:', error.message);
        console.error('Código do erro:', error.code);
        if (error.code == "context_length_exceeded"){
          send(eventData, "A mensagem que você enviou é extensa demais, infelizmente não consigo ler e processar textos grandes. Por favor, reduza o tamanho do texto e me envie novamente.");
          
        }
    }
    // Encontre e remova um fromNumber de respondingTo
    let index = respondingTo.indexOf(fromNumber);
    if (index > -1) {
      respondingTo.splice(index, 1);
      console.log("Número removido do array: " + fromNumber);
    }
  }else{
    console.log("********** Mensagem Ignorada ***********");
    console.log("********** Mensasgem: "+eventData.data.body+" ***********");
    console.log("********** Número: "+fromNumber+" ***********");
    queue.push(eventData);
    console.log("********** queue 1: "+queue);
  }
  
}

export default main; // Exporta a função main

// chat.js
// This code is for v4 of the openai package: npmjs.com/package/openai
import dotenv from 'dotenv';
import OpenAI from "openai";
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
// let queue = [];
let queue = new Queue();

function removeFromResponding(fromNumber) {
  let index = respondingTo.indexOf(fromNumber);
  if (index > -1) {
      respondingTo.splice(index, 1);
      console.log("Número removido do array: " + fromNumber);
  }
}

function suggestUpsell(eventData){
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

async function main(eventData, quote) {
  if(eventData.data.type != "text"){
    return
  }
  // send(eventData, "_digitando..._")
  console.log('\nMensagem recebida:', eventData.data.body);
  let fromNumber = eventData.data.fromNumber; 
  if(respondingTo.indexOf(fromNumber) === -1){
    respondingTo.push(fromNumber);
    console.log("Número adicionado em respondingTo: " + respondingTo); 
  let contact = dataStore.findContactByPhone(fromNumber);
  if (!contact) {
      contact = dataStore.addNewContact(fromNumber);
  }

  // WAITING TIME
  // console.log(`contact.waitingTime: ${contact.waitingTime}`);
  // if(contact.waitingTime){
  //   const timestamp = Date.now();
  //   let diffMillis = contact.waitingTime - timestamp;
  //   if(diffMillis>0){
  //     let diffMinutes = diffMillis / (1000 * 60);
  //     console.log(`O tempo de espera é de aproximadamente ${Math.round(diffMinutes)} minutos.`);
  //     console.log(`O tempo de espera é de aproximadamente ${diffMinutes} minutos.`);
  //     send(eventData, `O tempo de espera é de aproximadamente ${diffMinutes} minutos.`)
  //     removeFromResponding(fromNumber)
  //     return
  //   }
  // }
  // if (eventData.data.body=="wait"){
  //   let waitCount = contact.waitCount;
  //   let waitingTime = Date.now() + (Math.pow(2, waitCount)  * 60 * 1000);
  //   contact.waitingTime = waitingTime;
  //   contact.incrementWaitCount();
  // }
  


  let role = "user";  // ou "assistant" ou "system", dependendo da fonte
  let content = eventData.data.body;  // entrada dinâmica
  contact.addToHistory(role, content);
  let history = contact.history;
  history = trimHistory(history);
  let messages = createMessages(promptTemplates.defaut, history, content);
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
                  if(contact.getInteractionCount()<0){
                    suggestUpsell(eventData)
                    // Removendo da lista de resposta
                    removeFromResponding(eventData.data.fromNumber);
                    return
                  }
                  // console.log("Texto da introducao");
                  intro = true;
                  accumulatedContent = accumulatedContent.replace("INTROSTART","")      
                }
                if (accumulatedContent.endsWith('INTROEND')){
                  accumulatedContent = accumulatedContent.replace("INTROEND","")
                  // console.log("FIM a introdução");
                  sendChunkContent(eventData, accumulatedContent, quote);
                  accumulatedContent = "";
                  intro = false;
                  longAnswer = true;
                  contact.decrementInteraction();
                  // console.log("Quantidade de interações após decrementar:", contact.getInteractionCount());  
                }
                if (!longAnswer && firstSentence && accumulatedContent.match(/[a-z]\.[ \n]/g)) {
                  // match(/[a-zA-Z]\.(?![0-9])/)
                  // Isso funcionou: [a-z]\.[ \n]
                  // Outra opção     [a-z]\.\s|\.\n 
                  firstSentence = false;
                  let str = accumulatedContent;
                  let lastIndex = str.lastIndexOf(".");
                  let primeiraParte = str.substring(0, lastIndex + 1); // A substring começa no início da string e vai até o último ponto encontrado (incluindo o ponto)
                  let segundaParte = str.substring(lastIndex + 1);    // A substring começa após o último ponto encontrado e vai até o final da string
                  sendChunkContent(eventData, primeiraParte, quote);
                  accumulatedContent = "";
                  accumulatedContent += segundaParte;
                }
            }
          }
          // Após processar todos os chunks, enviar o conteúdo restante (que seria após INTROEND para mensagens complexas)
          if(accumulatedContent){
            sendChunkContent(eventData, accumulatedContent, quote);
            accumulatedContent = "";
          }
          // Decrementando a quantidade de interações
          response = response.replace("INTROSTART","")
          response = response.replace("INTROEND","")
          contact.addToHistory("assistant", response);
          // sendReaction(eventData, "-")
          // setTimeout(() => sendReaction(eventData, "-"), 10000);
          removeFromResponding(fromNumber)
          if (queue.length() > 0) {
            console.log("A fila nao está vazia.");
              main(queue.peek(), true);
              queue.dequeue();
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
    if(queue.length()>2){
      console.log("######### Chegou mensagem nova e ela vai entra na fila #########");
      contact.setWaitingTime();
      waitingTime = contact.getWaitingTime();
      if(Math.round(waitingTime)>1){
        time = `${Math.round(waitingTime)} minutos.`;
      }else{
        time = `${Math.round(waitingTime)} minuto.`;
      }
      console.log(`O tempo de espera é de aproximadamente ${time}`);
      send(eventData, "Estou escrevendo respostas para as suas mensagens anteriores, logo vou enviar para você. Aguarde...")
      suggestUpsell(eventData)
      return
    }
    console.log("********** Chegou mensagem nova e ela vai entra na fila ***********");
    console.log("Mensagem inserida na fila: "+eventData.data.body);
    queue.enqueue(eventData);
    console.log("Tamanho da fila agora: " + queue.length());
  }
}

export default main; // Exporta a função main

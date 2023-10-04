// Examples requires you to have installed node-fetch Node.js package.
// Install it by running: npm install --save node-fetch or yarn add node-fetch

import fetch from 'node-fetch';
import dataStore from './dataStore.js';


function sendChunkContent(eventData, chunkContent, quote){
    // console.log("quote: "+quote);
    // console.log("Enviando mensagem: "+chunkContent);
    let url = 'https://api.wzap.chat/v1/messages';
    
    let phone = eventData.data.fromNumber;
    let device = eventData.device.id;
    let message = chunkContent;

    let bodyObj = {
        phone: phone,
        device: device,
        order: true,
        message: message,
    };
    if(quote){
        bodyObj.quote = eventData.data.id;
    }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Token: 'be3df4963420aabf9134851b0a9c287045c66285d205784d8b96222b3820d01e0135200333a69a83'
        },
        body: JSON.stringify(bodyObj)
    };

    fetch(url, options)
    .then(res => res.json())
    // .then(json => console.log(json))
    // .then(json => console.log("Mensagem enviada: "+chunkContent))
    .catch(err => console.error('error:' + err));
}

function sendReaction(eventData, reaction) {
    const url = 'https://api.wzap.chat/v1/messages';

    let phone = eventData.data.fromNumber;
    let device = eventData.device.id;
    let wid = eventData.data.id;

    const bodyObj = {
        phone: phone,
        reaction: reaction,
        device: device,
        reactionMessage: wid,
        enqueue: "never",
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Token: 'be3df4963420aabf9134851b0a9c287045c66285d205784d8b96222b3820d01e0135200333a69a83'
        },
        body: JSON.stringify(bodyObj)
    };

    fetch(url, options)
    .then(res => res.json())
    // .then(json => console.log(json))
    .catch(err => console.error('error:' + err));
}

function sendQuote(eventData, message) {
    const url = 'https://api.wzap.chat/v1/messages';

    let phone = eventData.data.fromNumber;
    let device = eventData.device.id;

    const bodyObj = {
        phone: phone,
        device: device,
        quote: quoteMessageId,
        message: message
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Token: 'be3df4963420aabf9134851b0a9c287045c66285d205784d8b96222b3820d01e0135200333a69a83'
        },
        body: JSON.stringify(bodyObj)
    };

    fetch(url, options)
    .then(res => res.json())
    // .then(json => console.log(json))
    .catch(err => console.error('error:' + err));
}

function send(eventData, message){
    // console.log("Enviando mensagem: "+message);

    let url = 'https://api.wzap.chat/v1/messages';
    
    let phone = eventData.data.fromNumber;
    let device = eventData.device.id;

    let bodyObj = {
        phone: phone,
        device: device,
        order: true,
        enqueue: "never",
        message: message
    };

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Token: 'be3df4963420aabf9134851b0a9c287045c66285d205784d8b96222b3820d01e0135200333a69a83'
        },
        body: JSON.stringify(bodyObj)
    };

    fetch(url, options)
    .then(res => res.json())
    // .then(json => console.log(json))
    // .then(json => console.log("Mensagem enviada: "+message))
    .catch(err => console.error('error:' + err));

    let fromNumber = eventData.data.fromNumber;  
    let contact = dataStore.findContactByPhone(fromNumber);
    if (!contact) {
        contact = dataStore.addNewContact(fromNumber);
    }
    contact.addToHistory("assistant", message);
}

export { sendChunkContent, sendReaction, send, sendQuote};  // Exportando ambas as funções
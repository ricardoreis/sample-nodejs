//routes.js

import express from 'express';
import main from './chat.js';
import { send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js'; 
import { saveMessageHistory } from './db.js';
import { messageTypes } from './messages.js';


const router = express.Router();

router.post('/webhook', (req, res) => {
  res.sendStatus(200);
  const eventData = req.body;
  
//   console.log('Dados do Webhook recebidos:', eventData); 
  if (eventData && eventData.event === 'message:in:new') {
    // sendReaction(eventData, "🕑")
    let contact = dataStore.findContactByPhone(eventData.data.fromNumber);
    if (!contact) {
        contact = dataStore.addNewContact(eventData.data.fromNumber);
    }
    
    // Verificar o tipo de mensagem
    let type = eventData.data.type;
    let quickRespomnse = '_digitando..._';
    
    if (messageTypes[type]) {
        // console.log(messageTypes[type].log);
        quickRespomnse = messageTypes[type].response;
    } else {
        console.log('Não temos informações sobre esse tipo de mensagem.');
    }

    if (type != "text"){
        send(eventData, quickRespomnse);
        // setTimeout(() => sendReaction(eventData, "-"), 5000);
    }else{
        main(eventData, false);
    }
  }
});

router.get('/contact/:phone', (req, res) => {
    const phone = req.params.phone;
    const foundContact = dataStore.findContactByPhone(phone);
    if (foundContact) {
        let chatHTML = '<style>'
            + '.user { background-color: #f3f3f3; margin: 10px; padding: 5px; border-radius: 8px; }'
            + '.assistant { background-color: #2196F3; color: white; margin: 10px; padding: 5px; border-radius: 8px; }'
            + '</style>';
        
            chatHTML += '<div>';

        for (const message of foundContact.history) {
            chatHTML += `<div class="${message.role}">${message.content}</div>`;
        }
        if(foundContact.history){
            chatHTML += '</div>'
            + '<br><hr><p>O histórico acima está na memória temporária, clique no botão para salvar o histórico no banco de dados e limpar a memória temporária</p>'
            + `<br><button onclick="window.location.href='/api/contact/${phone}/saveHistory'">Salvar e Limpar</button>`;
        }
       
        res.send(chatHTML);
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});

router.get('/contact/:phone/saveHistory', async (req, res) => {
    const aiNumber = "+554891088964"
    const phone = req.params.phone;
    const foundContact = dataStore.findContactByPhone(phone);
    if (foundContact) {
        // Salvar o histórico no banco de dados
        await saveMessageHistory(phone, aiNumber, foundContact.history);
        // Limpar o histórico da memória temporária
        foundContact.history = [];

        res.send("Histórico salvo e memória temporária limpa!");
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});


router.get('/contact', (req, res) => {
    let contactListHTML = '<ul>';
    const allContacts = dataStore.contacts;
    for (let contact of allContacts) {
        contactListHTML += `<li><a href="/api/contact/${contact.phone}">${contact.phone}</a></li>`;
    }
    contactListHTML += '</ul>';
    res.send(contactListHTML);
});


export default router;

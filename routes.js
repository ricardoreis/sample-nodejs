//routes.js

import express from 'express';
import main from './chat.js';
import { send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js'; 
import { saveMessageHistory } from './db.js';

const router = express.Router();

router.post('/webhook', (req, res) => {
  res.sendStatus(200);
  const eventData = req.body;
  
//   console.log('Dados do Webhook recebidos:', eventData); 
  if (eventData && eventData.event === 'message:in:new') {
    // sendReaction(eventData, "🕑")
    

    
    
    // Verificar o tipo de mensagem
    let type = eventData.data.type;
    let quickRespomnse = '_digitando..._';
    switch (type) {
        case 'text':
            console.log('O usuário enviou: text');
            quickRespomnse = '_digitando..._';
            break;
        case 'sticker':
            console.log('O usuário enviou: sticker');
            quickRespomnse = 'Vi que você me enviou um sticker. Infelizmente, não consigo interagir com stickers hoje. Porém, em breve, receberei uma atualização para visualizar e interpretar stickers. Também poderei criar e enviar stickers para você em breve.';
            break;
        case 'location':
            console.log('O usuário enviou: location');
            quickRespomnse = 'Vi que você me enviou uma localização. Infelizmente, ainda não consigo interagir com localizações aqui no WhatsApp. Porém, em breve, receberei uma atualização para visualizar e interpretar localizações.';
            break;
        case 'image':
            console.log('O usuário enviou: image');
            quickRespomnse = 'Vi que você me enviou uma imagem. Infelizmente, não consigo interagir com imagens hoje. Porém, em breve, receberei uma atualização para visualizar e interpretar imagens. Também poderei criar e enviar imagens para você em breve.';
            break;
        case 'audio':
            console.log('O usuário enviou: audio');
            quickRespomnse = 'Vi que você me enviou um áudio. Infelizmente, ainda não consigo escutar áudios. Porém, em breve, receberei uma atualização para ouvir e interpretar áudios. Também poderei criar e enviar respostas em áudio para você em breve.';
            break;
        case 'video':
            console.log('O usuário enviou: video');
            quickRespomnse = 'Vi que você me enviou um vídeo. Infelizmente, ainda não consigo assistir vídeos. Porém, em breve, receberei uma atualização para ver e interpretar vídeos. Também poderei criar e enviar vídeos para você em breve.';
            break;
        case 'document':
            console.log('O usuário enviou: document');
            quickRespomnse = 'Vi que você me enviou um arquivo e parece ser um documento. Infelizmente, ainda não consigo ver os dados desse documento. Porém, em breve, receberei uma atualização para lidar com documentos aqui no WhatsApp. Também poderei criar e enviar documentos para você em breve.';
            break;
        case 'contact':
        case 'contacts':
            console.log('O usuário enviou: contact ou contacts');
            quickRespomnse = 'Vi que você me enviou um contato. Infelizmente, ainda não consigo ver os dados do contato. Porém, em breve, receberei uma atualização para lidar com contatos aqui no WhatsApp. Também poderei enviar contatos para você em breve.';
            break;
        default:
            console.log('Não temos informações sobre esse tipo de mensagem.');
    }
    // setTimeout(() => {
    //     console.log('Pause. Continuação do script em 3 segundos...');
    // }, 3000);  // Pausa por 5 segundos (5000 milissegundos)

    main(eventData, false);
    if (type != "text"){
        send(eventData, quickRespomnse);
        // setTimeout(() => sendReaction(eventData, "-"), 5000);
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


// router.get('/contact/:phone/saveHistory', (req, res) => {
//     const phone = req.params.phone;
//     const foundContact = dataStore.findContactByPhone(phone);
//     if (foundContact) {
//         try {
//             saveMessageHistory(foundContact.history);
//             res.json({ message: 'History saved successfully!' });
//         } catch (error) {
//             res.status(500).json({ message: 'Failed to save history.', error: error.message });
//         }
//     } else {
//         res.status(404).json({ message: 'Contact not found' });
//     }
// });

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

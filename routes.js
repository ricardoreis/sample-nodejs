//routes.js
import express from 'express';
import main from './chat.js';
import { send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js';
import { saveMessageHistory } from './db.js';
import { messageTypes } from './messages.js';
import { getContact } from './contactUtils.js';

const router = express.Router();

router.post('/webhook', (req, res) => {
    res.sendStatus(200);
    const eventData = req.body;

    //   console.log('Dados do Webhook recebidos:', eventData);
    if (eventData && eventData.event === 'message:in:new') {
        let contact = getContact(eventData);
        let reactionSettings = contact.getSendReaction();
        if (reactionSettings){
            sendReaction(eventData, '🕑');
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
        if (type != 'text') {
            send(eventData, quickRespomnse);
            if (reactionSettings){
                setTimeout(() => sendReaction(eventData, '-'), 3000);
            }
        } else {
            main(eventData, false);
        }
    }
});

router.get('/contacts', (req, res) => {
    let contactListHTML = '<ul>';
    const allContacts = dataStore.contacts;
    for (let contact of allContacts) {
        contactListHTML += `<li><a href="/api/contact/history/${contact.phone}">${contact.phone}</a></li>`;
    }
    contactListHTML += '</ul>';
    res.send(contactListHTML);
});

router.get('/contact/:phone', (req, res) => {
    const phone = req.params.phone;
    const contact = dataStore.findContactByPhone(phone);

    if (contact) {
        const contactInfo = {
            id: contact.id,
            phone: contact.phone,
            lastMessage: contact.getLastMessage(),
            subscriptionPlan: contact.getSubscriptionPlan(),
            interactionCount: contact.getInteractionCount(),
            waitingTime: contact.getWaitingTime(),
            sendReaction: contact.getSendReaction()
        };

        res.json(contactInfo);
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});

router.get('/id/:id', (req, res) => {
    const id = req.params.id;
    const contact = dataStore.findContactById(id);

    if (contact) {
        const contactInfo = {
            id: contact.id,
            phone: contact.phone,
            lastMessage: contact.getLastMessage(),
            subscriptionPlan: contact.getSubscriptionPlan(),
            interactionCount: contact.getInteractionCount(),
            waitingTime: contact.getWaitingTime(),
            sendReaction: contact.getSendReaction()
        };

        res.json(contactInfo);
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});

router.get('/contact/history/:phone', (req, res) => {
    const phone = req.params.phone;
    const foundContact = dataStore.findContactByPhone(phone);
    if (foundContact) {
        res.json(foundContact.history);
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});

router.get('/contact/:phone/saveHistory', async (req, res) => {
    const aiNumber = '+554891088964';
    const phone = req.params.phone;
    const foundContact = dataStore.findContactByPhone(phone);
    if (foundContact) {
        // Salvar o histórico no banco de dados
        await saveMessageHistory(phone, aiNumber, foundContact.history);
        // Limpar o histórico da memória temporária
        foundContact.history = [];

        res.send('Histórico salvo e memória temporária limpa!');
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});

router.post('/toggleSendReaction/:id', (req, res) => {
    const id = req.params.id;
    const contact = dataStore.findContactById(id);

    if (contact) {
        contact.toggleSendReaction();
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Contact not found', success: false });
    }
});

export default router;

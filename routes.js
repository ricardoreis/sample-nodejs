//file: routes.js
import express from 'express';
import main from './chat.js';
import { send, sendReaction } from './wzapchat.js';
import dataStore from './dataStore.js';
import { saveMessageHistory, selectContact, insertContact, updateContact } from './db.js';
import { messageTypes } from './messages.js';
import { getContact } from './contactUtils.js';

const router = express.Router();

router.post('/webhook', (req, res) => {
    res.sendStatus(200);
    const eventData = req.body;
    // console.log('Dados do Webhook recebidos:');
    // console.log(JSON.stringify(eventData));
    if (eventData && eventData.event === 'message:in:new') {
        if (!eventData.produtivi) {
            eventData.produtivi = {};
        }
        eventData.produtivi.role = 'user';
        let contact = getContact(eventData);
        let type = eventData.data.type;
        let reactionSettings = contact.getSendReaction();
        if (reactionSettings) {
            sendReaction(eventData, '🕑');
        }
        if (type == 'audio') {
            if (reactionSettings) {
                sendReaction(eventData, '👂');
            }
            send(eventData, "Ouvindo...");
        }
        // console.log(`routes.js type: ${type}`);
        let quickRespomnse = 'Me ligou? Infelizmente não consigo atender ligação agora, mas me envie um áudio que eu respondo!';
        if (messageTypes[type]) {
            console.log(`messageTypes[type]`);
            quickRespomnse = messageTypes[type].response;
        } else {
            console.log('Não temos informações sobre esse tipo de mensagem.');
        }
        if (type != 'text' && type != 'audio') {
            send(eventData, quickRespomnse);
            if (reactionSettings) {
                setTimeout(() => sendReaction(eventData, '-'), 3000);
            }
        } else {
            console.log("chamando main(eventData, false);");
            main(eventData, false);
        }
    }
});

router.get('/contacts', (req, res) => {
    res.json(dataStore.contacts);
});

router.post('/contacts/save', async (req, res) => {
    let totalContacts = dataStore.contacts.length;
    let newContacts = 0;
    let updatedContacts = 0;

    try {
        for (const contact of dataStore.contacts) {
            // Check if contact exists in DB
            const existingContact = await selectContact(contact.phone);
            if (!existingContact) {
                // If the contact does not exist, insert it
                await insertContact(contact.name, contact.phone);
                newContacts++;
            } else {
                // If the contact already exists, update it
                await updateContact(contact.name, contact.phone);
                updatedContacts++;
            }
        }

        const feedback = `
            ${totalContacts} contatos em dataStore.
            ${newContacts} contatos novos inseridos no banco de dados.
            ${updatedContacts} contatos atualizados.
        `;

        res.status(200).send(feedback);
    } catch (err) {
        console.error('Error saving contacts:', err);
        res.status(500).send('Internal Server Error. Failed to save contacts.');
    }
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

// Rota para obter todos os contatos e suas informações
router.get('/datastore/all', (req, res) => {
    res.json(dataStore.contacts);
});


export default router;

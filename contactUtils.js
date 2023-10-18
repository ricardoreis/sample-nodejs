import dataStore from './dataStore.js';
import { encryptNumber, decryptNumber } from './encryptor.js';
import { config } from 'dotenv';

config();

const secretPrivateKey = process.env.SECRET_PRIVATE_KEY;



function extractNameFromEventData(eventData) {
    const notifyName = eventData.data.meta.notifyName;
    const formattedShortName = eventData.data.chat.contact.formattedShortName;
    const shortName = eventData.data.chat.contact.shortName;
    return notifyName || formattedShortName || shortName || '';
}

function getContact(eventData) {
    const fromNumber = eventData.data.fromNumber;
    let contact = dataStore.findContactByPhone(fromNumber);
    if (!contact) {
        const location = eventData.data.chat.contact.locationInfo.name;
        const language = eventData.data.chat.contact.locationInfo.languages;
        const currency = eventData.data.chat.contact.locationInfo.currencies;
        const { iv, encryptedNumber } = encryptNumber(fromNumber, secretPrivateKey);
        const name = extractNameFromEventData(eventData);
        contact = dataStore.addNewContact(fromNumber, name, 'free', location, language, currency);
        contact.iv = iv;
        contact.hash = encryptedNumber;
    }

    return contact;
}

export { getContact };



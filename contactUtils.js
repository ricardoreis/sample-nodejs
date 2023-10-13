import dataStore from './dataStore.js';

function getContact(eventData) {
    const fromNumber = eventData.data.fromNumber;
    const location = eventData.data.chat.contact.locationInfo.name;
    const language = eventData.data.chat.contact.locationInfo.languages;
    const currency = eventData.data.chat.contact.locationInfo.currencies;
    let contact = dataStore.findContactByPhone(fromNumber);
    if (!contact) {
        contact = dataStore.addNewContact(fromNumber, 'free', location, language, currency);

    }

    return contact;
}

export { getContact };



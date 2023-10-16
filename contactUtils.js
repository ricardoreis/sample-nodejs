import dataStore from './dataStore.js';

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
        const name = extractNameFromEventData(eventData);
        contact = dataStore.addNewContact(fromNumber, name, 'free', location, language, currency);

    }

    return contact;
}

export { getContact };



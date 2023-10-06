import dataStore from './dataStore.js';

function getContact(eventData) {
    let fromNumber = eventData.data.fromNumber;
    let contact = dataStore.findContactByPhone(fromNumber);
    if (!contact) {
        contact = dataStore.addNewContact(fromNumber);
    }
    return contact;
}

export { getContact };
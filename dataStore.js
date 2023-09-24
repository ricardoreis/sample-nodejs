// dataStore.js
class Contact {
    constructor(phone) {
        this.phone = phone;
        this.history = [];
    }

    addToHistory(role, content) {
        this.history.push({
            "role": role,
            "content": content
        });
    }
}

class DataStore {
    constructor() {
        this.contacts = [];
    }

    addNewContact(phone) {
        const contact = new Contact(phone);
        this.contacts.push(contact);
        return contact;
    }

    findContactByPhone(phone) {
        return this.contacts.find(contact => contact.phone === phone);
    }

    getHistory(phone) {
        const contact = this.findContactByPhone(phone);
        if (contact && contact.history.length > 0) {
            return contact.history;
        }
        return null;
    }
}

export default new DataStore();

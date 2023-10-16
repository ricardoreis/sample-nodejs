// file: dataStore.js

import { v4 as uuidv4 } from 'uuid';

class Contact {
    constructor(phone, name = '', subscriptionPlan = 'free', location = 'Brazil', language = 'pt-BR', currency = 'BRL', measurementUnit = 'Metric System', temperatureUnit = '°C') {
        this.id = uuidv4();  // Aqui estamos gerando o UUID.
        this.phone = phone;
        this.name = name;
        this.history = [];
        this.lastMessage = null; // Armazena a última mensagem enviada pelo contato
        this.subscriptionPlan = subscriptionPlan; // Novo atributo para armazenar o plano de assinatura
        this.interactionCount = 10; // Novo atributo para armazenar a quantidade de interações
        this.waitCount = 1;
        this.waitingTime = null;
        this.sendReaction = true;
        this.location = location;
        this.language = language;
        this.currency = currency;
        this.measurementUnit = measurementUnit;
        this.temperatureUnit = temperatureUnit;
        this.isStoredInDatabase = false;

    }
    // Método para obter o nome do contato
    getName() {
        return this.name;
    }

    // Método para definir o nome do contato
    setName(newName) {
        this.name = newName;
        console.log(`Nome atualizado para: ${newName}`);
    }

    addToHistory(role, content) {
        this.history.push({
            role: role,
            content: content,
        });
    }

    setLastMessage(eventData) {
        this.lastMessage = {
            data: eventData,
            timestamp: new Date().toISOString(), // Marca o momento exato que o contato enviou a última mensagem
        };
    }

    getLastMessage() {
        return this.lastMessage;
    }

    // Método para obter o plano de assinatura do contato
    getSubscriptionPlan() {
        return this.subscriptionPlan;
    }

    // Método para alterar o plano de assinatura do contato
    setSubscriptionPlan(newPlan) {
        if (['free', 'premium'].includes(newPlan)) {
            this.subscriptionPlan = newPlan;
            console.log(`Plano de assinatura atualizado para: ${newPlan}`);
        } else {
            console.log(
                "Plano de assinatura inválido. Por favor, escolha entre 'free' e 'premium'."
            );
        }
    }

    // Método para obter a quantidade de interações
    getInteractionCount() {
        return this.interactionCount;
    }

    // Método para decrementar a quantidade de interações
    decrementInteraction() {
        if (this.interactionCount > 0) {
            this.interactionCount--;
            console.log(
                `Quantidade de interações decrementada. Valor atual: ${this.interactionCount}`
            );
        } else {
            console.log(
                'A quantidade de interações já está em zero. Não pode ser reduzida ainda mais.'
            );
        }
    }

    setWaitingTime() {
        let waitCount = this.waitCount;
        this.waitingTime = Date.now() + Math.pow(2, waitCount) * 60 * 1000;
        this.waitCount++;
    }

    getWaitingTime() {
        const timestamp = Date.now();
        let diffMillis = this.waitingTime - timestamp;
        if (diffMillis > 0) {
            let diffMinutes = diffMillis / (1000 * 60);
            // console.log(`O tempo de espera é de aproximadamente ${Math.round(diffMinutes)} minutos.`);
            // console.log(`O tempo de espera é de aproximadamente ${diffMinutes} minutos.`);
            return diffMinutes;
        } else {
            return 0;
        }
    }

    // Método para obter o valor de sendReaction
    getSendReaction() {
        return this.sendReaction;
    }

    // Método para alternar o valor de sendReaction entre true e false
    toggleSendReaction() {
        this.sendReaction = !this.sendReaction;
        console.log(`sendReaction agora está definido como: ${this.sendReaction}`);
    }

    getLocation() {
        return this.location;
    }

    setLocation(newLocation) {
        this.location = newLocation;
    }

    getLanguage() {
        return this.language;
    }

    setLanguage(newLanguage) {
        this.language = newLanguage;
    }

    getCurrency() {
        return this.currency;
    }

    setCurrency(newCurrency) {
        this.currency = newCurrency;
    }

    getMeasurementUnit() {
        return this.measurementUnit;
    }

    setMeasurementUnit(newMeasurementUnit) {
        this.measurementUnit = newMeasurementUnit;
    }

    getTemperatureUnit() {
        return this.temperatureUnit;
    }

    setTemperatureUnit(newTemperatureUnit) {
        this.temperatureUnit = newTemperatureUnit;
    }
}

class DataStore {
    constructor() {
        this.contacts = [];
    }

    addNewContact(phone, subscriptionPlan, location, language, currency) {
        const contact = new Contact(phone, subscriptionPlan, location, language, currency);
        this.contacts.push(contact);
        console.log(`dataStore.js contato criado com sucesso!!!!!!!!!`);
        return contact;
    }

    findContactByPhone(phone) {
        return this.contacts.find(contact => contact.phone === phone);
    }

    findContactById(id) {
        return this.contacts.find(contact => contact.id === id);
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

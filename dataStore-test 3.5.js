// Importar o módulo dataStore.js
import dataStore from './dataStore';

// Criar exemplos de uso do dataStore.js

// Exemplo 1: Adicionar um novo contato
const newContact = dataStore.addNewContact('1234567890', 'premium', 'USA', 'en-US', 'USD');
console.log('Exemplo 1: Novo contato adicionado:', newContact);

// Exemplo 2: Encontrar um contato pelo número de telefone
const foundContact = dataStore.findContactByPhone('1234567890');
console.log('Exemplo 2: Contato encontrado pelo número de telefone:', foundContact);

// Exemplo 3: Atualizar o plano de assinatura de um contato
foundContact.setSubscriptionPlan('free');
console.log('Exemplo 3: Plano de assinatura atualizado:', foundContact.getSubscriptionPlan());

// Exemplo 4: Adicionar uma entrada de histórico para o contato
foundContact.addToHistory('user', 'Mensagem de teste');
console.log('Exemplo 4: Histórico atualizado:', foundContact.history);

// Exemplo 5: Obter a última mensagem do contato
const lastMessage = foundContact.getLastMessage();
console.log('Exemplo 5: Última mensagem do contato:', lastMessage);

// Exemplo 6: Obter a quantidade de interações do contato
const interactionCount = foundContact.getInteractionCount();
console.log('Exemplo 6: Quantidade de interações do contato:', interactionCount);

// Exemplo 7: Decrementar a quantidade de interações do contato
foundContact.decrementInteraction();
console.log('Exemplo 7: Quantidade de interações decrementada:', foundContact.getInteractionCount());

// Exemplo 8: Definir o tempo de espera e obter o tempo restante
foundContact.setWaitingTime();
const waitingTime = foundContact.getWaitingTime();
console.log('Exemplo 8: Tempo de espera definido e tempo restante (em minutos):', waitingTime);

// Exemplo 9: Alternar o valor de sendReaction
foundContact.toggleSendReaction();
console.log('Exemplo 9: Valor de sendReaction alternado:', foundContact.getSendReaction());

// Exemplo 10: Obter e definir a localização do contato
const location = foundContact.getLocation();
console.log('Exemplo 10: Localização do contato:', location);
foundContact.setLocation('Canada');
console.log('Exemplo 10: Localização do contato atualizada:', foundContact.getLocation());

// Exemplo 11: Obter e definir o idioma do contato
const language = foundContact.getLanguage();
console.log('Exemplo 11: Idioma do contato:', language);
foundContact.setLanguage('es-ES');
console.log('Exemplo 11: Idioma do contato atualizado:', foundContact.getLanguage());

// Exemplo 12: Obter e definir a moeda do contato
const currency = foundContact.getCurrency();
console.log('Exemplo 12: Moeda do contato:', currency);
foundContact.setCurrency('EUR');
console.log('Exemplo 12: Moeda do contato atualizada:', foundContact.getCurrency());

// Exemplo 13: Obter e definir a unidade de medida do contato
const measurementUnit = foundContact.getMeasurementUnit();
console.log('Exemplo 13: Unidade de medida do contato:', measurementUnit);
foundContact.setMeasurementUnit('Imperial System');
console.log('Exemplo 13: Unidade de medida do contato atualizada:', foundContact.getMeasurementUnit());

// Exemplo 14: Obter e definir a unidade de temperatura do contato
const temperatureUnit = foundContact.getTemperatureUnit();
console.log('Exemplo 14: Unidade de temperatura do contato:', temperatureUnit);
foundContact.setTemperatureUnit('°F');
console.log('Exemplo 14: Unidade de temperatura do contato atualizada:', foundContact.getTemperatureUnit());

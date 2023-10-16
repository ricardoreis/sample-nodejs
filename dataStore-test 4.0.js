// dataStore-test.js

// Importando a DataStore de dataStore.js
import DataStore from './dataStore.js';

// Criando um novo contato
let contact = DataStore.addNewContact("123456789", "free", "Brazil", "pt-BR", "BRL");
console.log(contact);

// Buscando um contato por telefone
let foundContact = DataStore.findContactByPhone("123456789");
console.log("Contato encontrado:", foundContact);

// Adicionando uma mensagem ao histórico do contato
foundContact.addToHistory("user", "Oi, como você está?");
foundContact.addToHistory("bot", "Estou bem, obrigado!");

// Obtendo o histórico de mensagens do contato
let history = DataStore.getHistory("123456789");
console.log("Histórico de mensagens:", history);

// Atualizando o plano de assinatura do contato
foundContact.setSubscriptionPlan("premium");

// Decrementando a quantidade de interações
foundContact.decrementInteraction();

// Alternando o valor de sendReaction
foundContact.toggleSendReaction();

// Atualizando a localização do contato
foundContact.setLocation("Portugal");
console.log("Nova localização:", foundContact.getLocation());

// Atualizando a moeda do contato
foundContact.setCurrency("EUR");
console.log("Nova moeda:", foundContact.getCurrency());

// Exibindo o tempo de espera
console.log(`O tempo de espera é de aproximadamente ${Math.round(foundContact.getWaitingTime())} minutos.`);

// E assim por diante. Pode-se continuar testando todos os métodos disponíveis no Contact e DataStore.

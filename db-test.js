import { selectContact, insertContact, updateContact } from './db.js';

async function modifyContact(name, phone) {
    try {
        await updateContact(name, phone);
        console.log(`O contato com o número ${phone} foi atualizado para ${name}.`);
    } catch (error) {
        console.error("Erro ao atualizar contato:", error);
    }
}

// Usando a função:
modifyContact('Ricardo Reis', '+555198669809');

// async function getContactDetails(phoneNumber) {
//     const contact = await selectContact(phoneNumber);
//     if (contact) {
//         console.log(`Detalhes do contato com o número ${phoneNumber}:`);
//         console.log(`Nome: ${contact.name}`);
//         console.log(`Telefone: ${contact.phone}`);
//         // ... você pode exibir outras colunas da tabela, se houver.
//     } else {
//         console.log(`O contato com o número ${phoneNumber} não foi encontrado no banco de dados.`);
//     }
// }

// // Usando a função:
// getContactDetails('+555198669809');

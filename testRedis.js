import DataStore from './dataStore.js';

// Função assíncrona para testar as operações no Redis
async function testRedisOperations() {
    console.log('Iniciando testes com Redis...');

    const phoneNumber = '+1234567890';

    // Teste 1: Adicionar novo contato
    console.log(
        `\nTeste 1: Adicionando novo contato com telefone ${phoneNumber}...`,
    );
    const newContact = await DataStore.addNewContact(phoneNumber);
    console.log('Novo contato adicionado:', newContact);

    // Teste 2: Recuperar contato por número de telefone
    console.log(`\nTeste 2: Buscando contato com telefone ${phoneNumber}...`);
    const fetchedContact = await DataStore.findContactByPhone(phoneNumber);
    console.log('Contato recuperado:', fetchedContact);

    // Teste 3: Recuperar histórico de mensagens do contato
    console.log(
        `\nTeste 3: Buscando histórico de mensagens do contato com telefone ${phoneNumber}...`,
    );
    const messageHistory = await DataStore.getHistory(phoneNumber);
    console.log('Histórico de mensagens recuperado:', messageHistory);

    // Finalizar o teste
    process.exit(0);
}

testRedisOperations().catch(err => {
    console.error('Erro durante os testes:', err);
    process.exit(1);
});

setTimeout(() => {
    DataStore.closeRedisConnection();
}, 5000); // espera 5 segundos antes de fechar a conexão

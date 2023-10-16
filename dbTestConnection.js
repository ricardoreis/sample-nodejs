// file: dbTestConnection.js

import { testConnection } from './db.js';

const runTest = async () => {
    const isConnected = await testConnection();
    if (isConnected) {
        console.log("Conexão com o banco de dados testada com sucesso!");
    } else {
        console.log("Falha ao testar conexão com o banco de dados.");
    }
};
runTest();

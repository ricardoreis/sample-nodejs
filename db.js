// file: db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// DIGITAL OCEAN
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 25060,
    ssl: {
        ca: fs.readFileSync('ca-certificate.crt') // substitua 'path_to_your_ca_file' pelo caminho correto para o arquivo CA
    }
});

export const testConnection = async () => {
    try {
        await connection.query('SELECT 1');
        console.log("Conexão com o banco de dados estabelecida com sucesso!");
        return true;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        return false;
    }
};

export const insertContact = async (contact) => {
    const name = contact.name;
    const phone = contact.phone;
    try {
        const query = 'INSERT INTO contacts (name, phone) VALUES (?, ?)';
        await connection.execute(query, [name, phone]);
        console.log('Contato inserido com sucesso!');
    } catch (err) {
        console.error("Erro ao inserir o contato:", err);
        throw err;
    }
};

export const selectContact = async (phoneNumber) => {
    try {
        const query = 'SELECT * FROM contacts WHERE phone = ?';
        const [rows] = await connection.query(query, [phoneNumber]);
        if (rows.length > 0) {
            return rows[0]; // Retorna o primeiro registro encontrado.
        }
        return null; // Retorna null se nenhum registro for encontrado.
    } catch (err) {
        console.error("Erro ao buscar o contato:", err);
        throw err;
    }
};

export const updateContact = async (newName, phone) => {
    try {
        const query = 'UPDATE contacts SET name = ? WHERE phone = ?';
        await connection.execute(query, [newName, phone]);
        console.log('Contato atualizado com sucesso!');
    } catch (err) {
        console.error("Erro ao atualizar o contato:", err);
        throw err;
    }
};


export async function getContactDetails(phoneNumber) {
    const contact = await selectContact(phoneNumber);
    if (contact) {
        console.log(`Detalhes do contato com o número ${phoneNumber}:`);
        console.log(`Nome: ${contact.name}`);
        console.log(`Telefone: ${contact.phone}`);
        // ... você pode exibir outras colunas da tabela, se houver.
    } else {
        console.log(`O contato com o número ${phoneNumber} não foi encontrado no banco de dados.`);
    }
}


export const insertData = async (data) => {
    try {
        const [rows] = await connection.execute('INSERT INTO your_table_name (column1, column2) VALUES (?, ?)', [data.column1, data.column2]);
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Função para inserir um evento no banco de dados
export const insertEvent = async (eventValue) => {
    try {
        const query = 'INSERT INTO wzap_events (event) VALUES (?)';
        await connection.execute(query, [eventValue]);
        console.log('Evento inserido com sucesso!');
    } catch (error) {
        console.error("Erro ao inserir evento:", error);
    }
};

export const selectData = async (table, columns = "*", conditions = "") => {
    try {
        const query = `SELECT ${columns} FROM ${table} ${conditions}`;
        const [rows] = await connection.query(query);
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const saveMessageHistory = async (fromNumber, aiNumber, history) => {
    try {
        while (history.length > 0) {
            const message = history.shift(); // Remove e retorna o primeiro item do array
            const { role, content } = message;
            let sender, receiver;
            if (role === "user") {
                sender = fromNumber;
                receiver = aiNumber;
            } else {
                sender = aiNumber;
                receiver = fromNumber;
            }
            await connection.execute('INSERT INTO messages (sender, receiver, role, text) VALUES (?, ?, ?, ?)', [sender, receiver, role, content]);
        }
        console.log("Histórico salvo com sucesso!");
    } catch (err) {
        console.error("Error saving message history:", err);
        throw err;
    }
};

// db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const version = process.env.VERSION || 'v7';
const dbName = `bitbra80_genichat_${version}`;

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName
});

export const testConnection = async () => {
    try {
        await connection.query('SELECT 1');
        return true;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        return false;
    }
};

export const insertData = async (data) => {
    try {
        const [rows] = await connection.execute('INSERT INTO your_table_name (column1, column2) VALUES (?, ?)', [data.column1, data.column2]);
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
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
            if(role === "user"){
                sender = fromNumber;
                receiver = aiNumber;
            }else{
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

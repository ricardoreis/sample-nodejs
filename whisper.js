// whisper.js
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

// Carregando as variáveis de ambiente do arquivo .env
dotenv.config();

// Função para transcrever áudio em texto
async function transcribeAudio(filePath) {
    // Definindo a URL da API e o token de autorização
    const API_URL = 'https://api.openai.com/v1/audio/transcriptions';
    const TOKEN = process.env.OPENAI_API_KEY;  // Lendo a chave da API do arquivo .env

    // Configurando os headers da requisição
    const headers = {
        'Authorization': `Bearer ${TOKEN}`
    };

    // Criando o form data usando a biblioteca form-data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-1');

    try {
        // Fazendo a requisição POST
        const response = await axios.post(API_URL, formData, { headers: {...formData.getHeaders(), ...headers} });

        // Retornando o resultado
        return response.data;
    } catch (error) {
        console.error('Erro ao transcrever o áudio:', error.response.data);
    }
}

export default transcribeAudio;

// Usando a função
// const filePath = 'output.ogg';  // Substitua com o caminho para o seu arquivo
// transcribeAudio(filePath).then(result => {
//     console.log('Transcrição:', result);
// });

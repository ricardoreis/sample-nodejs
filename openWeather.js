import axios from 'axios';
import { config } from 'dotenv';

config(); // Carrega as variáveis do arquivo .env

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

async function getWeatherByCity(city) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
                lang: 'pt',
                units: 'metric',
                limit: 5
            }
        });

        return {
            cidade: response.data.name,
            temperatura: response.data.main.temp,
            descricao: response.data.weather[0].description
        };
    } catch (error) {
        throw new Error(`Erro ao obter previsão do tempo: ${error.message}`);
    }
}

// Teste
getWeatherByCity('Florianópolis')
    .then(data => console.log(data))
    .catch(error => console.error(error.message));

// file: serpAPI.js

import { getJson } from "serpapi";
import dotenv from "dotenv";
// import { stringify } from '@iarna/toml';


dotenv.config();

/**
 * Busca no Google usando a API SerpAPI.
 *
 * @param {string} query - A string de consulta que você quer enviar para o Google.
 * @returns {Promise} - Retorna uma promessa que é resolvida com os resultados orgânicos da busca.
 */


export const searchGoogle = (query) => {
  return new Promise((resolve, reject) => {
    // Configurando parâmetros para a chamada da API SerpAPI
    getJson({
      api_key: process.env.SERPAPI_KEY, // Usando a chave de API a partir das variáveis de ambiente
      engine: "google",          // Especificando o mecanismo de busca como "google"
      no_cache: "true",
      num: "3",
      q: query,                  // A string de consulta fornecida como argumento da função
      google_domain: "google.com.br",
      gl: "us",
      hl: "pt-br"
    }, (json) => {
      // console.log(`Aqruivo serpAPI.js, resultado do json:`);
      // console.log(json);

      // Verificar e deletar os campos se existirem
      if (json.related_searches) {
        delete json.related_searches;
      }
      if (json.inline_videos) {
        delete json.inline_videos;
      }
      if (json.menu_items) {
        delete json.menu_items;
      }
      if (json.chart) {
        delete json.menu_items;
      }

      if (json) { // Verificando se os resultados orgânicos existem no retorno JSON
        // // Converter o JSON em TOML
        // let tomlData = stringify(json);
        // // Se o tomlData tiver mais de 15000 caracteres, truncar para 15000 caracteres
        // if (tomlData.length > 15000) {
        //   tomlData = tomlData.substring(0, 15000);
        // }
        // resolve(tomlData);  // Se os resultados existirem, resolvemos a promessa com esses resultados

        // let jsonString = JSON.stringify(json);
        // if(jsonString.length > 14000){
        //   jsonString = jsonString.substring(0, 14000);
        // }
        resolve(json);
      } else {
        reject(new Error("Erro ao buscar resultados."));  // Caso contrário, rejeitamos a promessa com um erro
      }
    });
  });
}

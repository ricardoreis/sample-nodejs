// file: serpAPI-test.js
import { searchGoogle } from "./serpAPI.js";

const processResults = (results) => {
  // Faça algo com os resultados aqui
  console.log(`resultado:`);
  console.log(results);
}

const searchTerm = "Último jogo do Grêmio";

searchGoogle(searchTerm)
  .then((results) => {
    // Armazenar os resultados em uma variável (por exemplo: data)
    const data = results;

    // Continue seu script chamando uma nova função que usa os resultados
    processResults(data);
  })
  .catch((error) => {
    console.error("Erro ao buscar os resultados:", error);
  });

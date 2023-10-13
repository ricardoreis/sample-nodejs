const eliminateSubstring = (str, start, end) => {
    const regex = new RegExp(`${escapeRegExp(start)}.*?${escapeRegExp(end)}`, 'gs');
    return str.replace(regex, '');
}

// Função auxiliar para escapar caracteres especiais em strings para serem usados em expressões regulares
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& significa a string toda casada
}

// Teste
const originalString = `Vou realizar uma busca rápida na internet para obter esse valor para você. Por favor, aguarde um momento.

STARTGOOGLE
Preço do dólar hoje em reais
ENDGOOGLE`;
const resultString = eliminateSubstring(originalString, "STARTGOOGLE", "ENDGOOGLE");
console.log(resultString);  // Saída: "Olá, . Aqui continua o texto original."

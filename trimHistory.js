function trimHistory(history) {
    // Calcula o total de caracteres no array de history
    let charCount = history.reduce((sum, message) => sum + JSON.stringify(message).length, 0);

    // Enquanto o total de caracteres for maior que 1000, remove a mensagem mais antiga
    while (charCount > 1000 && history.length) {
        const removedMessage = history.shift(); // Remove e retorna a primeira mensagem
        charCount -= JSON.stringify(removedMessage).length; // Subtrai o tamanho da mensagem removida do total
    }

    return history;
}

// Exemplo de uso:
const messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Who won the world series in 2020?"},
    {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
    {"role": "user", "content": "Where was it played?"}
];

const trimmedMessages = trimHistory(messages);
console.log(trimmedMessages);

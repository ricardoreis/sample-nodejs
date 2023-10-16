// Função auxiliar para escapar caracteres especiais em strings para serem usados em expressões regulares
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& significa a string toda casada
}

export function eliminateSubstring(str, start, end) {
    const regex = new RegExp(`${escapeRegExp(start)}.*?${escapeRegExp(end)}`, 'gs');
    return str.replace(regex, '');
}


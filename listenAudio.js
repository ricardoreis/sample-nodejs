//listenAudio.js

import downloadFile from './downloadWzap.js';
import transcribeAudio from './whisper.js';

export async function listenAudio(eventData) {
     // Espere pelo download do arquivo
     const file = await downloadFile(eventData);
     // Espere pela transcrição do áudio
     const result = await transcribeAudio(file);
     const content = result.text;
     return `O usuário enviou um arquivo de áudio. Whisper transcreveu e a seguir está a transcrição: ${content}`;
}


export default listenAudio; // Exporta a função main
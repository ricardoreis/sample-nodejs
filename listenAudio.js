//listenAudio.js

import downloadFile from './downloadWzap.js';
import transcribeAudio from './whisper.js';

const dynamicUrl = "https://api.wzap.chat/v1/chat/6453bd87dc5bb146aa934750/files/6520a6919fefaf000bd7fc61/download";

// downloadFile(dynamicUrl).then(() => {
//   console.log("Download completed!");
// });

// const dynamicFilePath = 'path_to_your_audio_file.ogg';  // Substitua com o caminho dinâmico para o seu arquivo
// transcribeAudio(dynamicFilePath).then(result => {
//     console.log('Transcrição:', result);
// });

async function listenAudio(eventData){
     // Espere pelo download do arquivo
     const file = await downloadFile(eventData);
     console.log("Download completed!");
     console.log(`file: ${file}`);
     
     // Espere pela transcrição do áudio
     const result = await transcribeAudio(file);
     console.log('Transcrição:', result);
 
     // Retorne o resultado
     return result.text;
}

export default listenAudio; // Exporta a função main
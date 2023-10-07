//downloadWzap.js
import axios from "axios";
import fs from "fs";
import dotenv from 'dotenv';

// Carregando as variáveis de ambiente do arquivo .env
dotenv.config();

const options = {
  method: 'GET',
  url: 'https://api.wzap.chat/v1/chat/6453bd87dc5bb146aa934750/files/6520a6919fefaf000bd7fc61/download',
  headers: {Token: process.env.WZAP_TOKEN},
  responseType: 'arraybuffer'  // This is important to handle binary data
};

axios.request(options).then(response => {
  const buffer = Buffer.from(response.data, 'binary');
  fs.writeFileSync('output.ogg', buffer);
  console.log("File saved as output.ogg");
}).catch(error => {
  console.error(error);
});

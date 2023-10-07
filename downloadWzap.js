// downloadWzap.js
import axios from "axios";
import fs from "fs";
import dotenv from 'dotenv';

// Carregando as variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Download a file from the given URL and save it as output.ogg.
 * @param {string} url - The URL from which to download the file.
 * @returns {Promise<void>}
 */
async function downloadFile(eventData) {
  let url = 'https://api.wzap.chat';
  url = url + eventData.data.media.links.download;
  let mediaFilename = eventData.data.media.filename;
  const options = {
    method: 'GET',
    url: url,
    headers: {Token: process.env.WZAP_TOKEN},
    responseType: 'arraybuffer'  // This is important to handle binary data
  };

  try {
    const response = await axios.request(options);
    const buffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync(mediaFilename, buffer);
    console.log(`File saved as: ${mediaFilename}`);
    return mediaFilename;
  } catch (error) {
    console.error(error);
  }
}

export default downloadFile;

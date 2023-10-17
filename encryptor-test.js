import { encryptNumber, decryptNumber } from './phoneEncryptor.js';
import { config } from 'dotenv';

// Loading the .env file variables
config();

// Getting the secret key from the environment variable
const secretPrivateKey = process.env.SECRET_PRIVATE_KEY;

// Using the functions
const phone = '+5551998669809';

// Encrypting the phone number
const { iv, encryptedNumber } = encryptNumber(phone, secretPrivateKey);
console.log('Encrypted number:', encryptedNumber);

// Decrypting back to the original phone number
const decryptedNumber = decryptNumber(encryptedNumber, secretPrivateKey, iv);
console.log('Decrypted number:', decryptedNumber);

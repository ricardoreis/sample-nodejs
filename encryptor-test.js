import { encryptNumber, decryptNumber } from './encryptor.js';
import { config } from 'dotenv';

// Loading the .env file variables
config();

// Getting the secret key from the environment variable
const secretPrivateKey = process.env.SECRET_PRIVATE_KEY;

// Using the functions
const phone = '+559192509492';

// Encrypting the phone number
const { iv, encryptedNumber } = encryptNumber(phone, secretPrivateKey);
console.log('iv:', iv);
console.log('Encrypted number:', encryptedNumber);

// let iv = '334b66cee950aeedd7b98205d15c6a2d';
// let encryptedNumber = 'f6ed4c9976244dbad036b59df3cccfd4';

// Decrypting back to the original phone number
const decryptedNumber = decryptNumber(encryptedNumber, secretPrivateKey, iv);
console.log('Decrypted number:', decryptedNumber);

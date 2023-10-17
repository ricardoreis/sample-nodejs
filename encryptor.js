import { scryptSync, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Function to encrypt the phone number
export function encryptNumber(phoneNumber, secretPrivateKey) {
    const key = scryptSync(secretPrivateKey, 'salt', 32);
    const iv = randomBytes(16); // Good practice: new random IV for each encryption

    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encryptedNumber = cipher.update(phoneNumber, 'utf8', 'hex');
    encryptedNumber += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedNumber }; // We return the IV because it will be necessary for decryption
}

// Function to decrypt the phone number
export function decryptNumber(encryptedNumber, secretPrivateKey, iv) {
    const key = scryptSync(secretPrivateKey, 'salt', 32);
    const ivBuffer = Buffer.from(iv, 'hex');

    const decipher = createDecipheriv('aes-256-cbc', key, ivBuffer);
    let decryptedPhone = decipher.update(encryptedNumber, 'hex', 'utf8');
    decryptedPhone += decipher.final('utf8');
    return decryptedPhone;
}


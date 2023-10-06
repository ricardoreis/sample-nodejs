// adminRoutes.js

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/contact/:phone', async (req, res) => {
    const phone = req.params.phone;

    try {
        const response = await axios.get(
            `http://localhost:8080/api/contact/${phone}`
        );
        const contactData = response.data;

        res.render('contact', { contact: contactData });
    } catch (error) {
        res.status(500).send('Error fetching contact data.');
    }
});

router.get('/id/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const response = await axios.get(
            `http://localhost:8080/api/id/${id}`
        );
        const contactData = response.data;

        res.render('settings', { contact: contactData });
    } catch (error) {
        res.status(500).send('Error fetching contact data.');
    }
});

router.get('/settings/:phone', async (req, res) => {
    const phone = req.params.phone;

    try {
        const response = await axios.get(
            `http://localhost:8080/api/contact/${phone}`
        );
        const contactData = response.data;

        res.render('settings', { contact: contactData });
    } catch (error) {
        res.status(500).send('Error fetching contact data.');
    }
});

router.get('/contact/history/:phone', async (req, res) => {
    const phone = req.params.phone;
    try {
        const response = await axios.get(
            `http://localhost:8080/api/contact/history/${phone}`
        );
        const history = response.data;

        let chatHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <title>Chat History</title>
        </head>
        <body>
            <div class="container mt-5">
                <h2>Chat History for ${phone}</h2>
                <div class="chatbox p-3">`;

        for (const message of history) {
            chatHTML += `<div class="p-2 my-2 rounded ${
                message.role === 'user' ? 'bg-light' : 'bg-primary text-white'
            }">${message.content}</div>`;
        }

        chatHTML += `
                </div>
            </div>
        </body>
        </html>`;

        res.send(chatHTML);
    } catch (error) {
        res.status(500).send('Error fetching chat history.');
    }
});

export default router;

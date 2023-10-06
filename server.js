// server.js

import express from 'express';
import webhookRoutes from './routes.js';
import adminRoutes from './adminRoutes.js';

const app = express();
const port = 8080; // Escolha a porta que desejar

app.use(express.json());

// Rota para exibir 'hello world' na raiz
app.get('/', (req, res) => {
    res.send('hello world');
});

app.use('/api', webhookRoutes); // Adicione esta linha para montar as rotas
app.use('/admin', adminRoutes);
app.set('view engine', 'ejs');

app.on('error', err => {
    console.error('Erro no servidor:', err);
});

app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});

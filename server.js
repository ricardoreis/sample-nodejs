// server.js

import express from 'express';
import webhookRoutes from './routes.js';

const app = express();
const port = 3000; // Escolha a porta que desejar

app.use(express.json());

// Rota para exibir 'hello world' na raiz
app.get('/', (req, res) => {
  res.send('hello world');
});

app.use('/api', webhookRoutes); // Adicione esta linha para montar as rotas

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});

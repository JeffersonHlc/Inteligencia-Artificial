const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importa o middleware CORS

const app = express();
const PORT = 3000;

// Habilitar CORS para todas as origens
app.use(cors());

// Função para obter o preço da criptomoeda da API do Gemini
async function getCryptoPrice(crypto) {
    try {
        const response = await axios.get(`https://api.gemini.com/v1/pubticker/${crypto}usd`);
        return response.data.last; // Preço da última transação
    } catch (error) {
        console.error('Erro ao obter o preço da criptomoeda', error);
        throw error;
    }
}

// Middleware para validar as consultas de valor e criptomoeda
function validateRequest(req, res, next) {
    const { amount, crypto } = req.query;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).send('O valor é inválido.');
    }

    if (!crypto || !['btc', 'eth'].includes(crypto.toLowerCase())) {
        return res.status(400).send('A criptomoeda é inválida.');
    }

    next();
}

// Rota para converter valores de reais para criptomoedas
app.get('/convert', validateRequest, async (req, res) => {
    const { amount, crypto } = req.query;

    try {
        const cryptoPriceInUSD = await getCryptoPrice(crypto.toLowerCase());
        const conversionRateBRLtoUSD = 0.19; // Exemplo de taxa de conversão BRL -> USD
        const amountInUSD = amount * conversionRateBRLtoUSD;
        const cryptoAmount = amountInUSD / cryptoPriceInUSD;

        res.json({ crypto: crypto, amount, cryptoAmount });
    } catch (error) {
        res.status(500).send('Erro ao converter valores.');
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

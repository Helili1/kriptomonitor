const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ключи (лучше хранить в .env)
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-56kAjpNgMLX2KvXsAQtfdtDs';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '2bc7292c-8a26-4bd7-8a51-5f7d6ff2f8ad';
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY || 'bb4039ed8dd766e676e5fbb71a7a26f280c1466bf3a899c4f0d48103ac7cdd7a';

app.use(cors());

// Прокси для CoinGecko (публичный)
app.get('/api/coingecko', async (req, res) => {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'CoinGecko error', details: e.message });
  }
});

// Прокси для CoinMarketCap
app.get('/api/coinmarketcap', async (req, res) => {
  try {
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=10&convert=USD';
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
      }
    });
    const data = await response.json();
    res.json(data.data);
  } catch (e) {
    res.status(500).json({ error: 'CoinMarketCap error', details: e.message });
  }
});

// Прокси для CryptoCompare
app.get('/api/cryptocompare', async (req, res) => {
  try {
    const url = 'https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD';
    const response = await fetch(url, {
      headers: {
        'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
      }
    });
    const data = await response.json();
    res.json(data.Data);
  } catch (e) {
    res.status(500).json({ error: 'CryptoCompare error', details: e.message });
  }
});

// Заготовка для авторизации (будет позже)
// app.post('/api/register', ...)
// app.post('/api/login', ...)
// app.get('/api/profile', ...)

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 
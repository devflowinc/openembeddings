const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const { object, string, number, ZodError } = require('zod');
const ethers = require('ethers');
const hat = require('hat');
require('dotenv').config();

const { Monterrey } = require("monterrey");
const path = require("path");
const crypto = require("crypto");

const ETH_TOK_EXCHANGE_RATE = ethers.toBigInt(process.env.ETH_TOK_EXCHANGE_RATE || 1);
const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL;
if (process.env.SALT === undefined) {
  console.warn('No SALT environment variable found, generating a random one');
}
const salt = process.env.SALT || crypto.randomBytes(32).toString('base64');

const validKey = (key) => {
  if (key.startsWith("EMB-") && key.length == 36) {
    return true;
  }
  return false;
}

let monterrey = null;
Monterrey.create({
  backend: path.join(process.env.HOME, '.embeddings'),
  salt,
  provider: new ethers.JsonRpcProvider(process.env.RPC_URL),
  ethConversion: ETH_TOK_EXCHANGE_RATE,
  tokenConversionRate: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6666666
  }
}).then(m => {
  monterrey = m;
  monterrey.start(); // return value is an unsubscribe function to stop monterrey

  monterrey.on('credit', ({ account, amount }) => {
    console.log('user ' + account + ' balance increases by ' + ethers.formatEther(amount));
  });
  monterrey.on('debit', ({ account, amount }) => {
    console.log('user ' + account + ' balance decreases by ' + ethers.formatEther(amount));
  });
});

// Start the server
const PORT = 3000;

const express = require('express')
const app = express()

function asyncHandler(callback) {
  return function(req, res, next) {
    callback(req, res, next)
      .catch(next)
  }
}

app.get('/', asyncHandler(async (_, res) => {
  res.send('Hello World!')
}))

app.get('/balance/:key', asyncHandler(async (req, res) => {
  const key = req.params.key;
  if (!validKey(key)) {
    res.status(400).send('Invalid key');
    return;
  }

  const balance = await monterrey.getBalance(key);
  return res.json({ balance: balance });
}))

app.get('/key', asyncHandler(async (_, res) => {
  return res.json({ key: "EMB-" + hat() });
}))

app.get('/gateway/:key', asyncHandler(async (req, res) => {
  const key = req.params.key;
  if (!validKey(key)) {
    res.status(400).send('Invalid key');
    return;
  }

  const wallet = await monterrey.generate(key);
  return res.json({ address: wallet.address });
}))


const encodeInputSchema = object({
  input: string(),
  key: string(),
});

app.post('/encode', asyncHandler(async (req, res) => {
  let data;
  try {
    data = await encodeInputSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      res.json({ "error": error.issues });
    } else {
      throw error;
    }
  }
  const tokens = (ethers.toBigInt(data.input.length) / ethers.toBigInt(4)) + ethers.toBigInt(1);
  if (!validKey(data.key)) {
    res.json({ error: 'Invalid key' });
    return;
  }

  const success = await monterrey.debit(data.key, tokens)
  if (!success) {
    res.status(400).json({ error: 'Insufficient funds' });
    return;
  }

  const embeddingResponse = await fetch(`${EMBEDDING_SERVICE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: validatedData.input }),
  })

  const json = embeddingResponse.json();
  return res.json(json);

}));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})


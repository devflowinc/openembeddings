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
const RPC_URL = process.env.RPC_URL;
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
  provider: process.env.RPC_URL != undefined ? new ethers.JsonRpcProvider(process.env.RPC_URL) : undefined,
  ethConversion: ETH_TOK_EXCHANGE_RATE,
  tokenConversionRate: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
    {
      conversionRate: 6666666667000n,
      decimals: 6n,
      symbol: 'USDC'
    },
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": {
      conversionRate: 6666666667000n,
      decimals: 6n,
      symbol: 'USDT'
    },
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": {
      conversionRate: 6666666667000n,
      decimals: 18n,
      symbol: 'DAI'
    },
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": {
      conversionRate: 16666666666700000000n,
      decimals: 8n,
      symbol: 'WBTC'
    },
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

app.use(express.json());

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
	return res.json({ balance: ethers.formatEther(balance) });
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
	model: string(),
});

app.post('/encode', asyncHandler(async (req, res) => {
	let data;
	try {
		data = encodeInputSchema.parse(req.body);
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).json({ "error": error.issues });
		} else {
			throw error;
		}
	}
	const tokens = (ethers.toBigInt(data.input.length) / ethers.toBigInt(4)) + ethers.toBigInt(1);
	if (!validKey(data.key)) {
		res.json({ error: 'Invalid key' });
		return;
	}

	const success = await monterrey.debit(data.key, ethers.parseEther('' + tokens))
	if (!success) {
		res.status(400).json({ error: 'Insufficient funds' });
		return;
	}

	let embeddingResponse;
	try {
		embeddingResponse = await fetch(`${EMBEDDING_SERVICE_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ input: data.input }),
		})
	} catch (e) {
		console.log(e);
		monterrey.credit(data.key, ethers.parseEther('' + tokens));
	}

	if (embeddingResponse.status !== 200) {
		monterrey.credit(data.key, tokens);
		return res.status(400).json({ error: 'Embedding service error', context: embeddingResponse.status });;
	}

	const json = await embeddingResponse.json();
	if (json.hasOwnProperty('embeddings')) {
		return res.json({ embeddings: json.embeddings });
	} else {
		monterrey.credit(data.key, ethers.parseEther('' + tokens));
		return res.json(json);
	}

}));

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})


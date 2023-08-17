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

// JSON schema validation using Zod
const encodeInputSchema = object({
  input: string(),
  key: string(),
});

const validKey = (key) => {
  if (key.startsWith("EMB-") && key.length == 36) {
    return true;
  }
  return false;
}

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  console.log(pathname, query);
  if (pathname === '/encode') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }

    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        const validatedData = encodeInputSchema.parse(parsedData);

        const tokens = (ethers.toBigInt(validatedData.input.length) / ethers.toBigInt(4)) + ethers.toBigInt(1);
        const amount = tokens * ETH_TOK_EXCHANGE_RATE;
        monterrey.debit(validatedData.key, amount).then((success) => {
          if (!success) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Insufficient funds' }));
            return;
          }
          fetch(`${EMBEDDING_SERVICE_URL}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: validatedData.input }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === 200) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: data }));
              }
            });
        })

      } catch (error) {
        if (error instanceof ZodError) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ "error": error.issues }));
        } else {
          console.log("Error", error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        }
      }
    });
  } else if (req.method == "GET" && req.url.startsWith("/gateway/")) {
    const key = req.url.split('/gateway/')[1];
    if (!validKey(key)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid key' }));
      return;
    }
    monterrey.generate(key).then(wallet => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ address: wallet.address }));
    });
  } else if (req.method == "GET" && pathname == "/key") {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ key: "EMB-" + hat() }));
  } else if (req.method == "GET" && req.url.startsWith("/balance/")) {
    const key = req.url.split('/balance/')[1];
    if (key && !validKey(key)) {
      console.log(key.length, key.startsWith("EMB-"));
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid key' }));
      return;
    }
    return monterrey.getBalance(key).then(balance => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ balance: ethers.formatEther(balance) }));
    }).catch(err => {
      console.log(err)
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err }));
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

let monterrey = null;
Monterrey.create({
  backend: path.join(process.env.HOME, '.embeddings'),
  salt,
  provider: new ethers.JsonRpcProvider(process.env.RPC_URL),
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
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/arguflow/blog/5ef439020707b0e27bf901c8f6b4fb1f487a78d4/apps/frontend/public/assets/horizontal-logo.svg" alt="Arguflow">
</p>

<p align="center">
    <b>Usage-based pricing to use bge-large-en model privately to create embeddings on your data</b>
</p>

**Arguflow OpenEmbedings**: Pay for what use using ETH, USDC/USDT/DAI, or WBTC on Ethereum mainnet to privately encode your data into embeddings using bge-large-en (other models coming soon).

<p align="center">
<strong><a href="https://vault.arguflow.ai">Search Demo</a> • <a href="https://chat.arguflow.ai">Debate Opponent Demo</a> • <a href="https://discord.gg/CuJVfgZf54">Discord</a>

</strong>
</p>

# Arguflow OpenEmbeddings

## Pricing per 1k-tokens by embedding model

| Model          | USDC/USDT/DAI per 1k-tokens | ETH per 1k-tokens | WBTC per 1k-tokens |
| -------------- | --------------------------- | ----------------- | ------------------ |
| `bge-large-en` | 0.00015                     | 0.000000083       | 0.000000006        |

## How to use

### 1. Get your API key

```
curl https://embeddings.arguflow.ai/key
```

Expected response will contain a key in the following format: `EMB-09250e7c54e226d30ac3ee06f290c934`

### 2. Get a payment address for your API key

Replace `{key}` with the key you received in the previous step

```
curl https://embeddings.arguflow.ai/gateway/{key}
```

Expected response will contain a valid Ethereum address

### 3. Use your wallet of choice to send ETH, USDC/USDT/DAI, or WBTC

### 4. Check your balance

```
curl https://embeddings.arguflow.ai/balance/{key}
```

### 4. Start making embedding vectors

```
curl -X POST https://embeddings.arguflow.ai/encode -H "Content-Type: application/json" -d '{
  "model": "bge-large-en",
  "input": "foo foo bar bar foo foo xyz",
  "key": "{key}"
}'
```

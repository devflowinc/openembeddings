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

### Python

Look in `examples/starter_notebook.ipynb` to see a quick starter notebook or

```py
import requests
import json

def create_api_key():
    response = requests.get("https://embeddings.arguflow.ai/key")
    return json.loads(response.text)["key"]

class OpenEmbeddingsClient:

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key is required")

        self.api_key = api_key

    def create_payment_address(self):
        response = requests.get(f"https://embeddings.arguflow.ai/gateway/{self.api_key}")
        return json.loads(response.text)["address"]

    def get_balance(self):
        response = requests.get(f"https://embeddings.arguflow.ai/balance/{self.api_key}")
        return json.loads(response.text)["balance"]
    
    def create_embedding(self, input: str, model="bge-large-en"):
        if model != "bge-large-en":
            raise ValueError("Only bge-large-en is supported at the moment")
            
        req_json = {
            "model": model,
            "input": input,
            "key": self.api_key,
        }

        response = requests.post(f"https://embeddings.arguflow.ai/encode", json=req_json)

        if response.status_code == requests.codes.ok:
            return json.loads(response.text)["embeddings"]

    def get_key(self):
        return self.api_key

if __name__ == "__main__":
    api_key = create_api_key()
    # Save this key, it is the only way to access your account
    print(api_key)
    client = OpenEmbeddingsClient(api_key)
    # Send funds to this address
    # We accept ETH, USDC, wBTC and DAI, all other payment methods
    # are not supported and we have no way to detect
    print(client.create_payment_address()) 

    # Your balance in number of tokens. we keep it simple and have 
    # 1 token be exactly 4 charcters rounded up to the nearest amount
    print(client.get_balance())

    embedding = client.create_embedding("Make an embedding for this address", model="bge-large-en")
```

### cURL

#### 1. Get your API key


```
curl https://embeddings.arguflow.ai/key
```

Expected response will contain a key in the following format: `EMB-09250e7c54e226d30ac3ee06f290c934`

#### 2. Get a payment address for your API key

Replace `{key}` with the key you received in the previous step

```
curl https://embeddings.arguflow.ai/gateway/{key}
```

Expected response will contain a valid Ethereum address

#### 3. Use your wallet of choice to send ETH, USDC/USDT/DAI, or WBTC

#### 4. Check your balance

```
curl https://embeddings.arguflow.ai/balance/{key}
```

#### 5. Start making embedding vectors

```
curl -X POST https://embeddings.arguflow.ai/encode -H "Content-Type: application/json" -d '{
  "model": "bge-large-en",
  "input": "foo foo bar bar foo foo xyz",
  "key": "{key}"
}'
```

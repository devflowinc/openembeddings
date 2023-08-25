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
        else:
            return json.loads(response.text)

    def get_key(self):
        return self.api_key
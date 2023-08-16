# Load model directly
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

import http.server
import json


if torch.cuda.is_available():
    # Initialize CUDA device
    device = torch.device("cuda")
else:
    device = torch.device("cpu")

tokenizer = AutoTokenizer.from_pretrained("BAAI/bge-large-en")
model = AutoModel.from_pretrained("BAAI/bge-large-en")
model.to(device)

class JSONHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            input_data = json.loads(post_data)
            if 'input' in input_data and isinstance(input_data['input'], str):
                response_data = encode(input_data['input'])
                code = 200
            else:
                response_data = {"error": "Invalid input format", "status": 400}
                code = 400
        except json.JSONDecodeError:
            response_data = {"error": "Invalid JSON", "status": 400}
            code = 400

        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

def encode(data: str):
    encoded_input = tokenizer(
        data,
        padding=True,
        truncation=True,
        max_length=512,
        add_special_tokens=True,
        return_tensors="pt",
    ).to(device)
    # for s2p(short query to long passage) retrieval task, add an instruction to query (not add instruction for passages)
    # encoded_input = tokenizer([instruction + q for q in queries], padding=True, truncation=True, return_tensors='pt')

    # Compute token embeddings
    with torch.no_grad():
        model_output = model(**encoded_input)
        # Perform pooling. In this case, cls pooling.
        sentence_embeddings = model_output[0][:, 0]
    # normalize embeddings
    sentence_embeddings = torch.nn.functional.normalize(sentence_embeddings, p=2, dim=1)
    return {"embeddings": np.array(sentence_embeddings.cpu())[0].tolist(), "status": 200}

if __name__ == '__main__':
    server_address = ('', 8080)  # Change the port as needed
    httpd = http.server.HTTPServer(server_address, JSONHandler)
    print('Server is running on port 8080')
    httpd.serve_forever()


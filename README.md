# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

Setup
```shell
# Setup .env
cp .env.didst .env

# Setup moneterey db
mkdir .embeddings
echo "{}" >> .embeddings/db.json

# Setup node
yarn

# Setup python
python -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

Run embedding server
```
yarn embed
```

Run nodejs server that accepts payments and gates access
```
yarn start
```

Run example hardhat node
```
yarn hardhat node
```

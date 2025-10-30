# 🦋 Blackhorn Reader

A Web3-native reading dApp built on **Base Sepolia**.  
This repository includes smart contracts, frontend, and backend logic for the **lendable ERC-1155 book system**.

---

## 📦 Project Structure

| Directory | Description |
|------------|-------------|
| `contracts/` | Contains Solidity smart contracts |
| `script/` | Forge deployment and utility scripts |
| `frontend/` | Web interface for readers and book owners |
| `backend/` | API and off-chain processing logic |
| `.env` | Environment configuration (excluded from Git) |
| `WARP.md` | Warp terminal reference for development |

---

## 🧱 Smart Contract

**Network:** Base Sepolia  
**Contract Address:** [`0x5a3a45160494A2cf01dF35683380f17B33D73E35`](https://base-sepolia.blockscout.com/address/0x5a3a45160494A2cf01dF35683380f17B33D73E35)  
**Verified:** ✅ Yes  
**Compiler Version:** `v0.8.20+commit.a1b79de6`

---

## 🚀 Deployment

1. **Set up environment variables** in `.env`

   ```bash
   PRIVATE_KEY="your_private_key"
   BASE_SEPOLIA_RPC="https://sepolia.base.org"
   BOOK_URI="ipfs://your_book_metadata_uri_here"

---

## Deploy the contract

forge verify-contract \
  --chain base-sepolia \
  --compiler-version v0.8.20+commit.a1b79de6 \
  0x5a3a45160494A2cf01dF35683380f17B33D73E35 \
  ./contracts/src/BlackhornReader.sol:BlackhornReader

---

## Verify the contract on BaseScan / Blockscout

forge verify-contract \
  --chain base-sepolia \
  --compiler-version v0.8.20+commit.a1b79de6 \
  0x5a3a45160494A2cf01dF35683380f17B33D73E35 \
  ./contracts/src/BlackhornReader.sol:BlackhornReader

---

💡 Vision

Blackhorn Reader reimagines digital publishing as an interactive, ownable reading experience powered by blockchain.
Readers can lend, review, and burn tokenized stories — creating a decentralized library built by its readers.

🪶 License

© 2025 La’Tarsha Blackhorn
A Web3-native publication initiative.

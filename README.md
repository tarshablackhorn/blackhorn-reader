# 🦋 Blackhorn Reader

A Web3-native reading dApp built on **Base Sepolia**.  
This repository includes smart contracts, frontend, and backend logic for the **lendable ERC-1155 book system**.

---

## 🚀 Deployed Contracts

### Base Sepolia (Testnet)
- **Contract Address**: [`0x5a3a45160494A2cf01dF35683380f17B33D73E35`](https://base-sepolia.blockscout.com/address/0x5a3a45160494A2cf01dF35683380f17B33D73E35)
- **Network**: Base Sepolia (Chain ID: 84532)
- **Verified**: ✅ Yes
- **Compiler Version**: `v0.8.20+commit.a1b79de6`
- **Transaction**: [`0x4df05da79e1f17bec675d56687196c0db62cfb391dc4723de542f81c869b49ad`](https://sepolia.basescan.org/tx/0x4df05da79e1f17bec675d56687196c0db62cfb391dc4723de542f81c869b49ad)
- **Explorer**: [View on BaseScan](https://sepolia.basescan.org/address/0x5a3a45160494a2cf01df35683380f17b33d73e35) | [View on Blockscout](https://base-sepolia.blockscout.com/address/0x5a3a45160494A2cf01dF35683380f17B33D73E35)

---

## 📦 Project Structure

| Directory | Description |
|------------|-------------|
| `contracts/` | Foundry-based Solidity smart contracts |
| `script/` | Forge deployment and utility scripts |
| `frontend/` | Web interface for readers and book owners |
| `backend/` | API server and off-chain processing logic |
| `.env` | Environment configuration (excluded from Git) |
| `WARP.md` | Warp terminal reference for development |

---

## 🛠 Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [pnpm](https://pnpm.io/installation)

### Smart Contract Development

Navigate to the contracts directory:

```bash
cd contracts
```

#### Build
```bash
forge build
```

#### Test
```bash
forge test
```

#### Deploy to Base Sepolia

1. Configure your `.env` file with:
   ```
   PRIVATE_KEY="your_private_key_here"
   RPC_URL="https://sepolia.base.org"
   BOOK_URI="ipfs://your_book_metadata_uri_here"
   ```

2. Deploy:
   ```bash
   forge script script/Deploy.s.sol:Deploy --rpc-url base-sepolia --broadcast --verify
   ```
#### Verify Contract on BaseScan

If auto-verification fails during deployment, manually verify:

```bash
forge verify-contract \
  0x5a3a45160494a2cf01df35683380f17b33d73e35 \
  src/BlackhornReader.sol:BlackhornReader \
  --chain-id 84532 \
  --constructor-args $(cast abi-encode "constructor(string)" "ipfs://your_book_metadata_uri_here")
```

Or using the legacy format:

```bash
forge verify-contract \
  --chain base-sepolia \
  --compiler-version v0.8.20+commit.a1b79de6 \
  0x5a3a45160494A2cf01dF35683380f17B33D73E35 \
  ./contracts/src/BlackhornReader.sol:BlackhornReader
```
```

### Backend Development

```bash
cd backend
pnpm install
pnpm dev
```

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
```

---

## 📝 Contract Features

The `BlackhornReader` contract implements:

- **ERC1155 Multi-Token**: Books and reward badges
- **Lending System**: Lend books to other wallets with time limits
- **Review Rewards**: Claim BASIC badges (soulbound) for leaving reviews
- **Rare Badge Upgrade**: Burn your book to upgrade to RARE badge
- **Transfer Rules**: Prevents transfers during active lending, BASIC badges are soulbound

---

## 💡 Vision

Blackhorn Reader reimagines digital publishing as an interactive, ownable reading experience powered by blockchain.  
Readers can lend, review, and burn tokenized stories — creating a decentralized library built by its readers.

---

## 🔗 Resources

- [Base Documentation](https://docs.base.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## 🪶 License

© 2025 La'Tarsha Blackhorn  
A Web3-native publication initiative.

# 🦋 Blackhorn Reader

> **A complete full-stack Web3 dApp built as a learning project**  
> Smart Contracts • Backend API • Frontend UI • Production Deployment

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Purpose](https://img.shields.io/badge/Purpose-Learning%20Project-blue?style=for-the-badge)
![Network](https://img.shields.io/badge/Network-Base%20Sepolia-purple?style=for-the-badge)

**🎓 Learning Achievement Unlocked: Full-Stack Web3 Development**

This project successfully demonstrates end-to-end blockchain application development,  
from smart contract creation to production deployment. Mission accomplished! ✅

[View Contract](https://base-sepolia.blockscout.com/address/0x5a3a45160494A2cf01dF35683380f17B33D73E35) • [Deployment Guide](DEPLOYMENT_GUIDE.md) • [Architecture](#-the-development-journey)

</div>

---

## 📖 Project Overview

Blackhorn Reader is a **Web3-native reading platform** where users can purchase, lend, and review digital books as NFTs. This project demonstrates a complete full-stack blockchain application from development to production deployment.

**What This Project Demonstrates:**
- ✅ Smart contract development with Solidity & Foundry
- ✅ ERC-1155 multi-token standard implementation
- ✅ Backend API with Express, TypeScript & Prisma
- ✅ Modern frontend with Next.js, React & Web3 integration
- ✅ Full production deployment (Vercel + Railway)
- ✅ Database design and management (SQLite → PostgreSQL)
- ✅ Blockchain interaction with ethers.js

---

## 🚀 Live Deployment

### Base Sepolia Testnet
- **Contract Address**: [`0x5a3a45160494A2cf01dF35683380f17B33D73E35`](https://base-sepolia.blockscout.com/address/0x5a3a45160494A2cf01dF35683380f17B33D73E35)
- **Network**: Base Sepolia (Chain ID: 84532)
- **Verified**: ✅ Yes on BaseScan & Blockscout
- **Compiler**: Solidity v0.8.20+commit.a1b79de6
- **Deployment Tx**: [`0x4df05...9b49ad`](https://sepolia.basescan.org/tx/0x4df05da79e1f17bec675d56687196c0db62cfb391dc4723de542f81c869b49ad)

### Production Infrastructure
- **Frontend**: Deployed on Vercel (Next.js)
- **Backend**: Deployed on Railway (Express API)
- **Database**: PostgreSQL on Supabase
- **Blockchain**: Base Sepolia Testnet

---

## 🛤 The Development Journey

### Phase 1: Smart Contract Development
**Goal**: Create an ERC-1155 contract for book NFTs with lending and rewards

1. **Setup Foundry Environment**
   ```bash
   forge init contracts
   cd contracts
   forge install OpenZeppelin/openzeppelin-contracts
   ```

2. **Implemented Core Features**
   - ERC-1155 multi-token standard for books and badges
   - Purchase system with customizable pricing
   - Time-based lending mechanism
   - Review rewards (BASIC badges - soulbound NFTs)
   - Rare badge upgrades (burn book to upgrade)
   - Transfer restrictions during active loans

3. **Testing & Deployment**
   ```bash
   forge test                    # Comprehensive test suite
   forge build                   # Compile contracts
   forge script script/Deploy.s.sol --broadcast --verify
   ```

4. **Contract Verification**
   - Deployed to Base Sepolia: `0x5a3a45160494A2cf01dF35683380f17B33D73E35`
   - Verified on BaseScan and Blockscout
   - All functions tested and working

---

### Phase 2: Backend API Development
**Goal**: Build a REST API to track purchases, reviews, and book metadata

1. **Tech Stack Selection**
   - **Runtime**: Node.js with TypeScript
   - **Framework**: Express.js
   - **ORM**: Prisma
   - **Database**: SQLite (dev) → PostgreSQL (production)
   - **Security**: JWT auth, Helmet.js, rate limiting, CORS

2. **Database Schema Design**
   ```prisma
   model Book { id, title, author, description, imageUrl, ipfsHash }
   model Purchase { bookId, buyerAddress, amount, txHash, timestamp }
   model Review { bookId, reviewerAddress, rating, comment }
   model User { walletAddress, books, reviews, createdAt }
   ```

3. **API Endpoints Implemented**
   - `GET/POST /api/books` - Book catalog management
   - `GET/POST /api/purchases` - Purchase tracking
   - `GET/POST /api/reviews` - Review system
   - `POST /api/auth/login` - Wallet authentication
   - `GET /api/purchases/stats` - Analytics

4. **Local Development**
   ```bash
   cd backend
   pnpm install
   pnpm prisma migrate dev
   pnpm dev                     # Server on http://localhost:3001
   ```

5. **Production Deployment (Railway)**
   - Configured `railway.json` and `nixpacks.toml`
   - Set environment variables (JWT_SECRET, DATABASE_URL, FRONTEND_URL)
   - Connected PostgreSQL database on Supabase
   - Deployed with automatic migrations

---

### Phase 3: Frontend Development
**Goal**: Build a user-friendly Web3 interface for book browsing and purchasing

1. **Tech Stack**
   - **Framework**: Next.js 14 (App Router)
   - **Styling**: Tailwind CSS
   - **Web3**: wagmi, viem, WalletConnect
   - **State**: React hooks & context

2. **Key Features Implemented**
   - 👛 **Wallet Connection**: WalletConnect integration with MetaMask, Coinbase Wallet, etc.
   - 📚 **Book Browsing**: Grid view with book cards, prices, and metadata
   - 💳 **Purchase Flow**: Buy books with ETH, transaction tracking, success notifications
   - 📚 **My Collection**: View owned books and lending status
   - ⭐ **Review System**: Rate and review books after purchase
   - 🏆 **Badge System**: Claim BASIC badges for reviews, upgrade to RARE
   - 📊 **Stats Dashboard**: Purchase analytics and user stats

3. **Web3 Integration**
   ```typescript
   // Contract interaction with wagmi
   const { writeContract } = useWriteContract()
   writeContract({
     address: CONTRACT_ADDRESS,
     abi: BlackhornReaderABI,
     functionName: 'purchaseBook',
     args: [bookId],
     value: parseEther(price)
   })
   ```

4. **Local Development**
   ```bash
   cd frontend
   pnpm install
   pnpm dev                     # App on http://localhost:3000
   ```

5. **Production Deployment (Vercel)**
   - Connected GitHub repository
   - Configured environment variables
   - Set root directory to `frontend/`
   - Auto-deploy on push to main

---

### Phase 4: Integration & Testing
**Goal**: Connect all three layers and ensure everything works together

1. **Contract ↔ Backend Integration**
   - Backend listens for blockchain events
   - Validates transactions on-chain
   - Syncs purchase data to database

2. **Backend ↔ Frontend Integration**
   - API client with fetch wrappers
   - Error handling and loading states
   - CORS configuration for cross-origin requests

3. **End-to-End Testing**
   - Connected wallet to Base Sepolia
   - Purchased books with test ETH
   - Verified purchases in database
   - Tested lending and review features
   - Claimed badges successfully

---

### Phase 5: Production Deployment
**Goal**: Deploy all components to production infrastructure

1. **Database Migration**
   - Created Supabase PostgreSQL instance
   - Ran production migrations
   - Updated connection strings

2. **Backend Deployment (Railway)**
   - Pushed to GitHub
   - Connected Railway to repository
   - Set environment variables
   - Configured build commands
   - Got production URL: `https://blackhorn-reader-production.up.railway.app`

3. **Frontend Deployment (Vercel)**
   - Connected GitHub repository
   - Set root directory to `frontend/`
   - Configured environment variables:
     - `NEXT_PUBLIC_CONTRACT_ADDRESS`
     - `NEXT_PUBLIC_API_URL`
     - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - Deployed: `https://blackhorn-reader.vercel.app`

4. **CORS Configuration**
   - Updated backend to allow Vercel domain
   - Tested cross-origin API calls
   - Verified authentication works

---

## 📚 Project Structure

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

## 🚀 Quick Start Guide

### Prerequisites
```bash
# Install dependencies
brew install foundry    # Smart contract tooling
brew install node       # JavaScript runtime
npm install -g pnpm     # Package manager
```

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/blackhorn-reader.git
cd blackhorn-reader
```

### 2. Smart Contracts
```bash
cd contracts
forge install              # Install dependencies
forge build                # Compile contracts
forge test                 # Run tests

# Deploy to Base Sepolia
cp .env.example .env      # Add your PRIVATE_KEY and RPC_URL
forge script script/Deploy.s.sol --broadcast --verify
```

### 3. Backend
```bash
cd ../backend
pnpm install              # Install dependencies
cp .env.example .env      # Configure environment
pnpm prisma migrate dev   # Setup database
pnpm dev                  # Start server (http://localhost:3001)
```

### 4. Frontend
```bash
cd ../frontend
pnpm install              # Install dependencies
cp .env.example .env.local # Configure environment
pnpm dev                  # Start app (http://localhost:3000)
```

### 5. Test the App
1. Open http://localhost:3000
2. Connect your wallet (MetaMask + Base Sepolia)
3. Get test ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
4. Browse books, make a purchase, write reviews!

---

## 🎯 Key Learnings & Takeaways

### Technical Skills Gained
1. **Blockchain Development**
   - Smart contract design patterns (ERC-1155, access control, events)
   - Solidity security best practices (reentrancy guards, transfer restrictions)
   - Testing with Foundry (unit tests, integration tests, fork testing)
   - Contract deployment and verification on Base network

2. **Backend Development**
   - RESTful API design with Express
   - Database modeling with Prisma ORM
   - JWT authentication for Web3 wallets
   - Security middleware (rate limiting, CORS, Helmet)
   - Migration from SQLite to PostgreSQL

3. **Frontend Development**
   - Next.js 14 App Router architecture
   - Web3 wallet integration with wagmi & viem
   - Real-time blockchain data fetching
   - Transaction state management
   - Responsive UI with Tailwind CSS

4. **DevOps & Deployment**
   - Monorepo management with pnpm workspaces
   - CI/CD with Vercel and Railway
   - Environment variable management across platforms
   - Database migrations in production
   - CORS and cross-origin configuration

### Challenges Overcome
1. **Web3 Integration Complexity**
   - Learned to handle transaction states (pending, success, failure)
   - Implemented proper wallet connection flows
   - Managed gas estimation and transaction retries

2. **State Synchronization**
   - Kept blockchain state in sync with backend database
   - Handled eventual consistency between on-chain and off-chain data
   - Implemented proper error handling for failed transactions

3. **Production Deployment**
   - Configured build systems for TypeScript projects
   - Set up proper environment variables across platforms
   - Managed database migrations without downtime
   - Debugged CORS issues between frontend and backend

4. **Testing Across Layers**
   - Smart contract unit tests with Foundry
   - Backend API testing with proper mocking
   - Frontend integration testing with test wallets
   - End-to-end testing on Base Sepolia testnet

### Architecture Decisions

**Why ERC-1155?**
- Supports both books (transferable) and badges (soulbound)
- Gas-efficient batch operations
- Single contract for all token types

**Why Separate Backend?**
- Off-chain data storage (book metadata, reviews)
- Better user experience (fast queries)
- Analytics and aggregated statistics
- Authentication layer for protected actions

**Why Base Network?**
- Low gas fees compared to Ethereum mainnet
- Fast block times (~2 seconds)
- Coinbase-backed with strong ecosystem
- Easy faucet access for testing

**Why This Tech Stack?**
- **Foundry**: Best-in-class Solidity tooling
- **Next.js**: SEO-friendly, great DX, edge-ready
- **Prisma**: Type-safe database access
- **pnpm**: Fast, disk-efficient package manager
- **Vercel/Railway**: Zero-config deployments

---

## 📝 Contract Features

The `BlackhornReader` contract implements:

- **ERC1155 Multi-Token**: Books and reward badges
- **Book Purchases**: Purchase books with crypto (ETH) directly on-chain
- **Flexible Pricing**: Owner can set custom prices for each book
- **Lending System**: Lend books to other wallets with time limits
- **Review Rewards**: Claim BASIC badges (soulbound) for leaving reviews
- **Rare Badge Upgrade**: Burn your book to upgrade to RARE badge
- **Transfer Rules**: Prevents transfers during active lending, BASIC badges are soulbound

---

## 🛒 Purchasing Books

### Smart Contract

Users can purchase books directly using the `purchaseBook` function:

```solidity
// Purchase a book by paying the set price
function purchaseBook(uint256 bookId) external payable
```

**Features:**
- Automatically mints the book NFT to the buyer
- Transfers payment to the contract owner
- Emits `BookPurchased` event for tracking
- Default price: 0.001 ETH (customizable by owner)

**Owner Functions:**
```solidity
// Set or update book price
function setBookPrice(uint256 bookId, uint256 price) external onlyOwner

// View current price
function bookPrices(uint256 bookId) public view returns (uint256)
```

### Backend API

The backend tracks all purchases via `/api/purchases`:

**Endpoints:**
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/book/:bookId` - Get purchases for a specific book
- `GET /api/purchases/user/:address` - Get purchases by a specific user
- `POST /api/purchases` - Record a new purchase (called automatically by frontend)
- `GET /api/purchases/stats` - Get purchase statistics

**Example Response:**
```json
{
  "id": "0xabc...123-1234567890",
  "bookId": 1,
  "buyerAddress": "0x123...",
  "amount": "1000000000000000",
  "txHash": "0xabc...123",
  "timestamp": "2025-11-05T18:30:00.000Z",
  "book": {
    "id": 1,
    "title": "Sample Book",
    "author": "Author Name"
  }
}
```

### Frontend

The `BookCard` component displays:
- Book price in ETH
- Purchase button (when not owned)
- Transaction status with loading states
- Success notifications

Users who don't own a book will see the purchase option with real-time pricing from the blockchain.

---

## 📊 Project Metrics

**Lines of Code**:
- Smart Contracts: ~300 lines (Solidity)
- Backend: ~1,500 lines (TypeScript)
- Frontend: ~2,000 lines (TypeScript/React)

**Development Time**: ~2-3 weeks

**Features Implemented**:
- 1 Smart Contract (BlackhornReader.sol)
- 8 API Endpoints
- 12 Frontend Components
- 4 Database Models
- Full Authentication System
- Complete Purchase Flow
- Review & Badge System

**Testing Coverage**:
- Smart Contract: Comprehensive Foundry tests
- Backend: Manual API testing
- Frontend: End-to-end user testing

---

## 👁 Vision & Future Improvements

### Current State
Blackhorn Reader successfully demonstrates a complete full-stack Web3 application. All core features work:
- ✅ Book purchasing with crypto
- ✅ Lending system
- ✅ Review and rating system
- ✅ Badge rewards (soulbound NFTs)
- ✅ User collections
- ✅ Production deployment

### Potential Enhancements (If Continued)
1. **IPFS Integration**: Store book content on IPFS for true decentralization
2. **Book Reading Interface**: In-app reader with progress tracking
3. **Social Features**: Follow authors, share reviews, book clubs
4. **Advanced Lending**: Rental marketplace with automatic returns
5. **Author Dashboard**: Self-publishing tools for authors
6. **Mobile App**: React Native version for iOS/Android
7. **Mainnet Deployment**: Move from testnet to Base mainnet
8. **Royalty System**: Author earnings from secondary sales
9. **Multi-chain Support**: Expand to other EVM chains
10. **Advanced Analytics**: User reading habits, popular books, trends

### Why This Was a Learning Project
This project was built to **prove I could successfully deploy a full-stack Web3 application**. Mission accomplished! ✅

The primary goal was to:
- Learn the complete Web3 development lifecycle
- Understand smart contract deployment and verification
- Build production-ready APIs and frontends
- Deploy to real infrastructure (not just localhost)
- Gain confidence in blockchain development

**Result**: Successfully deployed a working dApp with real transactions on Base Sepolia.

---

## 📦 Archiving This Project

This project served its purpose as a learning exercise and proof-of-concept. It demonstrates:
- ✅ Full-stack development capabilities
- ✅ Web3/blockchain integration skills
- ✅ Production deployment experience
- ✅ End-to-end project completion

The code remains public as a portfolio piece and reference for future Web3 projects.

---

## 🔗 Resources & Documentation

### Official Documentation
- [Base Documentation](https://docs.base.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh/)
- [Prisma Docs](https://www.prisma.io/docs)

### Deployment Platforms
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting
- [Supabase](https://supabase.com/) - PostgreSQL database
- [WalletConnect Cloud](https://cloud.walletconnect.com/) - Wallet integration

### Tools Used
- [Foundry](https://getfoundry.sh/) - Smart contract development
- [pnpm](https://pnpm.io/) - Package management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) - Test ETH

---

## 📝 Additional Documentation

This repository includes detailed documentation for various aspects:
- `DEPLOYMENT_GUIDE.md` - Complete production deployment steps
- `frontend/VERCEL_DEPLOY.md` - Frontend deployment guide
- `backend/RAILWAY_SETUP.md` - Backend security and deployment
- `WARP.md` - Development environment setup
- `INTEGRATION.md` - System integration details

---

## 🚀 Get Started

Interested in running this project? Follow the **Quick Start Guide** above or check out the detailed deployment documentation.

Want to build something similar? Feel free to fork this repo and use it as a starting point!

---

## ✨ Acknowledgments

Built as a solo learning project to explore:
- Smart contract development with Solidity
- Full-stack Web3 application architecture
- Modern frontend frameworks (Next.js, React)
- Backend API design with TypeScript
- Production deployment workflows

Special thanks to the open-source community for the excellent tooling and documentation.

---

## 🪶 License

© 2025 La'Tarsha Blackhorn  
Built as a learning project and portfolio piece.  
Code available for reference and educational purposes.

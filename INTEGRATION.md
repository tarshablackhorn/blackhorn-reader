# Blackhorn Reader - Integration Guide

## ✅ Completed Integration

Your full-stack dApp is now integrated with the following components working together:

### 1. Smart Contract (Base Sepolia)
- **Address**: `0x5a3a45160494A2cf01dF35683380f17B33D73E35`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Features**: Lending, reviews with Basic badge (soulbound), burn for Rare badge

### 2. Backend API (Port 3001)
**Endpoints**:
- `GET /api/books` - Fetch all books
- `GET /api/books/:id` - Fetch book by ID
- `GET /api/reviews` - Fetch reviews (with filters)
- `POST /api/reviews` - Submit review
- `GET /api/borrow-requests` - Fetch borrow requests
- `POST /api/borrow-requests` - Create borrow request
- `PATCH /api/borrow-requests/:id` - Update request status
- `DELETE /api/borrow-requests/:id` - Cancel request
- `GET /health` - Health check

### 3. Frontend (Next.js)
**Pages**:
- `/` - Browse books (fetches from backend)
- `/book/[id]` - Book details with reviews
- `/admin` - Owner dashboard for managing lending
- `/my-books` - User's borrowed books
- `/collection` - User's owned books
- `/reviews` - All reviews
- `/stats` - Stats page

**Key Components**:
- `BookCard` - Display book with borrow functionality
- `ReviewForm` - Submit reviews with on-chain badge claim
- `Providers` - Wagmi/RainbowKit configuration

---

## 🚀 How to Test the Integration

### Step 1: Start Backend
```bash
cd backend
pnpm dev
```
Backend runs on http://localhost:3001

### Step 2: Start Frontend
```bash
cd frontend
pnpm dev
```
Frontend runs on http://localhost:3000

### Step 3: Test Flow

#### For Regular Users:
1. **Connect Wallet** (Base Sepolia testnet)
2. **Browse Books** - View available books from backend
3. **Request to Borrow** - (Feature to be added in BookCard)
4. **Read & Review** - Once borrowed, write review and claim Basic badge
5. **Burn for Rare** - Optionally burn book to get Rare badge

#### For Owner (Contract Deployer):
1. **Connect Wallet** (must be contract owner)
2. **Access Admin** - Visit `/admin`
3. **Approve Requests** - Approve borrow requests (calls `lend()` on-chain)
4. **View History** - See all processed requests

---

## 🔄 Integration Flow

### Review & Badge Claiming
```
User → Review Form → Frontend validates
                    ↓
                    Calls contract.reviewAndClaimBasic(bookId, reviewHash)
                    ↓
                    Transaction confirmed
                    ↓
                    Sends review to backend API
                    ↓
                    Backend stores review in database
                    ↓
                    User receives soulbound Basic badge NFT
```

### Borrow Request Flow
```
User → Request borrow → Backend creates pending request
                       ↓
Owner sees request in /admin dashboard
                       ↓
Owner approves → Calls contract.lend(bookId, borrower, duration)
                       ↓
                       Transaction confirmed
                       ↓
                       Backend updates request status to 'approved'
                       ↓
                       User can now read book
```

---

## 🔧 Environment Setup

### Backend (.env)
```env
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=96f092d9e93cb25f1b46cb4e03be86fa
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5a3a45160494A2cf01dF35683380f17B33D73E35
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📋 Testing Checklist

- [x] Contract ABI extracted and placed in `frontend/lib/abi.json`
- [x] Environment variables configured
- [x] Backend API routes created and tested
- [x] Frontend fetches books from backend
- [x] Review submission integrates blockchain + backend
- [x] Borrow request system implemented
- [x] Owner dashboard created for lending management
- [ ] Test with Base Sepolia wallet
- [ ] Verify on-chain transactions
- [ ] Test full user journey

---

## 🎯 Next Steps

### Immediate Testing:
1. Run backend: `cd backend && pnpm dev`
2. Run frontend: `cd frontend && pnpm dev`
3. Connect wallet on Base Sepolia
4. Test borrow request flow
5. Test review submission
6. Test admin approval process

### Future Enhancements:
1. **Add Database** - Replace in-memory storage with PostgreSQL/MongoDB
2. **Request Borrow UI** - Add "Request Borrow" button to BookCard
3. **Notifications** - Add email/webhook notifications for requests
4. **Analytics** - Track user engagement and badge distribution
5. **IPFS Integration** - Store book content and metadata on IPFS
6. **Advanced Search** - Filter books by genre, author, availability
7. **User Profiles** - Show user's badges and reading history

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify pnpm dependencies are installed

### Frontend can't fetch data
- Ensure backend is running on port 3001
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

### Contract interactions fail
- Verify wallet is on Base Sepolia network
- Check contract address in .env.local
- Ensure wallet has test ETH for gas

### ABI errors
- Regenerate ABI: `cd contracts && forge build`
- Extract: `cat out/BlackhornReader.sol/BlackhornReader.json | jq '.abi' > ../frontend/lib/abi.json`

---

## 📚 Resources

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Contract on BaseScan](https://sepolia.basescan.org/address/0x5a3a45160494a2cf01df35683380f17b33d73e35)
- [Contract on Blockscout](https://base-sepolia.blockscout.com/address/0x5a3a45160494A2cf01dF35683380f17B33D73E35)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

---

**Status**: ✅ Ready for testing on Base Sepolia testnet!

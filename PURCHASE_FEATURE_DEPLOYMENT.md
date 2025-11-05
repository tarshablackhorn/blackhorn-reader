# Purchase Feature Deployment Guide

## ✅ Completed Changes

### 1. Smart Contract (`contracts/src/BlackhornReader.sol`)
- ✅ Added `purchaseBook()` payable function
- ✅ Added `setBookPrice()` owner function
- ✅ Added `bookPrices` mapping for price storage
- ✅ Added `BookPurchased` event
- ✅ Added error types: `InvalidPrice`, `InsufficientPayment`
- ✅ Default price set to 0.001 ETH

### 2. Backend (`backend/`)
- ✅ Updated Prisma schema with `Purchase` model
- ✅ Created `/api/purchases` route with full CRUD operations
- ✅ Registered route in `src/index.ts`

### 3. Frontend (`frontend/`)
- ✅ Updated `BookCard.tsx` component with purchase UI
- ✅ Added price display and purchase button
- ✅ Integrated transaction handling
- ✅ Updated contract ABI with new functions

### 4. Documentation
- ✅ Updated README.md with purchase feature documentation
- ✅ Created test suite (`contracts/test/Purchase.t.sol`)

---

## 🚀 Deployment Steps

### Step 1: Test the Smart Contract

From the `contracts/` directory:

```bash
cd contracts

# Run all tests including purchase tests
forge test

# Run only purchase tests with verbose output
forge test --match-contract PurchaseTest -vvv

# Check gas usage
forge test --gas-report
```

### Step 2: Deploy Updated Contract

**Option A: Deploy New Contract**

```bash
cd contracts

# Update .env with your private key and RPC URL
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base-sepolia \
  --broadcast \
  --verify

# Save the new contract address
```

**Option B: Upgrade Existing (if using proxy pattern)**
- Current contract: `0x5a3a45160494A2cf01dF35683380f17B33D73E35`
- Note: Current contract is NOT upgradeable, so you'll need to deploy a new one

### Step 3: Update Frontend Configuration

```bash
cd frontend

# Update .env.local with new contract address
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_NEW_ADDRESS" >> .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" >> .env.local
```

### Step 4: Run Database Migration

```bash
cd backend

# Generate Prisma client with new schema
pnpm prisma generate

# Create and apply migration
pnpm prisma migrate dev --name add_purchase_model

# Verify migration
pnpm prisma studio
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
pnpm dev
# Should start on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
# Should start on http://localhost:3000
```

### Step 6: Test the Feature

1. **Connect Wallet**: Use RainbowKit to connect with Base Sepolia
2. **Get Test ETH**: Use [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
3. **View Book**: Navigate to homepage, see book with price
4. **Purchase Book**: Click "🛒 Purchase Book" button
5. **Confirm Transaction**: Approve in wallet
6. **Verify Ownership**: After confirmation, should see borrowing options

---

## 🔍 Testing Checklist

- [ ] Contract compiles without errors
- [ ] All contract tests pass
- [ ] Database migration successful
- [ ] Backend API responds to `/api/purchases`
- [ ] Frontend displays book price
- [ ] Purchase transaction completes successfully
- [ ] Backend records purchase in database
- [ ] User receives book NFT
- [ ] Owner receives payment
- [ ] BookCard updates to show ownership
- [ ] Can review/lend after purchase

---

## 🛠 Owner Functions

As contract owner, you can update book prices:

```javascript
// Using ethers.js or viem
const tx = await contract.setBookPrice(
  1, // bookId
  parseEther("0.002") // new price (0.002 ETH)
);
await tx.wait();
```

Or via cast (Foundry):
```bash
cast send $CONTRACT_ADDRESS \
  "setBookPrice(uint256,uint256)" \
  1 2000000000000000 \
  --rpc-url base-sepolia \
  --private-key $PRIVATE_KEY
```

---

## 📊 Monitoring

### Check Purchase Stats

```bash
# Get all purchases
curl http://localhost:3001/api/purchases

# Get purchase stats
curl http://localhost:3001/api/purchases/stats

# Get purchases for specific user
curl http://localhost:3001/api/purchases/user/0xYourAddress
```

### On-Chain Events

Monitor the `BookPurchased` event:
```solidity
event BookPurchased(
  address indexed buyer,
  uint256 indexed bookId,
  uint256 price
);
```

Use Blockscout or BaseScan to view events.

---

## 🐛 Troubleshooting

### Contract Issues
- **"InvalidPrice" error**: Book price not set or is 0
- **"InsufficientPayment" error**: Sent value < book price
- **"Payment transfer failed"**: Owner address issue

### Backend Issues
- **Prisma errors**: Run `pnpm prisma generate` and `pnpm prisma migrate dev`
- **Route not found**: Ensure `purchasesRouter` imported in `index.ts`
- **Database locked**: Close Prisma Studio if running

### Frontend Issues
- **ABI errors**: Verify `abi.json` includes `purchaseBook` function
- **Price not showing**: Check contract address in `.env.local`
- **Transaction fails**: Ensure sufficient ETH for gas + book price

---

## 📝 Notes

- Current default price: **0.001 ETH** (~$3-4 USD depending on ETH price)
- Recommended testnet: **Base Sepolia** (Chain ID: 84532)
- All purchases are recorded both on-chain and in the database
- Users can purchase multiple copies of the same book
- Payment goes directly to contract owner's address

---

## 🎯 Future Enhancements

Consider implementing:
- [ ] Bulk purchase discounts
- [ ] Limited edition books (max supply)
- [ ] Dynamic pricing based on demand
- [ ] Royalty distribution for authors
- [ ] Secondary market / resale functionality
- [ ] Gift book functionality
- [ ] Subscription model for unlimited access

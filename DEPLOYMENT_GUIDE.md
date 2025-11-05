# Production Deployment Guide

Complete step-by-step guide to deploy Blackhorn Reader to production.

---

## Prerequisites

- [ ] GitHub account with repo pushed
- [ ] Vercel account (free tier works)
- [ ] Railway or Render account (free tier works)
- [ ] Supabase account (recommended for database)
- [ ] ETH on Base mainnet for contract deployment (~$20-50 for gas)
- [ ] WalletConnect project ID
- [ ] Etherscan/BaseScan API key for contract verification

---

## Step 1: Set Up Production Database (Supabase)

### 1.1 Create Supabase Project

```bash
# Go to: https://supabase.com/dashboard
# Click "New Project"
# Project name: blackhorn-reader-prod
# Database password: [generate strong password]
# Region: Choose closest to your users
```

### 1.2 Get Database Connection String

```bash
# In Supabase Dashboard:
# Settings → Database → Connection string → URI
# Copy the connection string (looks like):
# postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 1.3 Update Backend for PostgreSQL

```bash
cd /Users/tarshablackhorn/blackhorn-reader/backend

# Update DATABASE_URL in .env (for local testing)
echo "DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" >> .env

# Run migration on production database
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Install Railway CLI (optional)

```bash
npm install -g @railway/cli
railway login
```

### 2.2 Deploy via Dashboard (Recommended)

```bash
# Go to: https://railway.app/new
# Click "Deploy from GitHub repo"
# Select: blackhorn-reader repository
# Root directory: /backend
```

### 2.3 Configure Railway Environment Variables

In Railway dashboard, add these variables:

```
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
PORT=3001
NODE_ENV=production
```

### 2.4 Configure Build Settings

```
Build Command: pnpm install && pnpm prisma generate && pnpm build
Start Command: pnpm start
Root Directory: backend
```

### 2.5 Get Backend URL

After deployment, Railway will give you a URL like:
```
https://blackhorn-reader-production.up.railway.app
```

Save this URL for frontend configuration.

---

## Step 3: Deploy Contract to Base Mainnet

### 3.1 Prepare Environment

```bash
cd /Users/tarshablackhorn/blackhorn-reader/contracts

# Update .env with mainnet settings
cat > .env << 'EOF'
PRIVATE_KEY="your_private_key_with_eth_on_base_mainnet"
BASE_MAINNET_RPC="https://mainnet.base.org"
BOOK_URI="ipfs://your_book_metadata_uri"
ETHERSCAN_API_KEY="your_basescan_api_key"
EOF
```

### 3.2 Get Base Mainnet ETH

```bash
# Bridge ETH to Base mainnet:
# https://bridge.base.org/
# Need ~0.01 ETH for deployment + gas
```

### 3.3 Test Deployment (Dry Run)

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_MAINNET_RPC \
  --private-key $PRIVATE_KEY \
  --verify
```

### 3.4 Deploy to Mainnet

```bash
# IMPORTANT: This costs real ETH!
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_MAINNET_RPC \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY

# Save the deployed contract address from output
# Example: 0x1234567890abcdef1234567890abcdef12345678
```

### 3.5 Verify on BaseScan

If auto-verification fails:

```bash
forge verify-contract \
  [YOUR_CONTRACT_ADDRESS] \
  src/BlackhornReader.sol:BlackhornReader \
  --chain-id 8453 \
  --constructor-args $(cast abi-encode "constructor(string)" "ipfs://your_book_metadata_uri") \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Connect GitHub Repository

```bash
# Go to: https://vercel.com/new
# Import your repository: blackhorn-reader
# Framework Preset: Next.js
# Root Directory: frontend
```

### 4.2 Configure Build Settings

```
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
Root Directory: frontend
```

### 4.3 Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=[mainnet_contract_address_from_step_3]
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=[your_walletconnect_project_id]
NEXT_PUBLIC_API_URL=https://blackhorn-reader-production.up.railway.app
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
```

### 4.4 Get WalletConnect Project ID

```bash
# Go to: https://cloud.walletconnect.com/
# Create new project
# Copy Project ID
```

### 4.5 Deploy

```bash
# Click "Deploy" in Vercel
# Wait for build to complete
# Your app will be live at: https://blackhorn-reader.vercel.app
```

---

## Step 5: Update CORS in Backend

### 5.1 Update Backend CORS Configuration

```bash
cd /Users/tarshablackhorn/blackhorn-reader/backend

# Update src/index.ts to allow production frontend
```

Edit `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://blackhorn-reader.vercel.app', // Add your Vercel URL
    'https://your-custom-domain.com' // If you have custom domain
  ],
  credentials: true
}));
```

### 5.2 Redeploy Backend

```bash
# Commit and push changes
git add backend/src/index.ts
git commit -m "Update CORS for production"
git push

# Railway will auto-redeploy
```

---

## Step 6: Update Backend Contract Address

### 6.1 Update Backend to Use Mainnet Contract

```bash
cd /Users/tarshablackhorn/blackhorn-reader/backend

# Add to .env in Railway
CONTRACT_ADDRESS=[mainnet_contract_address]
BASE_RPC_URL=https://mainnet.base.org
CHAIN_ID=8453
```

---

## Step 7: Final Testing

### 7.1 Test Production App

```bash
# Visit: https://blackhorn-reader.vercel.app

# Test checklist:
# - [ ] Connect wallet (use Base mainnet)
# - [ ] View books with prices
# - [ ] Purchase a book (costs real ETH!)
# - [ ] Verify backend records purchase
# - [ ] Borrow a book
# - [ ] Write a review
# - [ ] Claim badge
# - [ ] Check My Collection
```

### 7.2 Monitor Backend Logs

```bash
# In Railway dashboard:
# Click your service → Logs
# Watch for any errors
```

### 7.3 Check Database

```bash
# In Supabase dashboard:
# Table Editor → View purchases, reviews, books
```

---

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Frontend Custom Domain

```bash
# In Vercel:
# Settings → Domains → Add Domain
# Example: reader.blackhorn.io
# Follow DNS setup instructions
```

### 8.2 Backend Custom Domain

```bash
# In Railway:
# Settings → Domains → Add Custom Domain
# Example: api.blackhorn.io
# Update NEXT_PUBLIC_API_URL in Vercel
```

---

## Cost Estimates

### One-Time Costs
- Contract deployment: ~0.01 ETH ($30-40 USD)
- Contract verification: Free

### Monthly Costs
- Vercel: Free (Hobby tier)
- Railway: Free up to $5/month usage
- Supabase: Free up to 500MB database
- **Total: $0-5/month** (free tier limits)

### Upgrade Needed When
- More than 100GB bandwidth (Vercel)
- Database > 500MB (Supabase)
- Backend CPU usage high (Railway)

---

## Production Checklist

- [ ] Database: Supabase project created
- [ ] Database: Connection string obtained
- [ ] Database: Migrations run successfully
- [ ] Backend: Deployed to Railway
- [ ] Backend: Environment variables set
- [ ] Backend: Health check returns 200
- [ ] Contract: Deployed to Base mainnet
- [ ] Contract: Verified on BaseScan
- [ ] Contract: Address saved and documented
- [ ] Frontend: Deployed to Vercel
- [ ] Frontend: Environment variables set
- [ ] Frontend: Connects to backend successfully
- [ ] Frontend: Connects to mainnet contract
- [ ] CORS: Backend allows frontend domain
- [ ] Testing: Can connect wallet
- [ ] Testing: Can view books
- [ ] Testing: Can purchase book
- [ ] Testing: Backend records purchase
- [ ] Monitoring: Backend logs accessible
- [ ] Monitoring: Database accessible

---

## Rollback Plan

If something goes wrong:

### Rollback Frontend
```bash
# In Vercel dashboard:
# Deployments → Find previous working deployment → Promote to Production
```

### Rollback Backend
```bash
# In Railway:
# Deployments → Click previous deployment → Redeploy
```

### Rollback Database
```bash
# In Supabase:
# Database → Backups → Restore from backup
```

### Contract Issues
- Cannot rollback deployed contracts
- Must deploy new contract if critical bug found
- Update frontend/backend with new address

---

## Environment Variables Reference

### Frontend (.env.local → Vercel)
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[mainnet_address]
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
```

### Backend (.env → Railway)
```
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
CONTRACT_ADDRESS=0x[mainnet_address]
BASE_RPC_URL=https://mainnet.base.org
CHAIN_ID=8453
```

### Contracts (.env → Local only)
```
PRIVATE_KEY=0x...
BASE_MAINNET_RPC=https://mainnet.base.org
BOOK_URI=ipfs://...
ETHERSCAN_API_KEY=...
```

---

## Troubleshooting

### Frontend Build Fails
```bash
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues

# Fix:
cd frontend
pnpm install
pnpm build # Test locally first
```

### Backend Won't Start
```bash
# Check Railway logs for:
# - Database connection errors
# - Missing environment variables
# - Prisma migration issues

# Fix:
pnpm prisma migrate deploy
pnpm prisma generate
```

### Contract Deployment Fails
```bash
# Common issues:
# - Insufficient ETH for gas
# - Wrong RPC URL
# - Invalid private key

# Check balance:
cast balance [YOUR_ADDRESS] --rpc-url https://mainnet.base.org
```

### CORS Errors
```bash
# Update backend/src/index.ts
# Add your Vercel URL to cors origin array
# Commit and push to redeploy
```

---

## Security Considerations

### Before Going Live

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong database passwords
   - Rotate API keys regularly

2. **Smart Contract**
   - Consider audit (recommended for mainnet)
   - Test all functions on testnet first
   - Have pause mechanism for emergencies

3. **Backend**
   - Enable rate limiting
   - Validate all inputs
   - Log security events

4. **Frontend**
   - Only request necessary wallet permissions
   - Validate contract addresses
   - Show clear transaction details to users

---

## Monitoring & Maintenance

### Set Up Monitoring

```bash
# Railway: Enable log drains
# Vercel: Check Analytics dashboard
# Supabase: Enable Database Webhooks
```

### Regular Maintenance

- Weekly: Check error logs
- Monthly: Review database size
- Monthly: Check API usage
- Quarterly: Update dependencies

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
- Base Docs: https://docs.base.org
- Foundry Docs: https://book.getfoundry.sh

---

**Ready to deploy!** Start with Step 1 and work through sequentially.

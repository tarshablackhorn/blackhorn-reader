# Blackhorn Reader - Deployment Guide

## 🚀 Quick Deploy

### Step 1: Deploy Backend (Railway)

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose: `tarshablackhorn/blackhorn-reader`
6. Click **"Add variables"** and set:
   ```
   DATABASE_URL=file:./prisma/dev.db
   PORT=3001
   ```
7. In **Settings**:
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `pnpm start`
   - Set **Build Command**: `pnpm install && pnpm prisma generate && pnpm build`
8. Click **"Deploy"**
9. Wait for deployment to complete
10. **Copy your Railway URL** (e.g., `https://blackhorn-backend.up.railway.app`)

### Step 2: Seed Database on Railway

After backend is deployed, run these commands in Railway's terminal:

```bash
pnpm prisma migrate deploy
pnpm db:seed
```

### Step 3: Deploy Frontend (Vercel)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. Click **"Add New Project"**
4. Select: `tarshablackhorn/blackhorn-reader`
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
6. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=96f092d9e93cb25f1b46cb4e03be86fa
   NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x5a3a45160494A2cf01dF35683380f17B33D73E35
   NEXT_PUBLIC_API_URL=<YOUR_RAILWAY_URL>
   ```
   ⚠️ Replace `<YOUR_RAILWAY_URL>` with your actual Railway backend URL from Step 1

7. Click **"Deploy"**
8. Wait for deployment to complete
9. **Get your live URL** (e.g., `https://blackhorn-reader.vercel.app`)

### Step 4: Update Backend CORS

After frontend is deployed:

1. Go to your Railway project
2. Add environment variable:
   ```
   FRONTEND_URL=<YOUR_VERCEL_URL>
   ```
3. Railway will auto-redeploy

Or manually update `backend/src/index.ts` and push:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://blackhorn-reader.vercel.app'  // Your Vercel URL
  ]
}));
```

### Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Connect your wallet
3. Browse books
4. Test purchasing, borrowing, reviewing
5. Verify everything works on Base Sepolia testnet

## 🔧 Troubleshooting

### Backend Issues
- **Build fails**: Check Railway logs, ensure all dependencies are installed
- **Database errors**: Run migrations: `pnpm prisma migrate deploy`
- **Port issues**: Railway auto-assigns port, don't hardcode

### Frontend Issues
- **API calls fail**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Build fails**: Check Vercel logs, ensure Node version is compatible
- **Environment variables**: Must start with `NEXT_PUBLIC_` for client-side access

### Network Issues
- **Wrong network**: Contract is on Base Sepolia (Chain ID: 84532)
- **No testnet ETH**: Get from Base Sepolia faucet
- **Transaction fails**: Check you're on correct network

## 📊 Monitor Deployments

### Railway
- View logs in Railway dashboard
- Monitor database size
- Check API response times

### Vercel
- View build logs in Vercel dashboard
- Monitor function invocations
- Check Core Web Vitals

## 💰 Costs

**Free Tier**:
- Railway: $5 credit/month
- Vercel: Free for hobby projects
- **Total**: Free for low traffic

**Estimated Monthly (Production)**:
- Railway: $5-20
- Vercel: $0-20
- **Total**: $5-40/month

## 🔄 Updates

To deploy updates:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Both Railway and Vercel auto-deploy on push to main!
```

## 🎯 Next Steps

1. ✅ Backend deployed
2. ✅ Frontend deployed
3. ✅ Database seeded
4. ✅ CORS configured
5. ✅ App is live!

Now test thoroughly and share with users! 🎉

## 📝 Live URLs

After deployment, update these in your README:

- **Frontend**: https://blackhorn-reader.vercel.app
- **Backend**: https://blackhorn-backend.up.railway.app
- **Contract**: 0x5a3a45160494A2cf01dF35683380f17B33D73E35 (Base Sepolia)

# Railway Deployment Security Setup

## Required Environment Variables

After deploying to Railway, you must set these environment variables in your project settings:

### 1. JWT_SECRET (CRITICAL)
Generate a secure random string for JWT token signing:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add it as `JWT_SECRET` in Railway.

### 2. FRONTEND_URL
Set this to your frontend's production URL:

```
FRONTEND_URL=https://your-frontend-domain.com
```

For multiple allowed origins (e.g., staging + production), use comma-separated values:

```
FRONTEND_URL=https://your-frontend.com,https://staging.your-frontend.com
```

### 3. DATABASE_URL
Railway should auto-configure this if you're using Railway's PostgreSQL. If using external database:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 4. NODE_ENV
```
NODE_ENV=production
```

## Setting Environment Variables in Railway

1. Go to your project in Railway dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add each variable listed above

## Security Features Implemented

✅ **JWT Authentication** - Wallet-based authentication with JWT tokens  
✅ **Rate Limiting** - 100 requests per 15 minutes per IP (5 for auth endpoints)  
✅ **CORS Protection** - Only allows requests from configured frontend URLs  
✅ **Helmet.js** - Security headers (XSS, clickjacking, etc.)  
✅ **Input Validation** - All inputs are validated and sanitized  
✅ **HTTPS** - Railway provides this automatically  

## Testing Locally

Before deploying, test with production-like settings:

```bash
# In backend/.env
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_generated_secret

# Run
pnpm dev
```

## Auth Endpoints

### POST /api/auth/login
Authenticate with wallet address:

```json
{
  "walletAddress": "0x..."
}
```

Returns JWT token valid for 7 days.

### POST /api/auth/verify
Verify token validity:

```
Authorization: Bearer <token>
```

## Protecting Routes

To protect a route, use the `authenticateToken` middleware:

```typescript
import { authenticateToken, AuthRequest } from '../middleware/auth';

router.post('/protected-route', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const walletAddress = req.user?.walletAddress;
  // ... handle request
});
```

## Rate Limit Customization

Edit `src/index.ts` to adjust rate limits:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window
  max: 100, // Max requests per window
});
```

## Custom Domain Setup (Optional)

1. In Railway, go to Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. Update `FRONTEND_URL` to allow your production frontend domain

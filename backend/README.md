# Blackhorn Reader Backend API

RESTful API for the Blackhorn Reader application.

## Features

- **Book Management**: Get book metadata
- **Review System**: Submit and retrieve book reviews
- **CORS enabled**: Works with frontend on different port

## Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **In-memory storage** (ready for database integration)

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

Server runs on `http://localhost:3001`

### Build for Production
```bash
pnpm build
pnpm start
```

## API Endpoints

### Books

#### GET /api/books
Get all books
```bash
curl http://localhost:3001/api/books
```

#### GET /api/books/:id
Get a specific book by ID
```bash
curl http://localhost:3001/api/books/1
```

### Reviews

#### GET /api/reviews
Get all reviews (with optional filters)
```bash
# All reviews
curl http://localhost:3001/api/reviews

# Reviews for a specific book
curl http://localhost:3001/api/reviews?bookId=1

# Reviews by a specific user
curl http://localhost:3001/api/reviews?userAddress=0x123...
```

#### GET /api/reviews/:bookId
Get reviews for a specific book
```bash
curl http://localhost:3001/api/reviews/1
```

#### POST /api/reviews
Submit a new review
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": 1,
    "userAddress": "0x1234567890123456789012345678901234567890",
    "reviewText": "Great book!",
    "rating": 5,
    "reviewHash": "0xabc..."
  }'
```

### Health Check

#### GET /health
Check server status
```bash
curl http://localhost:3001/health
```

## Next Steps

- [ ] Add database (PostgreSQL/MongoDB)
- [ ] Add authentication
- [ ] Add rate limiting
- [ ] Add caching layer
- [ ] Add error logging (Sentry)
- [ ] Add API documentation (Swagger)
- [ ] Verify review hashes match on-chain data
- [ ] Add image upload for book covers

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import booksRouter from './routes/books';
import reviewsRouter from './routes/reviews';
import borrowRequestsRouter from './routes/borrow-requests';
import purchasesRouter from './routes/purchases';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', booksRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/borrow-requests', borrowRequestsRouter);
app.use('/api/purchases', purchasesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

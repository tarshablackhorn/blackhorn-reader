import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/reviews - Get all reviews
router.get('/', async (req, res) => {
  try {
    const { bookId, userAddress } = req.query;
    
    const where: any = {};
    
    if (bookId) {
      where.bookId = parseInt(bookId as string);
    }
    
    if (userAddress) {
      where.userAddress = (userAddress as string).toLowerCase();
    }
    
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/:bookId - Get reviews for a specific book
router.get('/:bookId', async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const bookReviews = await prisma.review.findMany({
      where: { bookId },
      orderBy: { timestamp: 'desc' },
    });
    res.json(bookReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews - Submit a new review
router.post('/', async (req, res) => {
  try {
    const { bookId, userAddress, reviewText, rating, reviewHash } = req.body;
    
    // Validation
    if (!bookId || !userAddress || !reviewText || !reviewHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Check if user already reviewed this book
    const existingReview = await prisma.review.findUnique({
      where: {
        bookId_userAddress: {
          bookId,
          userAddress: userAddress.toLowerCase(),
        },
      },
    });
    
    if (existingReview) {
      return res.status(409).json({ error: 'User has already reviewed this book' });
    }
    
    const review = await prisma.review.create({
      data: {
        id: `${bookId}-${userAddress}-${Date.now()}`,
        bookId,
        userAddress: userAddress.toLowerCase(),
        reviewText,
        rating: rating || 0,
        reviewHash,
      },
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

export default router;

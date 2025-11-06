import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../db';

const router = Router();

// GET /api/books - Get all books
router.get('/', async (_req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET /api/books/:id - Get book by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid book ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const bookId = parseInt(req.params.id);
      const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        reviews: true,
        borrowRequests: true,
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST /api/books - Create a new book
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('genre').trim().notEmpty().withMessage('Genre is required'),
    body('publishedYear').isInt({ min: 1000, max: 9999 }).withMessage('Valid published year is required'),
    body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
    body('ownerAddress')
      .optional()
      .trim()
      .toLowerCase()
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid wallet address format'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, author, genre, publishedYear, coverImage, ownerAddress } = req.body;
    
    const book = await prisma.book.create({
      data: {
        title,
        description,
        author,
        genre,
        publishedYear: parseInt(publishedYear),
        coverImage: coverImage || null,
        ownerAddress: ownerAddress || null,
      },
    });
    
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

export default router;

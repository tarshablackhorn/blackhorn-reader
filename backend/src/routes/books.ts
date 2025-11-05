import { Router } from 'express';
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { title, description, author, genre, publishedYear, coverImage, ownerAddress } = req.body;
    
    if (!title || !description || !author || !genre || !publishedYear) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
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

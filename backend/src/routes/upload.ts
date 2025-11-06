import express from 'express';
import { prisma } from '../db';

const router = express.Router();

// Maximum file size: 5MB (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload book cover image
router.post('/:bookId/cover', express.json({ limit: '6mb' }), async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate it's a valid base64 image
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Must be a data URL' });
    }

    // Check file size
    const base64Length = imageData.split(',')[1]?.length || 0;
    const sizeInBytes = (base64Length * 3) / 4;
    
    if (sizeInBytes > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `Image too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Update book with cover image
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: { coverImage: imageData },
    });

    res.json({
      id: updatedBook.id,
      coverImage: updatedBook.coverImage,
      message: 'Cover image uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Delete book cover image
router.delete('/:bookId/cover', async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: { coverImage: null },
    });

    res.json({
      id: updatedBook.id,
      message: 'Cover image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cover image:', error);
    res.status(500).json({ error: 'Failed to delete cover image' });
  }
});

export default router;

import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/borrow-requests - Get all borrow requests (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { bookId, borrowerAddress, status } = req.query;
    
    const where: any = {};
    
    if (bookId) {
      where.bookId = parseInt(bookId as string);
    }
    
    if (borrowerAddress) {
      where.borrowerAddress = (borrowerAddress as string).toLowerCase();
    }
    
    if (status) {
      where.status = status as string;
    }
    
    const borrowRequests = await prisma.borrowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(borrowRequests);
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ error: 'Failed to fetch borrow requests' });
  }
});

// POST /api/borrow-requests - Create a new borrow request
router.post('/', async (req, res) => {
  try {
    const { bookId, borrowerAddress, durationDays } = req.body;
    
    // Validation
    if (!bookId || !borrowerAddress || !durationDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (durationDays < 1 || durationDays > 30) {
      return res.status(400).json({ error: 'Duration must be between 1 and 30 days' });
    }
    
    // Check if book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Check if user already has a pending request for this book
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        bookId,
        borrowerAddress: borrowerAddress.toLowerCase(),
        status: 'pending',
      },
    });
    
    if (existingRequest) {
      return res.status(409).json({ 
        error: 'You already have a pending borrow request for this book' 
      });
    }
    
    const request = await prisma.borrowRequest.create({
      data: {
        id: `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        bookId,
        borrowerAddress: borrowerAddress.toLowerCase(),
        durationDays,
        status: 'pending',
      },
    });
    
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating borrow request:', error);
    res.status(500).json({ error: 'Failed to create borrow request' });
  }
});

// PATCH /api/borrow-requests/:id - Update borrow request status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, txHash } = req.body;
    
    const request = await prisma.borrowRequest.findUnique({
      where: { id },
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Borrow request not found' });
    }
    
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (txHash) {
      updateData.txHash = txHash;
    }
    
    const updatedRequest = await prisma.borrowRequest.update({
      where: { id },
      data: updateData,
    });
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating borrow request:', error);
    res.status(500).json({ error: 'Failed to update borrow request' });
  }
});

// DELETE /api/borrow-requests/:id - Cancel/delete a borrow request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.borrowRequest.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Borrow request not found' });
    }
    console.error('Error deleting borrow request:', error);
    res.status(500).json({ error: 'Failed to delete borrow request' });
  }
});

export default router;

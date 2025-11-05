import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/purchases - Get all purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        book: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// GET /api/purchases/book/:bookId - Get purchases for a specific book
router.get('/book/:bookId', async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const purchases = await prisma.purchase.findMany({
      where: { bookId },
      include: {
        book: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching book purchases:', error);
    res.status(500).json({ error: 'Failed to fetch book purchases' });
  }
});

// GET /api/purchases/user/:address - Get purchases for a specific user
router.get('/user/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const purchases = await prisma.purchase.findMany({
      where: { buyerAddress: address },
      include: {
        book: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({ error: 'Failed to fetch user purchases' });
  }
});

// POST /api/purchases - Record a new purchase
router.post('/', async (req, res) => {
  try {
    const { bookId, buyerAddress, amount, txHash } = req.body;
    
    if (!bookId || !buyerAddress || !amount || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if purchase already exists (prevent duplicates)
    const existingPurchase = await prisma.purchase.findUnique({
      where: { txHash },
    });
    
    if (existingPurchase) {
      return res.status(409).json({ error: 'Purchase already recorded' });
    }
    
    const purchase = await prisma.purchase.create({
      data: {
        id: `${txHash}-${Date.now()}`,
        bookId: parseInt(bookId),
        buyerAddress: buyerAddress.toLowerCase(),
        amount: amount.toString(),
        txHash,
      },
      include: {
        book: true,
      },
    });
    
    res.status(201).json(purchase);
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

// GET /api/purchases/stats - Get purchase statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPurchases = await prisma.purchase.count();
    const uniqueBuyers = await prisma.purchase.groupBy({
      by: ['buyerAddress'],
    });
    
    const purchases = await prisma.purchase.findMany();
    const totalVolume = purchases.reduce((sum, p) => sum + BigInt(p.amount), BigInt(0));
    
    res.json({
      totalPurchases,
      uniqueBuyers: uniqueBuyers.length,
      totalVolume: totalVolume.toString(),
    });
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    res.status(500).json({ error: 'Failed to fetch purchase stats' });
  }
});

export default router;

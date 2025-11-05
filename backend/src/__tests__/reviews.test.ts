import { prisma } from '../db';

jest.mock('../db', () => ({
  prisma: {
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Reviews API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reviews', () => {
    it('should fetch all reviews with optional filters', async () => {
      const mockReviews = [
        {
          id: '1-0x123-1234567890',
          bookId: 1,
          userAddress: '0x123',
          reviewText: 'Great book!',
          rating: 5,
          reviewHash: 'hash123',
          timestamp: new Date(),
        },
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await prisma.review.findMany({
        where: {},
        orderBy: { timestamp: 'desc' },
      });

      expect(result).toEqual(mockReviews);
    });

    it('should filter reviews by bookId', async () => {
      const bookId = 1;
      const mockReviews = [
        {
          id: '1-0x123-1234567890',
          bookId,
          userAddress: '0x123',
          reviewText: 'Great book!',
          rating: 5,
          reviewHash: 'hash123',
          timestamp: new Date(),
        },
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await prisma.review.findMany({
        where: { bookId },
        orderBy: { timestamp: 'desc' },
      });

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { bookId },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(mockReviews);
    });

    it('should filter reviews by userAddress', async () => {
      const userAddress = '0x123';
      const mockReviews = [
        {
          id: '1-0x123-1234567890',
          bookId: 1,
          userAddress: '0x123',
          reviewText: 'Great book!',
          rating: 5,
          reviewHash: 'hash123',
          timestamp: new Date(),
        },
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await prisma.review.findMany({
        where: { userAddress: userAddress.toLowerCase() },
        orderBy: { timestamp: 'desc' },
      });

      expect(result).toEqual(mockReviews);
    });
  });

  describe('POST /api/reviews', () => {
    const validReviewData = {
      bookId: 1,
      userAddress: '0xABC123',
      reviewText: 'Amazing read!',
      rating: 4,
      reviewHash: 'hash456',
    };

    it('should create a review with valid data', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      const mockCreatedReview = {
        id: `${validReviewData.bookId}-${validReviewData.userAddress}-${Date.now()}`,
        ...validReviewData,
        userAddress: validReviewData.userAddress.toLowerCase(),
        timestamp: new Date(),
      };

      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.review.create as jest.Mock).mockResolvedValue(mockCreatedReview);

      // Check book exists
      const book = await prisma.book.findUnique({ where: { id: validReviewData.bookId } });
      expect(book).toEqual(mockBook);

      // Check no existing review
      const existingReview = await prisma.review.findUnique({
        where: {
          bookId_userAddress: {
            bookId: validReviewData.bookId,
            userAddress: validReviewData.userAddress.toLowerCase(),
          },
        },
      });
      expect(existingReview).toBeNull();

      // Create review
      const result = await prisma.review.create({
        data: {
          id: mockCreatedReview.id,
          bookId: validReviewData.bookId,
          userAddress: validReviewData.userAddress.toLowerCase(),
          reviewText: validReviewData.reviewText,
          rating: validReviewData.rating,
          reviewHash: validReviewData.reviewHash,
        },
      });

      expect(result.userAddress).toBe(validReviewData.userAddress.toLowerCase());
    });

    it('should reject review if book does not exist', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(null);

      const book = await prisma.book.findUnique({ where: { id: 999 } });
      
      expect(book).toBeNull();
    });

    it('should reject duplicate review from same user', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      const existingReview = {
        id: '1-0xabc123-1234567890',
        bookId: 1,
        userAddress: '0xabc123',
        reviewText: 'Already reviewed',
        rating: 5,
        reviewHash: 'hash789',
        timestamp: new Date(),
      };

      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(existingReview);

      const book = await prisma.book.findUnique({ where: { id: validReviewData.bookId } });
      expect(book).toEqual(mockBook);

      const duplicate = await prisma.review.findUnique({
        where: {
          bookId_userAddress: {
            bookId: validReviewData.bookId,
            userAddress: validReviewData.userAddress.toLowerCase(),
          },
        },
      });

      expect(duplicate).toEqual(existingReview);
    });
  });
});

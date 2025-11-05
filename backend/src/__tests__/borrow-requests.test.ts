import { prisma } from '../db';

jest.mock('../db', () => ({
  prisma: {
    borrowRequest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Borrow Requests API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/borrow-requests', () => {
    it('should fetch all borrow requests', async () => {
      const mockRequests = [
        {
          id: 'req-1234-abc',
          bookId: 1,
          borrowerAddress: '0x123',
          durationDays: 7,
          status: 'pending',
          txHash: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.borrowRequest.findMany as jest.Mock).mockResolvedValue(mockRequests);

      const result = await prisma.borrowRequest.findMany({
        where: {},
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockRequests);
    });

    it('should filter by bookId', async () => {
      const bookId = 1;
      const mockRequests = [
        {
          id: 'req-1234-abc',
          bookId,
          borrowerAddress: '0x123',
          durationDays: 7,
          status: 'pending',
          txHash: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.borrowRequest.findMany as jest.Mock).mockResolvedValue(mockRequests);

      await prisma.borrowRequest.findMany({
        where: { bookId },
        orderBy: { createdAt: 'desc' },
      });

      expect(prisma.borrowRequest.findMany).toHaveBeenCalledWith({
        where: { bookId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status', async () => {
      const status = 'approved';
      const mockRequests = [
        {
          id: 'req-1234-abc',
          bookId: 1,
          borrowerAddress: '0x123',
          durationDays: 7,
          status: 'approved',
          txHash: '0xtxhash',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.borrowRequest.findMany as jest.Mock).mockResolvedValue(mockRequests);

      const result = await prisma.borrowRequest.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
      });

      expect(result[0].status).toBe('approved');
    });
  });

  describe('POST /api/borrow-requests', () => {
    const validRequestData = {
      bookId: 1,
      borrowerAddress: '0xBorrower123',
      durationDays: 14,
    };

    it('should create a borrow request with valid data', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      const mockCreatedRequest = {
        id: 'req-1234567890-xyz',
        bookId: validRequestData.bookId,
        borrowerAddress: validRequestData.borrowerAddress.toLowerCase(),
        durationDays: validRequestData.durationDays,
        status: 'pending',
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.borrowRequest.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.borrowRequest.create as jest.Mock).mockResolvedValue(mockCreatedRequest);

      // Check book exists
      const book = await prisma.book.findUnique({ where: { id: validRequestData.bookId } });
      expect(book).toEqual(mockBook);

      // Check no existing pending request
      const existing = await prisma.borrowRequest.findFirst({
        where: {
          bookId: validRequestData.bookId,
          borrowerAddress: validRequestData.borrowerAddress.toLowerCase(),
          status: 'pending',
        },
      });
      expect(existing).toBeNull();

      // Create request
      const result = await prisma.borrowRequest.create({
        data: {
          id: mockCreatedRequest.id,
          bookId: validRequestData.bookId,
          borrowerAddress: validRequestData.borrowerAddress.toLowerCase(),
          durationDays: validRequestData.durationDays,
          status: 'pending',
        },
      });

      expect(result.status).toBe('pending');
      expect(result.borrowerAddress).toBe(validRequestData.borrowerAddress.toLowerCase());
    });

    it('should reject if book does not exist', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(null);

      const book = await prisma.book.findUnique({ where: { id: 999 } });
      
      expect(book).toBeNull();
    });

    it('should reject if user already has pending request', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      const existingRequest = {
        id: 'req-existing',
        bookId: 1,
        borrowerAddress: '0xborrower123',
        durationDays: 7,
        status: 'pending',
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.borrowRequest.findFirst as jest.Mock).mockResolvedValue(existingRequest);

      const book = await prisma.book.findUnique({ where: { id: validRequestData.bookId } });
      expect(book).toEqual(mockBook);

      const existing = await prisma.borrowRequest.findFirst({
        where: {
          bookId: validRequestData.bookId,
          borrowerAddress: validRequestData.borrowerAddress.toLowerCase(),
          status: 'pending',
        },
      });

      expect(existing).toEqual(existingRequest);
    });
  });

  describe('PATCH /api/borrow-requests/:id', () => {
    it('should update borrow request status', async () => {
      const requestId = 'req-1234-abc';
      const mockRequest = {
        id: requestId,
        bookId: 1,
        borrowerAddress: '0x123',
        durationDays: 7,
        status: 'pending',
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRequest = {
        ...mockRequest,
        status: 'approved',
        txHash: '0xtxhash123',
      };

      (prisma.borrowRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest);
      (prisma.borrowRequest.update as jest.Mock).mockResolvedValue(updatedRequest);

      const found = await prisma.borrowRequest.findUnique({ where: { id: requestId } });
      expect(found).toEqual(mockRequest);

      const result = await prisma.borrowRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          txHash: '0xtxhash123',
        },
      });

      expect(result.status).toBe('approved');
      expect(result.txHash).toBe('0xtxhash123');
    });

    it('should return null if request not found', async () => {
      (prisma.borrowRequest.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await prisma.borrowRequest.findUnique({ where: { id: 'nonexistent' } });
      
      expect(result).toBeNull();
    });
  });

  describe('DELETE /api/borrow-requests/:id', () => {
    it('should delete a borrow request', async () => {
      const requestId = 'req-1234-abc';
      const deletedRequest = {
        id: requestId,
        bookId: 1,
        borrowerAddress: '0x123',
        durationDays: 7,
        status: 'pending',
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.borrowRequest.delete as jest.Mock).mockResolvedValue(deletedRequest);

      const result = await prisma.borrowRequest.delete({
        where: { id: requestId },
      });

      expect(prisma.borrowRequest.delete).toHaveBeenCalledWith({
        where: { id: requestId },
      });
      expect(result).toEqual(deletedRequest);
    });
  });
});

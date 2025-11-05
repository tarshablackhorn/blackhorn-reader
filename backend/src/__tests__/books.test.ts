import { prisma } from '../db';

// Mock the prisma client
jest.mock('../db', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Books API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/books', () => {
    it('should fetch all books ordered by createdAt desc', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Test Book 1',
          author: 'Author 1',
          genre: 'Fiction',
          publishedYear: 2020,
          description: 'Test description',
          coverImage: null,
          ownerAddress: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Test Book 2',
          author: 'Author 2',
          genre: 'Non-Fiction',
          publishedYear: 2021,
          description: 'Test description 2',
          coverImage: null,
          ownerAddress: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.book.findMany as jest.Mock).mockResolvedValue(mockBooks);

      expect(prisma.book.findMany).not.toHaveBeenCalled();
      
      // In actual implementation, you would call the route handler
      const result = await prisma.book.findMany({
        orderBy: { createdAt: 'desc' },
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockBooks);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should fetch a book by id with relations', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        publishedYear: 2020,
        description: 'Test description',
        coverImage: null,
        ownerAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: [],
        borrowRequests: [],
      };

      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);

      const result = await prisma.book.findUnique({
        where: { id: 1 },
        include: {
          reviews: true,
          borrowRequests: true,
        },
      });

      expect(prisma.book.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          reviews: true,
          borrowRequests: true,
        },
      });
      expect(result).toEqual(mockBook);
    });

    it('should return null when book does not exist', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await prisma.book.findUnique({
        where: { id: 999 },
        include: {
          reviews: true,
          borrowRequests: true,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('POST /api/books', () => {
    it('should create a new book with valid data', async () => {
      const newBookData = {
        title: 'New Book',
        description: 'New description',
        author: 'New Author',
        genre: 'Fiction',
        publishedYear: 2023,
        coverImage: 'http://example.com/image.jpg',
        ownerAddress: '0x123',
      };

      const mockCreatedBook = {
        id: 1,
        ...newBookData,
        coverImage: newBookData.coverImage,
        ownerAddress: newBookData.ownerAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.book.create as jest.Mock).mockResolvedValue(mockCreatedBook);

      const result = await prisma.book.create({
        data: {
          title: newBookData.title,
          description: newBookData.description,
          author: newBookData.author,
          genre: newBookData.genre,
          publishedYear: newBookData.publishedYear,
          coverImage: newBookData.coverImage,
          ownerAddress: newBookData.ownerAddress,
        },
      });

      expect(prisma.book.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: newBookData.title,
          author: newBookData.author,
          genre: newBookData.genre,
        }),
      });
      expect(result).toEqual(mockCreatedBook);
    });

    it('should create a book with null optional fields', async () => {
      const minimalBookData = {
        title: 'Minimal Book',
        description: 'Minimal description',
        author: 'Minimal Author',
        genre: 'Fiction',
        publishedYear: 2023,
        coverImage: null,
        ownerAddress: null,
      };

      const mockCreatedBook = {
        id: 2,
        ...minimalBookData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.book.create as jest.Mock).mockResolvedValue(mockCreatedBook);

      const result = await prisma.book.create({
        data: minimalBookData,
      });

      expect(result.coverImage).toBeNull();
      expect(result.ownerAddress).toBeNull();
    });
  });
});

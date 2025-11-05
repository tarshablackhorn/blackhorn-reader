export interface Book {
  id: bigint;
  title: string;
  description: string;
  author?: string;
  coverImage?: string;
  genre?: string;
  publishedYear?: number;
}

export interface BookMetadata {
  bookId: bigint;
  totalSupply: bigint;
  isAvailable: boolean;
}

// Static book data until backend is implemented
export const BOOKS: Book[] = [
  {
    id: 1n,
    title: "The Great Adventure",
    description: "An epic tale of discovery and courage. Join our hero as they embark on a journey across uncharted lands, facing challenges and making allies along the way.",
    author: "Jane Explorer",
    genre: "Adventure",
    publishedYear: 2024,
  },
  {
    id: 2n,
    title: "Mystery at Midnight",
    description: "A thrilling detective story that will keep you guessing until the very last page. When the clock strikes twelve, secrets begin to unravel.",
    author: "Detective Smith",
    genre: "Mystery",
    publishedYear: 2023,
  },
  {
    id: 3n,
    title: "Future Chronicles",
    description: "A science fiction masterpiece exploring humanity's place among the stars. Technology, philosophy, and adventure collide in this thought-provoking tale.",
    author: "Dr. Nova Star",
    genre: "Science Fiction",
    publishedYear: 2024,
  },
];

export function getBookById(id: bigint): Book | undefined {
  return BOOKS.find(book => book.id === id);
}

export function getAllBooks(): Book[] {
  return BOOKS;
}

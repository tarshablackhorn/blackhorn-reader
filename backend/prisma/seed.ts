import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: "The Great Adventure",
        description: "An epic tale of discovery and courage. Join our hero as they embark on a journey across uncharted lands, facing challenges and making allies along the way.",
        author: "Jane Explorer",
        genre: "Adventure",
        publishedYear: 2024,
      },
    }),
    prisma.book.create({
      data: {
        title: "Mystery at Midnight",
        description: "A thrilling detective story that will keep you guessing until the very last page. When the clock strikes twelve, secrets begin to unravel.",
        author: "Detective Smith",
        genre: "Mystery",
        publishedYear: 2023,
      },
    }),
    prisma.book.create({
      data: {
        title: "Future Chronicles",
        description: "A science fiction masterpiece exploring humanity's place among the stars. Technology, philosophy, and adventure collide in this thought-provoking tale.",
        author: "Dr. Nova Star",
        genre: "Science Fiction",
        publishedYear: 2024,
      },
    }),
  ]);

  console.log(`Created ${books.length} books`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

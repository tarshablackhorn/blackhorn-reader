'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { BookCard } from '@/components/BookCard';
import { useEffect, useState } from 'react';
import { fetchBooks, type Book } from '@/lib/api';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📚 Blackhorn Reader</h1>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
              Browse Books
            </Link>
            <Link href="/my-books" className="text-gray-600 hover:text-gray-900 pb-2">
              My Borrowed Books
            </Link>
            <Link href="/collection" className="text-gray-600 hover:text-gray-900 pb-2">
              My Collection
            </Link>
            <Link href="/reviews" className="text-gray-600 hover:text-gray-900 pb-2">
              Reviews
            </Link>
            <Link href="/stats" className="text-gray-600 hover:text-gray-900 pb-2">
              Stats
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Books</h2>
          <p className="text-gray-600">Browse and borrow books from the Blackhorn Reader collection</p>
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No books available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id.toString()}
                bookId={BigInt(book.id)}
                title={book.title}
                description={book.description}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-bold text-gray-900 mb-2">Browse & Borrow</h4>
              <p className="text-gray-600">Request to borrow books from the collection</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⭐</div>
              <h4 className="font-bold text-gray-900 mb-2">Review & Earn</h4>
              <p className="text-gray-600">Write reviews to claim Basic badges (soulbound NFTs)</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔥</div>
              <h4 className="font-bold text-gray-900 mb-2">Burn for Rare</h4>
              <p className="text-gray-600">Burn your book to upgrade to a Rare badge NFT</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

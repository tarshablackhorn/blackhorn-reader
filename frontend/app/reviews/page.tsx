'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useReviews } from '@/hooks/useReviews';
import { getBookById } from '@/types/book';

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ReviewsPage() {
  const { reviews, isLoading, error } = useReviews();

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
            <Link href="/" className="text-gray-600 hover:text-gray-900 pb-2">
              Browse Books
            </Link>
            <Link href="/my-books" className="text-gray-600 hover:text-gray-900 pb-2">
              My Borrowed Books
            </Link>
            <Link href="/collection" className="text-gray-600 hover:text-gray-900 pb-2">
              My Collection
            </Link>
            <Link href="/reviews" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
              Reviews
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Reviews</h2>
          <p className="text-gray-600">See what other readers are saying</p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!isLoading && !error && reviews.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to review a book!</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Books
            </Link>
          </div>
        )}

        {!isLoading && !error && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => {
              const book = getBookById(BigInt(review.bookId));
              return (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatAddress(review.userAddress)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(review.timestamp)}
                          </p>
                        </div>
                        {review.rating > 0 && (
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="text-lg">
                                {i < review.rating ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        href={`/book/${review.bookId}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-3"
                      >
                        <span className="font-medium">{book?.title || `Book #${review.bookId}`}</span>
                        {book?.author && (
                          <span className="text-sm text-gray-500">by {book.author}</span>
                        )}
                      </Link>
                      
                      <p className="text-gray-700 whitespace-pre-wrap">{review.reviewText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

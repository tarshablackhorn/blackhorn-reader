'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useReviews } from '@/hooks/useReviews';
import { getAllBooks } from '@/types/book';
import { useAccount } from 'wagmi';
import { useBookData } from '@/hooks/useBookData';

export default function StatsPage() {
  const { reviews, isLoading } = useReviews();
  const allBooks = getAllBooks();
  const { address } = useAccount();

  // Calculate stats
  const totalReviews = reviews.length;
  const uniqueReviewers = new Set(reviews.map(r => r.userAddress)).size;
  
  // Book rankings by review count
  const bookReviewCounts = reviews.reduce((acc, review) => {
    acc[review.bookId] = (acc[review.bookId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const rankedBooks = allBooks
    .map(book => ({
      ...book,
      reviewCount: bookReviewCounts[Number(book.id)] || 0,
      avgRating: reviews
        .filter(r => r.bookId === Number(book.id) && r.rating > 0)
        .reduce((sum, r, _, arr) => sum + r.rating / arr.length, 0) || 0,
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount);

  // Top reviewers (most reviews written)
  const reviewerCounts = reviews.reduce((acc, review) => {
    acc[review.userAddress] = (acc[review.userAddress] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topReviewers = Object.entries(reviewerCounts)
    .map(([addr, count]) => ({ address: addr, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // User's own stats
  const userReviewCount = address ? reviewerCounts[address] || 0 : 0;
  const userBadgeCount = allBooks.reduce((count, book) => {
    const { hasBasicBadge, hasRareBadge } = useBookData(book.id);
    return count + (hasBasicBadge ? 1 : 0) + (hasRareBadge ? 1 : 0);
  }, 0);

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
            <Link href="/reviews" className="text-gray-600 hover:text-gray-900 pb-2">
              Reviews
            </Link>
            <Link href="/stats" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
              Stats
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Statistics</h2>
          <p className="text-gray-600">Community activity and leaderboards</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-3xl font-bold text-gray-900">{allBooks.length}</div>
                <div className="text-sm text-gray-600">Total Books</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-3xl font-bold text-gray-900">{totalReviews}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-3xl font-bold text-gray-900">{uniqueReviewers}</div>
                <div className="text-sm text-gray-600">Active Reviewers</div>
              </div>
            </div>

            {/* User's Personal Stats */}
            {address && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Your Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userReviewCount}</div>
                    <div className="text-sm text-gray-600">Reviews Written</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{userBadgeCount}</div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {userReviewCount > 0 ? `#${topReviewers.findIndex(r => r.address === address) + 1}` : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Leaderboard Rank</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((userBadgeCount / (allBooks.length * 2)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Collection</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Books */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Most Reviewed Books</h3>
                <div className="space-y-3">
                  {rankedBooks.slice(0, 5).map((book, index) => (
                    <Link
                      key={book.id.toString()}
                      href={`/book/${book.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{book.title}</p>
                        <p className="text-sm text-gray-500">
                          {book.reviewCount} {book.reviewCount === 1 ? 'review' : 'reviews'}
                          {book.avgRating > 0 && (
                            <span className="ml-2">⭐ {book.avgRating.toFixed(1)}</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Reviewers */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🌟 Top Reviewers</h3>
                <div className="space-y-3">
                  {topReviewers.map((reviewer, index) => (
                    <div
                      key={reviewer.address}
                      className="flex items-center gap-3 p-3 rounded-lg"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-gray-900">
                          {reviewer.address.slice(0, 6)}...{reviewer.address.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reviewer.count} {reviewer.count === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                      {reviewer.address === address && (
                        <span className="text-green-600 font-medium">You!</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, basicBadgeId, rareBadgeId } from '@/lib/contract';
import { getAllBooks, getBookById } from '@/types/book';
import { useReviews } from '@/hooks/useReviews';
import { Address } from 'viem';

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default function ProfilePage({ params }: { params: { address: string } }) {
  const { address: connectedAddress } = useAccount();
  const profileAddress = params.address as Address;
  const isOwnProfile = connectedAddress?.toLowerCase() === profileAddress.toLowerCase();
  const allBooks = getAllBooks();

  // Fetch user's reviews
  const { reviews, isLoading: reviewsLoading } = useReviews(undefined, profileAddress);

  // Check owned books and badges
  const ownedItems = allBooks.map(book => {
    const { data: bookBalance } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [profileAddress, book.id],
    });

    const { data: basicBalance } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [profileAddress, basicBadgeId(book.id)],
    });

    const { data: rareBalance } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [profileAddress, rareBadgeId(book.id)],
    });

    return {
      book,
      ownsBook: bookBalance ? Number(bookBalance) > 0 : false,
      hasBasicBadge: basicBalance ? Number(basicBalance) > 0 : false,
      hasRareBadge: rareBalance ? Number(rareBalance) > 0 : false,
    };
  });

  const stats = {
    booksOwned: ownedItems.filter(item => item.ownsBook).length,
    basicBadges: ownedItems.filter(item => item.hasBasicBadge).length,
    rareBadges: ownedItems.filter(item => item.hasRareBadge).length,
    totalReviews: reviews.length,
  };

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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {formatAddress(profileAddress)}
              </h2>
              {isOwnProfile && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                  Your Profile
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.booksOwned}
            </div>
            <div className="text-sm text-gray-600">Books Owned</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalReviews}
            </div>
            <div className="text-sm text-gray-600">Reviews Written</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.basicBadges}
            </div>
            <div className="text-sm text-gray-600">Basic Badges</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.rareBadges}
            </div>
            <div className="text-sm text-gray-600">Rare Badges</div>
          </div>
        </div>

        {/* Owned Books */}
        {stats.booksOwned > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 Books Owned</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ownedItems
                .filter(item => item.ownsBook)
                .map(({ book }) => (
                  <Link
                    key={book.id.toString()}
                    href={`/book/${book.id}`}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-4xl mb-3">
                      📖
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{book.title}</h4>
                    {book.author && (
                      <p className="text-xs text-gray-500">{book.author}</p>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📝 Reviews ({stats.totalReviews})
          </h3>
          {reviewsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                {isOwnProfile ? "You haven't written any reviews yet." : "This user hasn't written any reviews yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const book = getBookById(BigInt(review.bookId));
                return (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Link 
                        href={`/book/${review.bookId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {book?.title || `Book #${review.bookId}`}
                      </Link>
                      {review.rating > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-base">
                              {i < review.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{review.reviewText}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.timestamp)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Badges */}
        {(stats.basicBadges > 0 || stats.rareBadges > 0) && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🏆 Badges ({stats.basicBadges + stats.rareBadges})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ownedItems
                .filter(item => item.hasBasicBadge || item.hasRareBadge)
                .map(({ book, hasBasicBadge, hasRareBadge }) => (
                  <div key={book.id.toString()} className="space-y-2">
                    {hasBasicBadge && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <p className="text-xs font-medium text-blue-900">Basic</p>
                        <p className="text-xs text-blue-700">{book.title}</p>
                      </div>
                    )}
                    {hasRareBadge && (
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">💎</div>
                        <p className="text-xs font-medium text-yellow-900">Rare</p>
                        <p className="text-xs text-yellow-700">{book.title}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

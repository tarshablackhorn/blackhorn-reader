'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { basicBadgeId, rareBadgeId } from '@/lib/contract';
import { useBookData } from '@/hooks/useBookData';
import { getAllBooks, getBookById } from '@/types/book';

export default function CollectionPage() {
  const { isConnected } = useAccount();
  const allBooks = getAllBooks();
  
  // Collect all owned items across all books
  const ownedBooks = allBooks.filter(book => {
    const { ownsBook } = useBookData(book.id);
    return ownsBook;
  });
  
  const allBadges = allBooks.flatMap(book => {
    const { hasBasicBadge, hasRareBadge } = useBookData(book.id);
    const badges = [];
    if (hasBasicBadge) badges.push({ type: 'basic', bookId: book.id });
    if (hasRareBadge) badges.push({ type: 'rare', bookId: book.id });
    return badges;
  });

  const hasAnyNFT = ownedBooks.length > 0 || allBadges.length > 0;

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
            <Link href="/collection" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
              My Collection
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My NFT Collection</h2>
          <p className="text-gray-600">Your books and badges</p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Please connect your wallet to view your collection</p>
            <ConnectButton />
          </div>
        ) : !hasAnyNFT ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-gray-600 mb-4">Your collection is empty</p>
            <p className="text-gray-500 mb-6">Start by borrowing books and earning badges!</p>
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            {/* Books Section */}
            {ownedBooks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 Books ({ownedBooks.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedBooks.map((book) => {
                    const { bookBalance } = useBookData(book.id);
                    return (
                      <div key={book.id.toString()} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-6xl">📖</span>
                        </div>
                        <div className="p-6">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h4>
                          {book.author && (
                            <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
                          )}
                          <div className="mb-4">
                            <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                              ERC1155 Token
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Quantity: {bookBalance ? Number(bookBalance) : 0}
                          </p>
                          <Link 
                            href={`/book/${book.id}`}
                            className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badges Section */}
            {allBadges.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🏆 Badges ({allBadges.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBadges.map((badge, index) => {
                    const book = getBookById(badge.bookId);
                    const isBasic = badge.type === 'basic';
                    return (
                      <div 
                        key={`${badge.type}-${badge.bookId}-${index}`}
                        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 ${
                          isBasic ? 'border-blue-200' : 'border-yellow-400'
                        }`}
                      >
                        <div className={`h-48 bg-gradient-to-br ${
                          isBasic ? 'from-blue-400 to-blue-600' : 'from-yellow-400 to-orange-600'
                        } flex items-center justify-center`}>
                          <span className="text-6xl">{isBasic ? '⭐' : '💎'}</span>
                        </div>
                        <div className="p-6">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            {isBasic ? 'Basic' : 'Rare'} Badge - {book?.title || `Book #${badge.bookId}`}
                          </h4>
                          <div className="mb-4 space-y-2">
                            <span className={`inline-block text-sm px-3 py-1 rounded-full ${
                              isBasic ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isBasic ? 'Soulbound NFT' : 'Rare NFT'}
                            </span>
                            <p className="text-sm text-gray-600">
                              {isBasic ? 'Cannot be transferred' : 'Transferable'}
                            </p>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {isBasic ? 'Earned by writing a review' : 'Earned by burning the book'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Token ID: {(isBasic ? basicBadgeId(badge.bookId) : rareBadgeId(badge.bookId)).toString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Box */}
        {isConnected && (
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About NFTs in Blackhorn Reader</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Books:</strong> ERC1155 tokens that can be owned, lent, and burned
              </p>
              <p>
                <strong>Basic Badges:</strong> Soulbound NFTs earned by writing reviews. Cannot be transferred.
              </p>
              <p>
                <strong>Rare Badges:</strong> Special NFTs earned by burning books. Can be transferred and traded.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

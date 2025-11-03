'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOOK_ID, basicBadgeId, rareBadgeId } from '@/lib/contract';

export default function CollectionPage() {
  const { address, isConnected } = useAccount();

  // Read user's book balance
  const { data: bookBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BOOK_ID],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read user's basic badge balance
  const { data: basicBadgeBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, basicBadgeId(BOOK_ID)],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read user's rare badge balance
  const { data: rareBadgeBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, rareBadgeId(BOOK_ID)],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const hasBook = bookBalance && Number(bookBalance) > 0;
  const hasBasicBadge = basicBadgeBalance && Number(basicBadgeBalance) > 0;
  const hasRareBadge = rareBadgeBalance && Number(rareBadgeBalance) > 0;
  const hasAnyNFT = hasBook || hasBasicBadge || hasRareBadge;

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
            {hasBook && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 Books</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-6xl">📖</span>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Book #1</h4>
                      <div className="mb-4">
                        <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                          ERC1155 Token
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Quantity: {Number(bookBalance)}
                      </p>
                      <Link 
                        href="/book/1"
                        className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Badges Section */}
            {(hasBasicBadge || hasRareBadge) && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🏆 Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Badge */}
                  {hasBasicBadge && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-blue-200">
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-6xl">⭐</span>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Basic Badge - Book #1</h4>
                        <div className="mb-4 space-y-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            Soulbound NFT
                          </span>
                          <p className="text-sm text-gray-600">Cannot be transferred</p>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Earned by writing a review
                        </p>
                        <p className="text-gray-500 text-sm">
                          Token ID: {basicBadgeId(BOOK_ID).toString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rare Badge */}
                  {hasRareBadge && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-yellow-400">
                      <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                        <span className="text-6xl">💎</span>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Rare Badge - Book #1</h4>
                        <div className="mb-4 space-y-2">
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                            Rare NFT
                          </span>
                          <p className="text-sm text-gray-600">Transferable</p>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Earned by burning the book
                        </p>
                        <p className="text-gray-500 text-sm">
                          Token ID: {rareBadgeId(BOOK_ID).toString()}
                        </p>
                      </div>
                    </div>
                  )}
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

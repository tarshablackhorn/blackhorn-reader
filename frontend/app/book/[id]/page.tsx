'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOOK_ID, basicBadgeId } from '@/lib/contract';
import { useState } from 'react';
import { keccak256, toHex } from 'viem';

export default function BookDetailPage() {
  const { address, isConnected } = useAccount();
  const [review, setReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Read user's claim status
  const { data: claimStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'claimOf',
    args: [BOOK_ID, address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read if user has the book
  const { data: bookBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BOOK_ID],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read borrowed until timestamp
  const { data: borrowedUntil } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'borrowedUntil',
    args: [BOOK_ID, address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { writeContract: writeReview, data: reviewHash, isPending: isReviewPending } = useWriteContract();
  const { writeContract: writeBurn, data: burnHash, isPending: isBurnPending } = useWriteContract();

  const { isLoading: isReviewConfirming } = useWaitForTransactionReceipt({ hash: reviewHash });
  const { isLoading: isBurnConfirming } = useWaitForTransactionReceipt({ hash: burnHash });

  const hasBook = bookBalance && Number(bookBalance) > 0;
  const hasBorrowAccess = borrowedUntil && Number(borrowedUntil) > Date.now() / 1000;
  const hasAccess = hasBook || hasBorrowAccess;
  const hasNotClaimed = Number(claimStatus) === 0; // Claim.None
  const hasBasicBadge = Number(claimStatus) === 1; // Claim.Basic
  const hasRareBadge = Number(claimStatus) === 2; // Claim.Rare

  const handleSubmitReview = async () => {
    if (!review.trim()) return;
    
    // Hash the review content
    const reviewHash = keccak256(toHex(review));
    
    writeReview({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'reviewAndClaimBasic',
      args: [BOOK_ID, reviewHash],
    });
  };

  const handleBurnForRare = async () => {
    writeBurn({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'burnForRare',
      args: [BOOK_ID],
    });
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Display */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-9xl">📖</span>
              </div>
              <div className="p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Book #1</h2>
                <p className="text-gray-600 mb-4">
                  This is a placeholder description. Book metadata will be provided by the backend API.
                </p>
                <div className="flex flex-wrap gap-2">
                  {hasBook && (
                    <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      You Own This
                    </span>
                  )}
                  {hasBorrowAccess && (
                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      Currently Borrowed
                    </span>
                  )}
                  {hasBasicBadge && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      ⭐ Basic Badge
                    </span>
                  )}
                  {hasRareBadge && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                      💎 Rare Badge
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {!isConnected ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-4">Please connect your wallet to interact with this book</p>
                <ConnectButton />
              </div>
            ) : (
              <>
                {/* Review & Claim Basic Badge */}
                {hasAccess && hasNotClaimed && !hasRareBadge && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">⭐ Write a Review & Earn Badge</h3>
                    {!showReviewForm ? (
                      <>
                        <p className="text-gray-600 mb-4">
                          Write a review to claim a Basic badge (soulbound NFT)
                        </p>
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Write Review
                        </button>
                      </>
                    ) : (
                      <>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your thoughts about this book..."
                          className="w-full border rounded-lg p-3 mb-4 min-h-[150px]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmitReview}
                            disabled={!review.trim() || isReviewPending || isReviewConfirming}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                          >
                            {isReviewPending || isReviewConfirming ? 'Submitting...' : 'Submit & Claim Badge'}
                          </button>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Burn for Rare Badge */}
                {hasBook && !hasRareBadge && (
                  <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-400">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Burn for Rare Badge</h3>
                    <p className="text-gray-600 mb-4">
                      Permanently burn your book to upgrade to a Rare badge NFT. This action cannot be undone!
                    </p>
                    {hasBasicBadge && (
                      <p className="text-sm text-gray-500 mb-4">
                        Note: Your Basic badge will also be burned in this process.
                      </p>
                    )}
                    <button
                      onClick={handleBurnForRare}
                      disabled={isBurnPending || isBurnConfirming}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                    >
                      {isBurnPending || isBurnConfirming ? 'Burning...' : 'Burn Book for Rare Badge'}
                    </button>
                  </div>
                )}

                {hasRareBadge && (
                  <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-400">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">💎 You have the Rare Badge!</h3>
                    <p className="text-gray-600">
                      Congratulations! You've earned the ultimate badge for this book.
                    </p>
                  </div>
                )}

                {!hasAccess && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Get Access</h3>
                    <p className="text-gray-600 mb-4">
                      You need to own or borrow this book to write reviews and earn badges.
                    </p>
                    <Link
                      href="/"
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Books
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

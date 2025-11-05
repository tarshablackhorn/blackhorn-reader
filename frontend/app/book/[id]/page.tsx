'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useBookData } from '@/hooks/useBookData';
import { getBookById } from '@/types/book';
import { useState, useEffect } from 'react';
import { keccak256, toHex } from 'viem';
import { toast } from 'sonner';
import { handleTransactionError, handleApiError } from '@/lib/errors';
import { useReviews } from '@/hooks/useReviews';

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const { isConnected, address } = useAccount();
  const [review, setReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  
  const bookId = BigInt(params.id);
  const book = getBookById(bookId);
  const { ownsBook, isBorrowed, hasBasicBadge, hasRareBadge, claimStatus } = useBookData(bookId);
  const { reviews, isLoading: reviewsLoading } = useReviews(Number(bookId));

  const { writeContract: writeReview, data: reviewHash, isPending: isReviewPending } = useWriteContract();
  const { writeContract: writeBurn, data: burnHash, isPending: isBurnPending } = useWriteContract();

  const { isLoading: isReviewConfirming } = useWaitForTransactionReceipt({ hash: reviewHash });
  const { isLoading: isBurnConfirming } = useWaitForTransactionReceipt({ hash: burnHash });

  const hasAccess = ownsBook || isBorrowed;
  const hasNotClaimed = claimStatus === 0;

  const handleSubmitReview = async () => {
    if (!review.trim() || !address) return;
    
    // Hash the review content
    const reviewHash = keccak256(toHex(review));
    
    // Submit to blockchain
    try {
      await writeReview({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'reviewAndClaimBasic',
        args: [bookId, reviewHash],
      });
      toast.loading('Submitting review and claiming badge...');
    } catch (error) {
      handleTransactionError(error);
      return;
    }

    // Submit to backend API
    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: Number(bookId),
          userAddress: address,
          reviewText: review,
          rating,
          reviewHash,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save review');
      }
      
      toast.success('Review saved to database');
    } catch (error) {
      handleApiError(error, 'Failed to save review to database');
    }
  };

  const handleBurnForRare = async () => {
    try {
      await writeBurn({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'burnForRare',
        args: [bookId],
      });
      toast.loading('Burning book for rare badge...');
    } catch (error) {
      handleTransactionError(error);
    }
  };

  useEffect(() => {
    if (isReviewConfirming) {
      toast.success('Basic Badge claimed! 🎉');
      setShowReviewForm(false);
      setReview('');
    }
  }, [isReviewConfirming]);

  useEffect(() => {
    if (isBurnConfirming) {
      toast.success('Rare Badge upgraded! 💎');
    }
  }, [isBurnConfirming]);


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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{book?.title || `Book #${bookId}`}</h2>
                <p className="text-gray-600 mb-4">
                  {book?.description || 'Book description not available.'}
                </p>
                {book?.author && (
                  <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
                )}
                {book?.genre && (
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mb-4">
                    {book.genre}
                  </span>
                )}
                <div className="flex flex-wrap gap-2">
                  {ownsBook && (
                    <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      You Own This
                    </span>
                  )}
                  {isBorrowed && (
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
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-2xl transition-transform hover:scale-110"
                              >
                                {star <= rating ? '⭐' : '☆'}
                              </button>
                            ))}
                          </div>
                        </div>
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
                {ownsBook && !hasRareBadge && (
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

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reader Reviews</h2>
          
          {reviewsLoading && (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Loading reviews...</p>
            </div>
          )}

          {!reviewsLoading && reviews.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
            </div>
          )}

          {!reviewsLoading && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.userAddress.slice(0, 6)}...{review.userAddress.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.timestamp).toLocaleDateString()}
                          </p>
                        </div>
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
                      <p className="text-gray-700 whitespace-pre-wrap">{review.reviewText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

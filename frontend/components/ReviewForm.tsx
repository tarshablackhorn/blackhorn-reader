'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { createReview, type CreateReviewPayload } from '@/lib/api';
import { toast } from 'sonner';
import { handleTransactionError } from '@/lib/errors';

interface ReviewFormProps {
  bookId: bigint;
  canReview: boolean;
  onSuccess?: () => void;
}

export function ReviewForm({ bookId, canReview, onSuccess }: ReviewFormProps) {
  const { address } = useAccount();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !canReview || !reviewText.trim()) {
      toast.error('Cannot submit review');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create review hash (keccak256 of review text)
      const reviewHash = keccak256(toBytes(reviewText));

      // Submit to blockchain first (claim Basic badge)
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'reviewAndClaimBasic',
        args: [bookId, reviewHash],
      });

      toast.loading('Claiming Basic badge on-chain...');

      // Wait for transaction to be mined
      // The useEffect below will handle storing to backend after confirmation
      
    } catch (error) {
      handleTransactionError(error);
      setIsSubmitting(false);
    }
  };

  // After transaction is confirmed, store review in backend
  useEffect(() => {
    const storeReview = async () => {
      if (!isSuccess || !address || !reviewText) return;

      try {
        const reviewHash = keccak256(toBytes(reviewText));
        
        const payload: CreateReviewPayload = {
          bookId: Number(bookId),
          userAddress: address,
          reviewText,
          rating,
          reviewHash,
        };

        await createReview(payload);
        
        toast.success('Review submitted and Basic badge claimed!');
        setReviewText('');
        setRating(5);
        onSuccess?.();
      } catch (error) {
        console.error('Failed to store review:', error);
        toast.error('Badge claimed but review storage failed');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (isSuccess) {
      storeReview();
    }
  }, [isSuccess, address, reviewText, rating, bookId, onSuccess]);

  if (!canReview) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          You need to borrow this book before you can review it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-3xl focus:outline-none"
            >
              {star <= rating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
          rows={6}
          placeholder="Share your thoughts about this book..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || isConfirming || isSubmitting || !reviewText.trim()}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
      >
        {isPending || isConfirming || isSubmitting
          ? 'Submitting...'
          : 'Submit Review & Claim Basic Badge'}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Reward:</strong> Submitting a review will mint you a soulbound Basic badge NFT!
        </p>
      </div>
    </form>
  );
}

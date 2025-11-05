'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  bookId: number;
  userAddress: string;
  reviewText: string;
  rating: number;
  reviewHash: string;
  timestamp: string;
}

export function useReviews(bookId?: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const url = bookId 
          ? `http://localhost:3001/api/reviews/${bookId}`
          : 'http://localhost:3001/api/reviews';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [bookId]);

  return { reviews, isLoading, error };
}

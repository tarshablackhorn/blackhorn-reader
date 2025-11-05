const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Book {
  id: number;
  title: string;
  description: string;
  author: string;
  genre: string;
  publishedYear: number;
  coverImage: string | null;
}

export interface Review {
  id: string;
  bookId: number;
  userAddress: string;
  reviewText: string;
  rating: number;
  reviewHash: string;
  timestamp: string;
}

export interface CreateReviewPayload {
  bookId: number;
  userAddress: string;
  reviewText: string;
  rating: number;
  reviewHash: string;
}

export interface BorrowRequest {
  id: string;
  bookId: number;
  borrowerAddress: string;
  durationDays: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  txHash?: string;
}

export interface CreateBorrowRequestPayload {
  bookId: number;
  borrowerAddress: string;
  durationDays: number;
}

// Books API
export async function fetchBooks(): Promise<Book[]> {
  const response = await fetch(`${API_URL}/api/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function fetchBookById(id: number): Promise<Book> {
  const response = await fetch(`${API_URL}/api/books/${id}`);
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
}

// Reviews API
export async function fetchReviews(bookId?: number, userAddress?: string): Promise<Review[]> {
  const params = new URLSearchParams();
  if (bookId) params.append('bookId', bookId.toString());
  if (userAddress) params.append('userAddress', userAddress);
  
  const url = `${API_URL}/api/reviews${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create review');
  }
  
  return response.json();
}

// Borrow Requests API
export async function fetchBorrowRequests(
  bookId?: number,
  borrowerAddress?: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<BorrowRequest[]> {
  const params = new URLSearchParams();
  if (bookId) params.append('bookId', bookId.toString());
  if (borrowerAddress) params.append('borrowerAddress', borrowerAddress);
  if (status) params.append('status', status);
  
  const url = `${API_URL}/api/borrow-requests${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch borrow requests');
  return response.json();
}

export async function createBorrowRequest(payload: CreateBorrowRequestPayload): Promise<BorrowRequest> {
  const response = await fetch(`${API_URL}/api/borrow-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create borrow request');
  }
  
  return response.json();
}

export async function updateBorrowRequest(
  id: string,
  updates: { status?: 'pending' | 'approved' | 'rejected'; txHash?: string }
): Promise<BorrowRequest> {
  const response = await fetch(`${API_URL}/api/borrow-requests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update borrow request');
  }
  
  return response.json();
}

export async function deleteBorrowRequest(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/borrow-requests/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete borrow request');
  }
}

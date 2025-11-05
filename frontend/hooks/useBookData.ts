'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOOK_ID, basicBadgeId, rareBadgeId } from '@/lib/contract';

export function useBookData(bookId: bigint = BOOK_ID) {
  const { address } = useAccount();

  // Check if user owns the book
  const { data: bookBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address, bookId] : undefined,
  });

  // Check borrow status
  const { data: borrowedUntil } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'borrowedUntil',
    args: address ? [bookId, address] : undefined,
  });

  // Check claim status (0 = None, 1 = Basic, 2 = Rare)
  const { data: claimStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'claimOf',
    args: address ? [bookId, address] : undefined,
  });

  // Check basic badge balance
  const { data: basicBadgeBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address, basicBadgeId(bookId)] : undefined,
  });

  // Check rare badge balance
  const { data: rareBadgeBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address, rareBadgeId(bookId)] : undefined,
  });

  const ownsBook = bookBalance !== undefined && bookBalance !== null && (bookBalance as bigint) > 0n;
  const isBorrowed = borrowedUntil !== undefined && borrowedUntil !== null && (borrowedUntil as bigint) > BigInt(Math.floor(Date.now() / 1000));
  const hasBasicBadge = basicBadgeBalance !== undefined && basicBadgeBalance !== null && (basicBadgeBalance as bigint) > 0n;
  const hasRareBadge = rareBadgeBalance !== undefined && rareBadgeBalance !== null && (rareBadgeBalance as bigint) > 0n;
  const canReview = isBorrowed && claimStatus === 0;

  return {
    bookBalance,
    borrowedUntil,
    claimStatus,
    basicBadgeBalance,
    rareBadgeBalance,
    ownsBook,
    isBorrowed,
    hasBasicBadge,
    hasRareBadge,
    canReview,
  };
}

'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useBookData } from '@/hooks/useBookData';
import { useGasCheck } from '@/hooks/useGasCheck';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { handleTransactionError } from '@/lib/errors';
import { formatEther } from 'viem';

interface BookCardProps {
  bookId: bigint;
  title: string;
  description: string;
  coverImage?: string | null;
}

export function BookCard({ bookId, title, description, coverImage }: BookCardProps) {
  const { address, isConnected } = useAccount();
  const { ownsBook, isBorrowed, borrowedUntil } = useBookData(bookId);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { checkBalance } = useGasCheck();
  const [borrowDuration, setBorrowDuration] = useState<number>(7); // days
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch book price
  const { data: bookPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'bookPrices',
    args: [bookId],
  });

  const handleBorrow = async () => {
    if (!address || !ownsBook) return;
    
    // Check balance before transaction
    if (!checkBalance()) return;
    
    const durationSeconds = BigInt(borrowDuration * 24 * 60 * 60);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'lend',
        args: [bookId, address, durationSeconds],
      });
      toast.loading('Borrowing book...');
    } catch (error) {
      handleTransactionError(error);
    }
  };

  const handlePurchase = async () => {
    if (!address || !bookPrice) return;
    
    // Check balance before transaction
    if (!checkBalance()) return;
    
    setIsPurchasing(true);
    
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'purchaseBook',
        args: [bookId],
        value: bookPrice as bigint,
      });
      
      toast.loading('Purchasing book...');
    } catch (error) {
      handleTransactionError(error);
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction confirmed!');
    }
  }, [isSuccess]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">📖</span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        {!isConnected && (
          <p className="text-sm text-gray-500 mb-4">Connect your wallet to borrow</p>
        )}

        {isConnected && ownsBook && !isBorrowed && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borrow Duration (days)
              </label>
              <input
                type="number"
                value={borrowDuration}
                onChange={(e) => setBorrowDuration(Number(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleBorrow}
              disabled={isPending || isConfirming}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isPending || isConfirming ? 'Borrowing...' : 'Borrow Book'}
            </button>
            {isSuccess && (
              <p className="text-green-600 text-sm">Successfully borrowed!</p>
            )}
          </div>
        )}

        {isConnected && isBorrowed && typeof borrowedUntil === 'bigint' && (
          <div className="space-y-2">
            <p className="text-green-600 font-medium">✓ Currently Borrowed</p>
            <p className="text-sm text-gray-600">
              Due: {formatDate(borrowedUntil as bigint)}
            </p>
            <Link
              href={`/book/${bookId}`}
              className="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Read & Review
            </Link>
          </div>
        )}

        {isConnected && !ownsBook && typeof bookPrice === 'bigint' && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatEther(bookPrice as bigint)} ETH
              </p>
              <p className="text-sm text-gray-500">Purchase Price</p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={isPurchasing || isPending || isConfirming}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isPurchasing || isPending || isConfirming ? 'Purchasing...' : '🛒 Purchase Book'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

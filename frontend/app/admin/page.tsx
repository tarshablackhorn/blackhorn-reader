'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { fetchBorrowRequests, updateBorrowRequest, fetchBooks, type BorrowRequest, type Book } from '@/lib/api';
import { toast } from 'sonner';
import { handleTransactionError } from '@/lib/errors';
import { parseEther, formatEther } from 'viem';

export default function AdminPage() {
  const { address } = useAccount();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<{[key: number]: string}>({});

  // Check if current user is the owner
  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isOwner = address && contractOwner && 
    address.toLowerCase() === (contractOwner as string).toLowerCase();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchBorrowRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load borrow requests:', error);
      toast.error('Failed to load borrow requests');
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  useEffect(() => {
    loadRequests();
    loadBooks();
  }, []);

  const handleSetPrice = async (bookId: number) => {
    if (!address || !isOwner) return;
    const priceInput = priceInputs[bookId];
    if (!priceInput) return;

    try {
      const priceInWei = parseEther(priceInput);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'setBookPrice',
        args: [BigInt(bookId), priceInWei],
      });

      toast.loading('Setting book price...');
    } catch (error) {
      handleTransactionError(error);
    }
  };

  const handleApprove = async (request: BorrowRequest) => {
    if (!address || !isOwner) return;

    setProcessingRequestId(request.id);
    
    try {
      const durationSeconds = BigInt(request.durationDays * 24 * 60 * 60);
      
      // Call contract lend function
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'lend',
        args: [BigInt(request.bookId), request.borrowerAddress as `0x${string}`, durationSeconds],
      });

      toast.loading('Processing lending transaction...');
    } catch (error) {
      handleTransactionError(error);
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (request: BorrowRequest) => {
    try {
      await updateBorrowRequest(request.id, { status: 'rejected' });
      toast.success('Request rejected');
      loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject request');
    }
  };

  // Update backend when transaction confirms
  useEffect(() => {
    const updateBackend = async () => {
      if (!isSuccess || !hash) return;

      // If we're processing a borrow request
      if (processingRequestId) {
        try {
          await updateBorrowRequest(processingRequestId, {
            status: 'approved',
            txHash: hash,
          });
          
          toast.success('Book lent successfully!');
          loadRequests();
        } catch (error) {
          console.error('Failed to update backend:', error);
          toast.error('Transaction succeeded but failed to update status');
        } finally {
          setProcessingRequestId(null);
        }
      } else {
        // Price was set successfully
        toast.success('Book price set successfully!');
      }
    };

    if (isSuccess) {
      updateBackend();
    }
  }, [isSuccess, processingRequestId, hash]);

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">🔐 Admin Dashboard</h1>
              <ConnectButton />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Please connect your wallet to access the admin dashboard</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">🔐 Admin Dashboard</h1>
              <ConnectButton />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-800 font-medium">Access Denied</p>
            <p className="text-red-600 mt-2">You are not the contract owner</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                ← Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">🔐 Admin Dashboard</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Price Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Manage Book Prices</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-4">
              Set prices for books so users can purchase them. Default: 0.001 ETH for Book #1.
            </p>
            <div className="space-y-4">
              {books.map((book) => (
                <div key={book.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">Book #{book.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.001"
                      value={priceInputs[book.id] || ''}
                      onChange={(e) => setPriceInputs({...priceInputs, [book.id]: e.target.value})}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">ETH</span>
                    <button
                      onClick={() => handleSetPrice(book.id)}
                      disabled={isPending || isConfirming || !priceInputs[book.id]}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      Set Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Borrow Requests ({pendingRequests.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No pending borrow requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Book #{request.bookId}
                        </h3>
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Borrower:</strong> {request.borrowerAddress}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Duration:</strong> {request.durationDays} days
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={isPending || isConfirming || processingRequestId === request.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                      >
                        {processingRequestId === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        disabled={isPending || isConfirming}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity ({processedRequests.length})
          </h2>

          {processedRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No processed requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Book #{request.bookId}
                        </h3>
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded-full ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Borrower:</strong> {request.borrowerAddress}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Duration:</strong> {request.durationDays} days
                      </p>
                      {request.txHash && (
                        <p className="text-sm text-blue-600">
                          <a
                            href={`https://sepolia.basescan.org/tx/${request.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View Transaction ↗
                          </a>
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(request.updatedAt).toLocaleString()}
                    </p>
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

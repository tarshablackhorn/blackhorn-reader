'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useBookData } from '@/hooks/useBookData';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { getAllBooks, getBookById } from '@/types/book';

function BorrowedBookCard({ bookId }: { bookId: bigint }) {
  const { isBorrowed, borrowedUntil, canReview } = useBookData(bookId);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const book = getBookById(bookId);

  const handleReturn = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'returnEarly',
      args: [bookId],
    });
  };

  const dueDate = borrowedUntil ? new Date(Number(borrowedUntil) * 1000) : null;
  const isOverdue = borrowedUntil && (borrowedUntil as bigint) < BigInt(Math.floor(Date.now() / 1000));

  if (!isBorrowed) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-6xl">📖</span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{book?.title || `Book #${bookId}`}</h3>
        <div className="mb-4">
          <span className={`inline-block text-sm px-3 py-1 rounded-full ${
            isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {isOverdue ? '⚠️ Overdue' : '✓ Active Borrow'}
          </span>
        </div>
        {dueDate && (
          <p className="text-gray-600 mb-4">
            Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
          </p>
        )}
        <div className="space-y-2">
          <Link 
            href={`/book/${bookId}`}
            className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {canReview ? 'Read & Review' : 'View Details'}
          </Link>
          <button
            onClick={handleReturn}
            disabled={isPending || isConfirming}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
          >
            {isPending || isConfirming ? 'Returning...' : 'Return Early'}
          </button>
          {isSuccess && (
            <p className="text-green-600 text-sm">Successfully returned!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyBooksPage() {
  const { isConnected } = useAccount();
  const allBooks = getAllBooks();
  
  // Check if user has any borrowed books
  const borrowedBookIds = allBooks.map(book => book.id).filter(bookId => {
    const { isBorrowed } = useBookData(bookId);
    return isBorrowed;
  });

  const hasAnyBorrowedBooks = borrowedBookIds.length > 0;

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
            <Link href="/my-books" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Borrowed Books</h2>
          <p className="text-gray-600">Books you currently have on loan</p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Please connect your wallet to view your borrowed books</p>
            <ConnectButton />
          </div>
        ) : !hasAnyBorrowedBooks ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600">You don't have any books borrowed at the moment</p>
            <Link 
              href="/"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBooks.map(book => (
              <BorrowedBookCard key={book.id.toString()} bookId={book.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

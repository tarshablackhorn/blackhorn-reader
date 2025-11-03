'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Home() {
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
            <Link href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Books</h2>
          <p className="text-gray-600">Browse and borrow books from the Blackhorn Reader collection</p>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Book Card - Currently hardcoded, will be dynamic with backend */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book #1</h3>
              <p className="text-gray-600 mb-4">
                Connect your wallet to view book details and request to borrow.
              </p>
              <div className="space-y-2">
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

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-bold text-gray-900 mb-2">Browse & Borrow</h4>
              <p className="text-gray-600">Request to borrow books from the collection</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⭐</div>
              <h4 className="font-bold text-gray-900 mb-2">Review & Earn</h4>
              <p className="text-gray-600">Write reviews to claim Basic badges (soulbound NFTs)</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔥</div>
              <h4 className="font-bold text-gray-900 mb-2">Burn for Rare</h4>
              <p className="text-gray-600">Burn your book to upgrade to a Rare badge NFT</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOOK_ID } from '@/lib/contract';

export function ContractTest() {
  const { address, isConnected } = useAccount();

  // Test reading balanceOf
  const { data: balance, isError: balanceError, isLoading: balanceLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address, BOOK_ID] : undefined,
  });

  // Test reading borrowedUntil
  const { data: borrowedUntil, isError: borrowedError, isLoading: borrowedLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'borrowedUntil',
    args: address ? [BOOK_ID, address] : undefined,
  });

  // Test reading claimOf
  const { data: claim, isError: claimError, isLoading: claimLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'claimOf',
    args: address ? [BOOK_ID, address] : undefined,
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contract Test</h1>
      
      <div className="mb-6">
        <ConnectButton />
      </div>

      {isConnected && address && (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Connected Address:</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Contract Address:</p>
            <p className="font-mono text-sm break-all">{CONTRACT_ADDRESS}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
            <h3 className="font-semibold mb-2">balanceOf(address, BOOK_ID)</h3>
            {balanceLoading && <p className="text-sm">Loading...</p>}
            {balanceError && <p className="text-red-500 text-sm">Error reading balance</p>}
            {balance !== undefined && (
              <p className="font-mono">Balance: {balance.toString()}</p>
            )}
          </div>

          <div className="bg-green-50 dark:bg-green-900 p-4 rounded">
            <h3 className="font-semibold mb-2">borrowedUntil(BOOK_ID, address)</h3>
            {borrowedLoading && <p className="text-sm">Loading...</p>}
            {borrowedError && <p className="text-red-500 text-sm">Error reading borrow status</p>}
            {borrowedUntil !== undefined && (
              <p className="font-mono">Borrowed Until: {borrowedUntil.toString()}</p>
            )}
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded">
            <h3 className="font-semibold mb-2">claimOf(BOOK_ID, address)</h3>
            {claimLoading && <p className="text-sm">Loading...</p>}
            {claimError && <p className="text-red-500 text-sm">Error reading claim</p>}
            {claim !== undefined && (
              <p className="font-mono">Claim Status: {claim.toString()}</p>
            )}
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Connect your wallet to test contract reads
        </div>
      )}
    </div>
  );
}

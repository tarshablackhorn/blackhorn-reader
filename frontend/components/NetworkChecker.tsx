'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function NetworkChecker() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === baseSepolia.id;

  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      toast.error('Wrong network detected', {
        description: 'Please switch to Base Sepolia',
        action: {
          label: 'Switch Network',
          onClick: () => switchChain?.({ chainId: baseSepolia.id }),
        },
        duration: Infinity,
      });
    }
  }, [isConnected, isCorrectNetwork, switchChain]);

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-bold text-red-900 mb-1">Wrong Network</h3>
          <p className="text-sm text-red-700 mb-3">
            You're connected to the wrong network. Please switch to Base Sepolia to use this app.
          </p>
          <button
            onClick={() => switchChain?.({ chainId: baseSepolia.id })}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Switch to Base Sepolia
          </button>
        </div>
      </div>
    </div>
  );
}

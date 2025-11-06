'use client';

import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';

const MIN_BALANCE_ETH = '0.005'; // Minimum balance required for transactions

export function useGasCheck() {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  const checkBalance = (): boolean => {
    if (!balance) {
      toast.error('Unable to check balance', {
        description: 'Please try again',
      });
      return false;
    }

    const minBalance = parseEther(MIN_BALANCE_ETH);
    
    if (balance.value < minBalance) {
      toast.error('Insufficient balance for gas', {
        description: `You need at least ${MIN_BALANCE_ETH} ETH for transaction fees`,
        duration: 5000,
      });
      return false;
    }

    // Warn if balance is low (less than 0.01 ETH)
    if (balance.value < parseEther('0.01')) {
      toast.warning('Low balance warning', {
        description: 'Consider adding more ETH for future transactions',
        duration: 4000,
      });
    }

    return true;
  };

  const hasMinimumBalance = balance ? balance.value >= parseEther(MIN_BALANCE_ETH) : false;

  return {
    balance,
    checkBalance,
    hasMinimumBalance,
  };
}

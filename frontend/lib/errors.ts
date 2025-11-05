import { toast } from 'sonner';

export function handleTransactionError(error: any) {
  console.error('Transaction error:', error);

  // User rejected transaction
  if (error?.message?.includes('User rejected') || error?.code === 4001) {
    toast.error('Transaction rejected');
    return;
  }

  // Insufficient funds
  if (error?.message?.includes('insufficient funds')) {
    toast.error('Insufficient funds for gas', {
      description: 'You need more ETH to pay for transaction fees',
    });
    return;
  }

  // Gas estimation failed
  if (error?.message?.includes('gas required exceeds allowance')) {
    toast.error('Transaction would fail', {
      description: 'This transaction cannot be executed',
    });
    return;
  }

  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('Network')) {
    toast.error('Network error', {
      description: 'Please check your internet connection',
    });
    return;
  }

  // Contract revert errors
  if (error?.message?.includes('execution reverted')) {
    // Parse revert reason if available
    const revertReason = error?.message?.match(/reason="([^"]*)"/)?.[1];
    
    if (revertReason?.includes('AlreadyLent')) {
      toast.error('Book already lent out');
      return;
    }
    
    if (revertReason?.includes('NotLent')) {
      toast.error('Book is not currently lent');
      return;
    }
    
    if (revertReason?.includes('LendingActive')) {
      toast.error('Cannot perform action while book is lent');
      return;
    }
    
    if (revertReason?.includes('Soulbound')) {
      toast.error('This badge cannot be transferred', {
        description: 'Basic badges are soulbound NFTs',
      });
      return;
    }
    
    if (revertReason?.includes('no read access')) {
      toast.error('No access to this book', {
        description: 'You need to own or borrow this book',
      });
      return;
    }
    
    if (revertReason?.includes('already claimed')) {
      toast.error('You already claimed a badge for this book');
      return;
    }
    
    if (revertReason?.includes('no book')) {
      toast.error("You don't own this book");
      return;
    }

    // Generic revert
    toast.error('Transaction failed', {
      description: revertReason || 'The contract rejected the transaction',
    });
    return;
  }

  // Generic error
  toast.error('Transaction failed', {
    description: error?.message || 'An unexpected error occurred',
  });
}

export function handleApiError(error: any, defaultMessage: string = 'API request failed') {
  console.error('API error:', error);
  
  if (!navigator.onLine) {
    toast.error('No internet connection');
    return;
  }
  
  toast.error(defaultMessage, {
    description: error?.message || 'Please try again later',
  });
}

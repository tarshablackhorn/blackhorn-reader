'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { getConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { useState, useMemo, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  const config = useMemo(() => getConfig(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';

let cachedConfig: ReturnType<typeof getDefaultConfig> | null = null;

export const getConfig = () => {
  if (typeof window === 'undefined') {
    // Return a basic config without WalletConnect for SSR
    return createConfig({
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http(),
      },
      ssr: true,
    });
  }

  if (!cachedConfig) {
    cachedConfig = getDefaultConfig({
      appName: 'Blackhorn Reader',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
      chains: [baseSepolia],
      ssr: true,
    });
  }

  return cachedConfig;
};

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Blackhorn Reader',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia, polygon],
  ssr: true,
});

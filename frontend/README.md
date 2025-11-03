# Blackhorn Reader Frontend

A decentralized book lending and review platform built with Next.js, featuring NFT books and reward badges.

## Features

- 📚 **Browse Books**: View available books from the collection
- 📖 **Borrow Books**: Track books you've borrowed and their due dates
- ⭐ **Write Reviews**: Earn Basic badges (soulbound NFTs) by writing reviews
- 🔥 **Burn for Rare**: Burn books to upgrade to Rare badges (tradeable NFTs)
- 🎨 **NFT Collection**: View all your owned books and badges

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript**
- **Tailwind CSS 4** for styling
- **Wagmi v2** for Ethereum interactions
- **Viem** for Ethereum utilities
- **RainbowKit** for wallet connections
- **TanStack React Query** for data fetching

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- pnpm 10+
- A Web3 wallet (MetaMask, Rainbow, etc.)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Get one from [WalletConnect Cloud](https://cloud.walletconnect.com/)

3. Configure the contract address in `lib/contract.ts`:
```typescript
export const CONTRACT_ADDRESS: Address = '0xYourDeployedContractAddress';
```

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home - Browse books
│   ├── my-books/          # Borrowed books page
│   ├── collection/        # NFT collection page
│   └── book/[id]/         # Book details page
├── components/
│   └── Providers.tsx      # Web3 providers wrapper
├── lib/
│   ├── abi.json          # Contract ABI
│   ├── contract.ts       # Contract configuration
│   └── wagmi.ts          # Wagmi configuration
└── public/               # Static assets
```

## Smart Contract Integration

The frontend connects to the `BlackhornReader` smart contract with the following features:

### Contract Functions Used

- `balanceOf(address, tokenId)`: Check NFT ownership
- `borrowedUntil(bookId, address)`: Check borrow status
- `claimOf(bookId, address)`: Check badge claim status
- `reviewAndClaimBasic(bookId, reviewHash)`: Submit review and claim Basic badge
- `burnForRare(bookId)`: Burn book to get Rare badge

### Token IDs

- **Book**: Token ID `1`
- **Basic Badge**: Token ID `1000001` (1,000,000 + bookId)
- **Rare Badge**: Token ID `2000001` (2,000,000 + bookId)

## Next Steps

### Backend Integration

The frontend is ready for backend integration to provide:

1. **Book Metadata**: Titles, descriptions, cover images, authors
2. **Review Storage**: Full review content (contract only stores hashes)
3. **Event Indexing**: Faster queries for borrow history, reviews, etc.
4. **User Profiles**: Enhanced user experience with profiles and stats
5. **Notifications**: Alerts for due dates, new books, etc.

### Features to Add

- [ ] Book lending request flow (currently owner-controlled)
- [ ] Search and filter books
- [ ] Review display (fetch from backend)
- [ ] User profiles and stats
- [ ] Multiple book support
- [ ] Book return functionality
- [ ] Due date reminders
- [ ] Transaction history

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID for wallet connections | Yes |

## Troubleshooting

### Contract reads return undefined

- Ensure `CONTRACT_ADDRESS` in `lib/contract.ts` is set to your deployed contract
- Check that you're connected to the correct network
- Verify the contract is deployed on the network you're connected to

### Wallet connection issues

- Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`
- Try clearing browser cache and reconnecting

### Transaction failures

- Check you have sufficient funds for gas
- Verify you meet the requirements (e.g., own or borrowed the book for reviews)
- Check if you've already claimed a badge

## Contributing

This is part of the Blackhorn Reader monorepo. See the root README for contribution guidelines.

## License

ISC

import { Address } from 'viem';
import abi from './abi.json';

// TODO: Replace with your actual deployed contract address
export const CONTRACT_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

export const CONTRACT_ABI = abi as const;

// Constants from the contract
export const BOOK_ID = 1n;
export const BASIC_BADGE_BASE = 1_000_000n;
export const RARE_BADGE_BASE = 2_000_000n;

export const basicBadgeId = (bookId: bigint) => BASIC_BADGE_BASE + bookId;
export const rareBadgeId = (bookId: bigint) => RARE_BADGE_BASE + bookId;

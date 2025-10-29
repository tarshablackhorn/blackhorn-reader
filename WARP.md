# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Blackhorn Reader is a full-stack application with three main components:
- **backend/**: Server-side API and business logic
- **frontend/**: Client-side user interface
- **contracts/**: Smart contracts (likely Solidity/blockchain-related)

## Package Manager

This project uses **pnpm** as its package manager (specified in package.json).
- Install dependencies: `pnpm install`
- Add packages: `pnpm add <package-name>`
- Add dev dependencies: `pnpm add -D <package-name>`

## Architecture

### Monorepo Structure
The project follows a monorepo pattern with separate directories for each layer:
1. **contracts/**: Blockchain smart contracts - handle on-chain logic and data storage
2. **backend/**: Backend API server - provides off-chain services and interfaces with contracts
3. **frontend/**: Web application - user-facing interface that interacts with backend and/or contracts

### Development Approach
- Each component (backend, frontend, contracts) should be independently testable
- Backend acts as middleware between frontend and blockchain when needed
- Consider workspace configuration in package.json if components share dependencies

## Common Commands

Note: As the project is newly initialized, specific build/test/lint commands will be added to package.json scripts. Check package.json for the latest commands.

### Testing
- Run all tests: `pnpm test` (currently not configured)
- When implemented, each subdirectory may have its own test script

### Development
- Development commands will be added as the project evolves
- Likely patterns: `pnpm dev` for local development, `pnpm build` for production builds

## Future Considerations

As this codebase grows, update this file with:
- Specific framework choices (e.g., React/Vue/Next.js for frontend, Express/Fastify for backend, Hardhat/Foundry for contracts)
- Environment variable requirements
- Database connection and migration commands
- Contract deployment procedures
- API endpoint conventions
- State management patterns
- Testing framework specifics

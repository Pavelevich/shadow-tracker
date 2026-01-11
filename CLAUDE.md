# Solana Privacy Hackathon - Claude Code Configuration

## Project Overview

This is a Solana privacy hackathon project focused on:
- Privacy-enabled applications (Privacy Cash SDK)
- ZK proofs with Noir
- Confidential DeFi with Arcium C-SPL tokens
- Encrypted computation with Inco Lightning
- High-performance RPCs (Helius, Triton)
- Crypto surveillance and compliance tools
- Bounty hunting and CTF challenges

## Custom Skills

The following custom skills are available in this project:

### /privacy-hack
Build privacy-focused Solana applications. Use for:
- Shielding tokens (public → private)
- Private transfers
- Generating shielded addresses
- ZK proof integration

### /encryption-trading
Confidential trading applications. Use for:
- Hidden order books
- Private swaps
- Encrypted market making
- Dark pool implementations

### /bounty-hunter
Security analysis and bounty hunting. Use for:
- Program vulnerability analysis
- Bounty submission
- CTF challenges
- Exploit pattern detection

## Key Files

- `src/index.ts` - Main exports and quick start
- `src/rpc/helius.ts` - Helius RPC integration
- `src/rpc/triton.ts` - Triton RPC integration
- `src/privacy/privacy-cash-sdk.ts` - Privacy Cash SDK
- `src/zk/noir-verifier.ts` - Noir ZK proof tools
- `src/defi/arcium.ts` - Arcium confidential DeFi
- `src/payments/inco-lightning.ts` - Inco encrypted computation
- `src/utils/crypto-surveillance.ts` - Compliance tools
- `src/utils/bounty-hunter.ts` - Security analysis

## Environment Setup

Copy `.env.example` to `.env` and configure:
- HELIUS_API_KEY - Get from https://helius.dev
- TRITON_RPC_URL - Hackathon access provided
- PRIVACY_CASH_API_KEY - Privacy Cash credentials
- ARCIUM_API_KEY - Arcium credentials
- INCO_API_KEY - Inco Lightning credentials

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Compile TypeScript
npm run test         # Run tests
npm run helius:test  # Test Helius connection
npm run triton:test  # Test Triton connection
npm run privacy:demo # Run privacy demo
npm run zk:compile   # Compile Noir circuits
```

## Hackathon Tracks

1. **Privacy Payments** - Using Privacy Cash SDK
2. **Confidential DeFi** - Using Arcium C-SPL
3. **ZK Applications** - Using Noir circuits
4. **Encrypted Gaming** - Using Inco Lightning
5. **Compliance Tools** - Using surveillance utilities

## Resources

- Helius: https://docs.helius.dev
- Noir: https://noir-lang.org/docs
- Arcium: https://docs.arcium.com
- Inco: https://docs.inco.network

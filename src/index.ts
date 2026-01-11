/**
 * Solana Privacy Hackathon - Main Entry Point
 *
 * This project provides tools and integrations for building
 * privacy-focused applications on Solana.
 *
 * Features:
 * - Privacy Cash SDK for shielded transfers
 * - Helius & Triton RPCs for high-performance access
 * - Noir ZK proofs for zero-knowledge applications
 * - Arcium C-SPL for confidential DeFi
 * - Inco Lightning for encrypted computation
 */

// RPC Providers
export { HeliusRPC, type HeliusConfig } from './rpc/helius';
export { TritonRPC, type TritonConfig } from './rpc/triton';

// Privacy Tools
export { PrivacyCashSDK, type PrivacyCashConfig, type ShieldedTransfer } from './privacy/privacy-cash-sdk';

// ZK Proofs
export { NoirVerifier, type NoirCircuit, type ProofData } from './zk/noir-verifier';

// Confidential DeFi
export { ArciumSDK, type ArciumConfig, type ConfidentialMint, type ConfidentialAccount } from './defi/arcium';

// Encrypted Computation
export { IncoLightning, type IncoConfig, type EncryptedInput, type EncryptedOutput } from './payments/inco-lightning';

// Quick Start Example
async function main() {
  console.log('='.repeat(60));
  console.log('  SOLANA PRIVACY HACKATHON');
  console.log('  Build Privacy-First Applications on Solana');
  console.log('='.repeat(60));
  console.log();

  console.log('Available Modules:');
  console.log('  1. HeliusRPC      - High-performance RPC with webhooks');
  console.log('  2. TritonRPC      - Hackathon-exclusive RPC infrastructure');
  console.log('  3. PrivacyCashSDK - Shielded transfers and balances');
  console.log('  4. NoirVerifier   - ZK proof generation and verification');
  console.log('  5. ArciumSDK      - C-SPL confidential tokens');
  console.log('  6. IncoLightning  - Encrypted computation for all use cases');
  console.log();

  console.log('Quick Start:');
  console.log(`
import { HeliusRPC, PrivacyCashSDK, ArciumSDK } from 'solana-privacy-hack';

// Initialize RPC
const helius = new HeliusRPC({
  apiKey: process.env.HELIUS_API_KEY!,
  cluster: 'devnet'
});

// Initialize Privacy SDK
const privacy = new PrivacyCashSDK({
  apiKey: process.env.PRIVACY_CASH_API_KEY!,
  network: 'devnet'
});

// Create shielded address
const { shieldedAddress } = await privacy.generateShieldedAddress(viewingKey);

// Shield tokens (public -> private)
await privacy.shieldTokens({
  wallet,
  mint: tokenMint,
  amount: BigInt(1000000),
  shieldedAddress
});

// Private transfer
await privacy.privateTransfer({
  spendingKey,
  transfers: [{ amount: BigInt(500000), recipient: recipientShieldedAddress }]
});
  `);

  console.log('Documentation: ./docs/');
  console.log('Examples: ./examples/');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

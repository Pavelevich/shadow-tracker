# Encryption Trading Skill

Build confidential trading applications with hidden order books, private swaps, and encrypted market making.

## Overview

Enable trading where:
- Order prices and sizes are hidden until execution
- Trade history is private to participants
- Market makers can provide liquidity without revealing strategy
- Compliance requirements are still met via auditor keys

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Encrypted Trading                     │
├─────────────────────────────────────────────────────┤
│  User Wallet  →  Encrypt Order  →  Matching Engine   │
│                      ↓                    ↓          │
│              ZK Proof Gen          Verify Proofs     │
│                      ↓                    ↓          │
│              Submit to Chain      Execute Trades     │
│                      ↓                    ↓          │
│              Encrypted Logs       Settlement         │
└─────────────────────────────────────────────────────┘
```

## Implementation

### Encrypted Limit Order
```typescript
import { IncoLightning } from '../src/payments/inco-lightning';

const inco = new IncoLightning({
  apiKey: process.env.INCO_API_KEY!,
  network: 'testnet'
});

// Create encrypted order (price and size hidden)
const order = await inco.createConfidentialOrder({
  trader: wallet,
  market: marketPubkey,
  side: 'buy',
  price: BigInt(100_000000), // Hidden from others
  size: BigInt(10_000000)    // Hidden from others
});

console.log('Order ID:', order.orderId);
// Order details are encrypted - only you and the matching engine can see
```

### Private Swap
```typescript
// Execute swap with hidden amounts
const result = await inco.confidentialSwap({
  user: wallet,
  poolAddress: ammPool,
  inputMint: tokenA,
  outputMint: tokenB,
  inputAmount: BigInt(1000_000000),
  minOutputAmount: BigInt(950_000000)
});

// Decrypt your output amount
const outputAmount = await inco.decryptOutput(
  result.outputAmount,
  inco.deriveKeyFromWallet(wallet)
);
```

### Confidential Market Making
```typescript
import { ArciumSDK } from '../src/defi/arcium';

const arcium = new ArciumSDK({
  apiKey: process.env.ARCIUM_API_KEY!,
  network: 'devnet',
  connection
});

// Deposit liquidity confidentially
await arcium.deposit({
  account: mmAccount,
  owner: mmWallet,
  amount: BigInt(100000_000000)
});

// Place confidential quotes
// Spread and inventory are hidden from competitors
```

## Security Considerations

1. **Key Management**: Store encryption keys securely
2. **Proof Verification**: Always verify proofs on-chain
3. **Auditor Access**: Consider adding auditor keys for compliance
4. **Front-running Protection**: Encrypted orders prevent front-running

## Use Cases

- **Dark Pools**: Large orders without market impact
- **Private OTC**: Bilateral trades with price privacy
- **Stealth Trading**: Strategy concealment for funds
- **Compliance Trading**: Auditable but private execution

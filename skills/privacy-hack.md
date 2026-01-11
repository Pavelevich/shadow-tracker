# Privacy Hackathon Skill

Build privacy-focused applications on Solana with ZK proofs, confidential transfers, and encrypted computation.

## Quick Commands

### Initialize Project
```bash
cd ~/Desktop/solana-privacy-hack
npm install
cp .env.example .env
# Configure your API keys in .env
```

### Available Integrations

1. **Privacy Cash SDK** - Shielded transfers and balances
2. **Helius RPC** - High-performance Solana RPC
3. **Triton RPC** - Hackathon-exclusive infrastructure
4. **Noir** - ZK circuit development
5. **Arcium** - C-SPL confidential tokens
6. **Inco Lightning** - Encrypted computation

## Code Examples

### Shield Tokens (Public → Private)
```typescript
import { PrivacyCashSDK } from './src/privacy/privacy-cash-sdk';

const sdk = new PrivacyCashSDK({
  apiKey: process.env.PRIVACY_CASH_API_KEY!,
  network: 'devnet'
});

// Generate shielded address
const { shieldedAddress } = await sdk.generateShieldedAddress(viewingKey);

// Shield tokens
await sdk.shieldTokens({
  wallet,
  mint: tokenMint,
  amount: BigInt(1000000),
  shieldedAddress
});
```

### Create ZK Proof with Noir
```typescript
import { NoirVerifier } from './src/zk/noir-verifier';

const noir = new NoirVerifier(connection, verifierProgramId);

// Initialize new Noir project
await noir.initNoirProject('my-circuit', 'merkle');

// Generate proof
const proof = await noir.generateProof('./my-circuit', {
  leaf: '0x123...',
  root: '0x456...',
  path: [...],
  indices: [...]
});
```

### Confidential DeFi with Arcium
```typescript
import { ArciumSDK } from './src/defi/arcium';

const arcium = new ArciumSDK({
  apiKey: process.env.ARCIUM_API_KEY!,
  network: 'devnet',
  connection
});

// Create confidential token
const mint = await arcium.createConfidentialMint({
  authority: wallet,
  decimals: 9,
  autoApproveNewAccounts: true
});

// Confidential transfer
await arcium.confidentialTransfer({
  source: myAccount,
  destination: recipientAccount,
  owner: wallet,
  amount: BigInt(1000000),
  elgamalPrivateKey
});
```

## Hackathon Resources

- **Helius Docs**: https://docs.helius.dev
- **Noir Docs**: https://noir-lang.org/docs
- **Arcium Docs**: https://docs.arcium.com
- **Inco Docs**: https://docs.inco.network
- **Privacy Cash**: https://docs.privacycash.io

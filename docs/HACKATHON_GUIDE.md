# Solana Privacy Hackathon Guide

## Welcome

Build the future of privacy on Solana! This hackathon focuses on privacy-preserving applications using cutting-edge ZK technology, confidential tokens, and encrypted computation.

## Tracks

### Track 1: Privacy Payments
**Prize Pool: TBD**

Build privacy-enabled payment solutions using Privacy Cash SDK.

**Ideas:**
- Private payroll system
- Anonymous donations
- Confidential subscriptions
- Private remittances

**Key Tech:** Privacy Cash SDK, Helius RPC

### Track 2: Confidential DeFi
**Prize Pool: TBD**

Create DeFi applications where transaction amounts are hidden.

**Ideas:**
- Private AMM with hidden swap amounts
- Confidential lending protocol
- Dark pool for large trades
- Private yield aggregator

**Key Tech:** Arcium C-SPL, Inco Lightning

### Track 3: ZK Applications
**Prize Pool: TBD**

Leverage zero-knowledge proofs for novel applications.

**Ideas:**
- Anonymous voting system
- Private credentials verification
- ZK-based identity
- Confidential NFT ownership

**Key Tech:** Noir circuits, ZK verifiers

### Track 4: Privacy Gaming
**Prize Pool: TBD**

Games with hidden state and fair randomness.

**Ideas:**
- Private poker/card games
- Hidden inventory systems
- Confidential in-game economies
- ZK-based anti-cheat

**Key Tech:** Inco Lightning, encrypted state

### Track 5: Compliance & Security
**Prize Pool: TBD**

Tools for compliant privacy and security monitoring.

**Ideas:**
- Auditable private transactions
- Compliance-friendly mixer
- Risk scoring system
- Security monitoring tools

**Key Tech:** Crypto surveillance tools, auditor keys

---

## Getting Started

### 1. Clone the Project
```bash
cd ~/Desktop/solana-privacy-hack
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Get API Keys

| Service | URL | Purpose |
|---------|-----|---------|
| Helius | https://helius.dev | High-performance RPC |
| Triton | Contact organizers | Hackathon RPC access |
| Privacy Cash | TBD | Privacy SDK |
| Arcium | TBD | Confidential DeFi |
| Inco | TBD | Encrypted computation |

### 4. Run Examples
```bash
npm run dev              # Quick start
npm run privacy:demo     # Privacy Cash demo
npm run helius:test      # Test RPC connection
```

---

## Technical Deep Dives

### Privacy Cash SDK

Shield tokens to make them private:

```typescript
import { PrivacyCashSDK } from './src/privacy/privacy-cash-sdk';

const sdk = new PrivacyCashSDK({
  apiKey: process.env.PRIVACY_CASH_API_KEY!,
  network: 'devnet'
});

// Step 1: Generate a shielded address
const { shieldedAddress, incomingViewingKey } =
  await sdk.generateShieldedAddress(viewingKey);

// Step 2: Shield tokens (public → private)
await sdk.shieldTokens({
  wallet: myWallet,
  mint: USDC_MINT,
  amount: BigInt(100_000000), // 100 USDC
  shieldedAddress
});

// Step 3: Private transfer
await sdk.privateTransfer({
  spendingKey: mySpendingKey,
  transfers: [{
    amount: BigInt(50_000000),
    recipient: friendShieldedAddress
  }]
});

// Step 4: Unshield (private → public)
await sdk.unshieldTokens({
  spendingKey: mySpendingKey,
  amount: BigInt(50_000000),
  recipientAddress: myPublicWallet
});
```

### ZK Circuits with Noir

Create and verify zero-knowledge proofs:

```typescript
import { NoirVerifier } from './src/zk/noir-verifier';

const noir = new NoirVerifier(connection, verifierProgram);

// Create a new circuit
await noir.initNoirProject('age-verification', 'basic');

// Edit circuits/age-verification/src/main.nr:
// fn main(age: Field, threshold: pub Field) {
//     assert(age >= threshold);
// }

// Compile
await noir.compileCircuit('./circuits/age-verification');

// Generate proof (proves age >= 18 without revealing actual age)
const proof = await noir.generateProof('./circuits/age-verification', {
  age: 25,      // Private input
  threshold: 18 // Public input
});

// Verify on-chain
const txSig = await noir.verifyProofOnChain(proof);
```

### Confidential Tokens (Arcium)

Create tokens with hidden balances:

```typescript
import { ArciumSDK } from './src/defi/arcium';

const arcium = new ArciumSDK({
  apiKey: process.env.ARCIUM_API_KEY!,
  network: 'devnet',
  connection
});

// Create confidential token mint
const mint = await arcium.createConfidentialMint({
  authority: myWallet,
  decimals: 9,
  autoApproveNewAccounts: true,
  auditorPubkey: complianceKey // Optional: for regulatory compliance
});

// Create confidential account
const account = await arcium.createConfidentialAccount({
  mint: mint.mint,
  owner: myWallet
});

// Deposit (public → confidential)
await arcium.deposit({
  account: account.address,
  owner: myWallet,
  amount: BigInt(1000_000000000)
});

// Confidential transfer
await arcium.confidentialTransfer({
  source: account.address,
  destination: recipientAccount,
  owner: myWallet,
  amount: BigInt(500_000000000),
  elgamalPrivateKey: myElGamalKey
});
```

### Encrypted Computation (Inco)

Run computations on encrypted data:

```typescript
import { IncoLightning } from './src/payments/inco-lightning';

const inco = new IncoLightning({
  apiKey: process.env.INCO_API_KEY!,
  network: 'testnet'
});

// Encrypt sensitive data
const encryptedBalance = await inco.encryptInput(
  BigInt(1000_000000),
  userEncryptionKey
);

// On-chain computation can operate on encrypted data
// Results remain encrypted

// Only authorized users can decrypt
const actualBalance = await inco.decryptOutput(
  encryptedResult,
  userEncryptionKey
);
```

---

## Judging Criteria

1. **Innovation** (25%) - Novel use of privacy technology
2. **Technical Implementation** (25%) - Code quality and correctness
3. **User Experience** (20%) - Ease of use despite complexity
4. **Potential Impact** (15%) - Real-world applicability
5. **Presentation** (15%) - Clear communication of value

---

## Submission Requirements

1. Public GitHub repository
2. Working demo (video or live)
3. README with:
   - Problem statement
   - Solution overview
   - Technical architecture
   - Setup instructions
4. 3-5 minute presentation

---

## Sponsors & Partners

- **Helius** - RPC infrastructure
- **Triton** - Hackathon RPC access
- **Privacy Cash** - Privacy SDK
- **Arcium** - Confidential DeFi
- **Inco** - Encrypted computation
- **Noir** - ZK circuits

---

## Support

- Discord: [Hackathon Server]
- Office Hours: [Schedule]
- Technical Support: [Contact]

Good luck, hackers! Build something amazing.

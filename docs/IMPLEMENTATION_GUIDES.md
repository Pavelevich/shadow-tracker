# Implementation Guides for Each Bounty

## Quick Start Decision Matrix

| If you want to build... | Use these tools | Target Bounty |
|------------------------|-----------------|---------------|
| Private payments/transfers | Privacy Cash SDK | Privacy Cash ($15k) |
| Confidential DeFi (swaps, lending) | Arcium + C-SPL | Arcium ($10k) |
| ZK proofs/verification | Noir | Aztec ($10k) |
| Encrypted computation | Inco Lightning | Inco ($6k) |
| Privacy + Compliance | Range + any above | Range ($1.5k) |
| Crypto cards + ZK swaps | Starpay API | Starpay ($3.5k) |

---

## Guide 1: Privacy Cash Integration

### Goal: Build a private lending protocol

### Architecture
```
User Wallet (Public)
    │
    ▼ deposit()
Privacy Cash Pool (Shielded)
    │
    ▼ withdraw() to ephemeral wallet
Ephemeral Wallet ──────► Lending Protocol
    │                         │
    ▼                         ▼
Privacy Cash Pool ◄──── Repay + Interest
    │
    ▼ withdraw() to original wallet
User Wallet (Public)
```

### Implementation

```typescript
// src/bounties/privacy-cash/private-lending.ts

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as privacyCash from '@nicefet/privacy-cash-sdk';

interface PrivateLendingConfig {
  connection: Connection;
  userWallet: Keypair;
  lendingProtocol: PublicKey; // e.g., Marginfi, Kamino
}

export class PrivateLending {
  private connection: Connection;
  private wallet: Keypair;
  private lendingProtocol: PublicKey;

  constructor(config: PrivateLendingConfig) {
    this.connection = config.connection;
    this.wallet = config.userWallet;
    this.lendingProtocol = config.lendingProtocol;
  }

  /**
   * Step 1: Shield funds (public → private)
   */
  async shieldFunds(amountSol: number): Promise<string> {
    const amountLamports = amountSol * LAMPORTS_PER_SOL;

    // Deposit to Privacy Cash
    const txSig = await privacyCash.deposit(
      this.connection,
      this.wallet,
      amountLamports
    );

    console.log('Funds shielded:', txSig);
    return txSig;
  }

  /**
   * Step 2: Create deterministic ephemeral wallet
   */
  generateEphemeralWallet(purpose: string, nonce: number): Keypair {
    // Derive ephemeral keypair from main wallet + purpose
    const seed = Buffer.concat([
      this.wallet.secretKey.slice(0, 32),
      Buffer.from(purpose),
      Buffer.from([nonce])
    ]);

    // Use seed to generate deterministic keypair
    const hash = require('crypto').createHash('sha256').update(seed).digest();
    return Keypair.fromSeed(hash);
  }

  /**
   * Step 3: Private withdrawal to ephemeral wallet
   */
  async withdrawToEphemeral(
    ephemeralWallet: Keypair,
    amountSol: number
  ): Promise<string> {
    const amountLamports = amountSol * LAMPORTS_PER_SOL;

    const txSig = await privacyCash.withdraw(
      this.connection,
      this.wallet,
      ephemeralWallet.publicKey,
      amountLamports
    );

    console.log('Withdrawn to ephemeral:', txSig);
    return txSig;
  }

  /**
   * Step 4: Interact with lending protocol (from ephemeral)
   */
  async depositToLending(
    ephemeralWallet: Keypair,
    amountSol: number
  ): Promise<string> {
    // This would call the actual lending protocol
    // Example with Marginfi/Kamino
    console.log('Depositing to lending protocol from ephemeral wallet');

    // Lending protocol interaction here
    // The lending protocol only sees the ephemeral wallet
    // No link to original user

    return 'lending_tx_signature';
  }

  /**
   * Step 5: Withdraw from lending and reshield
   */
  async withdrawAndReshield(
    ephemeralWallet: Keypair,
    amountSol: number
  ): Promise<string> {
    // Withdraw from lending to ephemeral
    console.log('Withdrawing from lending protocol');

    // Transfer back to Privacy Cash from ephemeral
    const txSig = await privacyCash.deposit(
      this.connection,
      ephemeralWallet,
      amountSol * LAMPORTS_PER_SOL
    );

    console.log('Reshielded:', txSig);
    return txSig;
  }

  /**
   * Check private balance
   */
  async getPrivateBalance(): Promise<number> {
    const balance = await privacyCash.getPrivateBalance(
      this.connection,
      this.wallet.publicKey
    );
    return balance / LAMPORTS_PER_SOL;
  }
}

// Full flow example
async function privateLendingDemo() {
  const connection = new Connection(process.env.HELIUS_RPC_URL!);
  const wallet = Keypair.fromSecretKey(/* your key */);

  const lending = new PrivateLending({
    connection,
    userWallet: wallet,
    lendingProtocol: new PublicKey('LENDING_PROTOCOL_ADDRESS')
  });

  // 1. Shield 10 SOL
  await lending.shieldFunds(10);

  // 2. Generate ephemeral wallet
  const ephemeral = lending.generateEphemeralWallet('lending', 1);

  // 3. Withdraw to ephemeral
  await lending.withdrawToEphemeral(ephemeral, 10);

  // 4. Deposit to lending (privately)
  await lending.depositToLending(ephemeral, 10);

  // ... time passes, earn yield ...

  // 5. Withdraw and reshield (with interest)
  await lending.withdrawAndReshield(ephemeral, 10.5);

  // Result: User earned yield privately
  // Lending protocol never saw original wallet
}
```

---

## Guide 2: Arcium Confidential DeFi

### Goal: Build a private swap with hidden amounts

### Architecture
```
User
  │
  ▼ Encrypt(amount, price)
MXE Program (Arcium)
  │
  ▼ Submit to MPC Nodes
Arcium Network ─────► Process on encrypted data
  │
  ▼ Return encrypted result
Settlement ─────────► Execute swap
```

### Implementation

```typescript
// src/bounties/arcium/confidential-swap.ts

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { ArciumClient } from '@arcium-hq/client';
import { ArciumReader } from '@arcium-hq/reader';

interface SwapConfig {
  connection: Connection;
  wallet: Keypair;
  mxeProgramId: PublicKey;
}

export class ConfidentialSwap {
  private client: ArciumClient;
  private reader: ArciumReader;
  private wallet: Keypair;

  constructor(config: SwapConfig) {
    this.wallet = config.wallet;

    // Initialize Arcium client
    this.client = new ArciumClient({
      connection: config.connection,
      wallet: config.wallet,
      mxeProgram: config.mxeProgramId
    });

    this.reader = new ArciumReader({
      connection: config.connection
    });
  }

  /**
   * Create a confidential swap order
   * Amount and price are hidden from everyone except the matcher
   */
  async createConfidentialOrder(params: {
    inputMint: PublicKey;
    outputMint: PublicKey;
    inputAmount: bigint;    // Will be encrypted
    minOutput: bigint;      // Will be encrypted
    expiry: number;
  }): Promise<{ orderId: string; txSig: string }> {

    // Encrypt the sensitive data
    const encryptedInput = await this.client.encrypt({
      value: params.inputAmount,
      type: 'uint64'
    });

    const encryptedMinOutput = await this.client.encrypt({
      value: params.minOutput,
      type: 'uint64'
    });

    // Submit confidential order
    const result = await this.client.queueComputation({
      computation: 'create_order',
      inputs: {
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        encryptedAmount: encryptedInput,
        encryptedMinOutput: encryptedMinOutput,
        expiry: params.expiry
      }
    });

    return {
      orderId: result.computationId,
      txSig: result.signature
    };
  }

  /**
   * Match two confidential orders
   * MPC nodes verify amounts match without seeing actual values
   */
  async matchOrders(
    buyOrderId: string,
    sellOrderId: string
  ): Promise<{ matched: boolean; txSig: string }> {

    const result = await this.client.queueComputation({
      computation: 'match_orders',
      inputs: {
        buyOrder: buyOrderId,
        sellOrder: sellOrderId
      },
      callback: {
        programId: 'SETTLEMENT_PROGRAM',
        instruction: 'settle'
      }
    });

    return {
      matched: true, // Would be determined by MPC result
      txSig: result.signature
    };
  }

  /**
   * Get order status (without revealing amounts)
   */
  async getOrderStatus(orderId: string): Promise<{
    status: 'open' | 'filled' | 'cancelled';
    fillPercent?: number; // Revealed only to order owner
  }> {
    const computation = await this.reader.getComputation(orderId);

    return {
      status: computation.status as any,
      fillPercent: computation.ownerOnlyData?.fillPercent
    };
  }
}

// Dark Pool Implementation
async function darkPoolDemo() {
  const connection = new Connection(process.env.HELIUS_RPC_URL!);
  const trader = Keypair.fromSecretKey(/* your key */);

  const darkPool = new ConfidentialSwap({
    connection,
    wallet: trader,
    mxeProgramId: new PublicKey('ARCIUM_MXE_PROGRAM')
  });

  // Large order that would move markets if public
  const order = await darkPool.createConfidentialOrder({
    inputMint: new PublicKey('SOL_MINT'),
    outputMint: new PublicKey('USDC_MINT'),
    inputAmount: BigInt(100000_000000000), // 100k SOL - hidden!
    minOutput: BigInt(10000000_000000),    // $10M USDC min - hidden!
    expiry: Date.now() + 3600000
  });

  console.log('Confidential order created:', order.orderId);
  // Market doesn't know a whale is selling
}
```

---

## Guide 3: Noir ZK Proofs on Solana

### Goal: Anonymous voting system

### Circuit Design
```noir
// circuits/anonymous-vote/src/main.nr

use dep::std::hash::pedersen_hash;

// Prove: "I am a valid voter AND I haven't voted yet"
// Without revealing: Who I am

fn main(
    // Private inputs (only prover knows)
    voter_private_key: Field,
    voter_index: Field,
    merkle_path: [Field; 10],
    merkle_indices: [u1; 10],

    // Public inputs (everyone sees)
    voters_merkle_root: pub Field,
    nullifier: pub Field,
    vote_choice: pub Field
) {
    // 1. Derive voter public key from private key
    let voter_public_key = pedersen_hash([voter_private_key]);

    // 2. Verify voter is in the authorized set (Merkle proof)
    let computed_root = compute_merkle_root(
        voter_public_key,
        merkle_path,
        merkle_indices
    );
    assert(computed_root == voters_merkle_root);

    // 3. Verify nullifier is correctly derived (prevents double voting)
    let expected_nullifier = pedersen_hash([voter_private_key, vote_choice]);
    assert(nullifier == expected_nullifier);

    // 4. Verify vote is valid (0, 1, or 2 for example)
    assert(vote_choice as u8 < 3);
}

fn compute_merkle_root(
    leaf: Field,
    path: [Field; 10],
    indices: [u1; 10]
) -> Field {
    let mut current = leaf;

    for i in 0..10 {
        let (left, right) = if indices[i] == 0 {
            (current, path[i])
        } else {
            (path[i], current)
        };
        current = pedersen_hash([left, right]);
    }

    current
}
```

### Solana Integration

```typescript
// src/bounties/aztec/anonymous-voting.ts

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { execSync } from 'child_process';
import * as fs from 'fs';

interface VotingConfig {
  connection: Connection;
  verifierProgram: PublicKey;
  votersMerkleRoot: string;
}

export class AnonymousVoting {
  private connection: Connection;
  private verifierProgram: PublicKey;
  private merkleRoot: string;
  private submittedNullifiers: Set<string> = new Set();

  constructor(config: VotingConfig) {
    this.connection = config.connection;
    this.verifierProgram = config.verifierProgram;
    this.merkleRoot = config.votersMerkleRoot;
  }

  /**
   * Generate proof for anonymous vote
   */
  async generateVoteProof(params: {
    voterPrivateKey: string;
    voterIndex: number;
    merklePath: string[];
    merkleIndices: number[];
    voteChoice: number;
  }): Promise<{ proof: Buffer; publicInputs: any }> {

    // Calculate nullifier (prevents double voting)
    const nullifier = this.calculateNullifier(
      params.voterPrivateKey,
      params.voteChoice
    );

    // Check if already voted
    if (this.submittedNullifiers.has(nullifier)) {
      throw new Error('Vote already cast (nullifier exists)');
    }

    // Write Prover.toml
    const proverToml = `
voter_private_key = "${params.voterPrivateKey}"
voter_index = "${params.voterIndex}"
merkle_path = [${params.merklePath.map(p => `"${p}"`).join(', ')}]
merkle_indices = [${params.merkleIndices.join(', ')}]
voters_merkle_root = "${this.merkleRoot}"
nullifier = "${nullifier}"
vote_choice = "${params.voteChoice}"
`;

    fs.writeFileSync('./circuits/anonymous-vote/Prover.toml', proverToml);

    // Generate proof using Noir
    execSync('cd ./circuits/anonymous-vote && nargo prove', { stdio: 'inherit' });

    const proof = fs.readFileSync('./circuits/anonymous-vote/proofs/anonymous_vote.proof');

    return {
      proof,
      publicInputs: {
        votersMerkleRoot: this.merkleRoot,
        nullifier,
        voteChoice: params.voteChoice
      }
    };
  }

  /**
   * Submit vote to Solana
   */
  async submitVote(
    proof: Buffer,
    publicInputs: any,
    payer: Keypair
  ): Promise<string> {

    // Check nullifier not used
    if (this.submittedNullifiers.has(publicInputs.nullifier)) {
      throw new Error('Double vote detected');
    }

    // Create verification instruction
    const verifyIx = {
      programId: this.verifierProgram,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        // Add vote tallying account, nullifier storage, etc.
      ],
      data: Buffer.concat([
        Buffer.from([0]), // Verify and vote instruction
        proof,
        Buffer.from(JSON.stringify(publicInputs))
      ])
    };

    const tx = new Transaction().add(verifyIx);
    const sig = await this.connection.sendTransaction(tx, [payer]);

    // Record nullifier
    this.submittedNullifiers.add(publicInputs.nullifier);

    return sig;
  }

  private calculateNullifier(privateKey: string, voteChoice: number): string {
    // Would use actual Pedersen hash
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(privateKey + voteChoice.toString())
      .digest('hex');
  }
}
```

---

## Guide 4: Inco Confidential Gaming

### Goal: Private poker game with hidden cards

```typescript
// src/bounties/inco/private-poker.ts

import { Connection, Keypair, PublicKey } from '@solana/web3.js';

interface PokerConfig {
  connection: Connection;
  incoApiKey: string;
  gameProgram: PublicKey;
}

interface EncryptedCard {
  handle: string;
  ciphertext: Uint8Array;
}

export class PrivatePoker {
  private connection: Connection;
  private apiKey: string;
  private gameProgram: PublicKey;

  constructor(config: PokerConfig) {
    this.connection = config.connection;
    this.apiKey = config.incoApiKey;
    this.gameProgram = config.gameProgram;
  }

  /**
   * Deal encrypted cards to players
   * Cards are encrypted - even dealer doesn't know values
   */
  async dealCards(
    players: PublicKey[],
    cardsPerPlayer: number
  ): Promise<Map<string, EncryptedCard[]>> {
    const deck = this.generateShuffledDeck();
    const playerCards = new Map<string, EncryptedCard[]>();

    for (const player of players) {
      const cards: EncryptedCard[] = [];

      for (let i = 0; i < cardsPerPlayer; i++) {
        const cardValue = deck.pop()!;

        // Encrypt card for specific player
        const encrypted = await this.encryptForPlayer(cardValue, player);
        cards.push(encrypted);
      }

      playerCards.set(player.toBase58(), cards);
    }

    return playerCards;
  }

  /**
   * Player views their own cards (attested reveal)
   */
  async revealMyCards(
    player: Keypair,
    encryptedCards: EncryptedCard[]
  ): Promise<number[]> {
    const revealed: number[] = [];

    for (const card of encryptedCards) {
      // Use Inco's attested reveal - only player can see
      const value = await this.attestedReveal(card, player);
      revealed.push(value);
    }

    return revealed;
  }

  /**
   * Commit a bet (hidden amount)
   */
  async commitBet(
    player: Keypair,
    amount: bigint
  ): Promise<{ commitment: string; encryptedAmount: EncryptedCard }> {
    // Encrypt bet amount
    const encrypted = await this.encryptValue(amount, player.publicKey);

    // Create commitment hash
    const commitment = await this.createCommitment(encrypted);

    return { commitment, encryptedAmount: encrypted };
  }

  /**
   * Reveal winner using on-chain comparison of encrypted hands
   * Uses Inco's conditional decryption (eselect + attested decrypt)
   */
  async determineWinner(
    playerHands: Map<string, EncryptedCard[]>,
    communityCards: EncryptedCard[]
  ): Promise<{ winner: PublicKey; hand: string }> {
    // On-chain computation compares encrypted hands
    // Only reveals winner, not losing hands

    const result = await this.computeWinnerOnChain(playerHands, communityCards);

    return result;
  }

  // Helper methods
  private generateShuffledDeck(): number[] {
    const deck = Array.from({ length: 52 }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  private async encryptForPlayer(
    value: number,
    player: PublicKey
  ): Promise<EncryptedCard> {
    // Use Inco's encryption for specific player
    return {
      handle: `card_${value}_${player.toBase58().slice(0, 8)}`,
      ciphertext: new Uint8Array(64)
    };
  }

  private async encryptValue(
    value: bigint,
    player: PublicKey
  ): Promise<EncryptedCard> {
    return {
      handle: `bet_${Date.now()}`,
      ciphertext: new Uint8Array(64)
    };
  }

  private async attestedReveal(
    card: EncryptedCard,
    player: Keypair
  ): Promise<number> {
    // Inco attested reveal - proves decryption is correct
    return 0; // Would return actual card value
  }

  private async createCommitment(encrypted: EncryptedCard): Promise<string> {
    return `commitment_${encrypted.handle}`;
  }

  private async computeWinnerOnChain(
    hands: Map<string, EncryptedCard[]>,
    community: EncryptedCard[]
  ): Promise<{ winner: PublicKey; hand: string }> {
    // On-chain MPC computation
    return {
      winner: new PublicKey('winner_address'),
      hand: 'Royal Flush'
    };
  }
}
```

---

## Guide 5: Starpay Privacy Payments

### Goal: Anonymous crypto spending with cards

```typescript
// src/bounties/starpay/private-spending.ts

import { Connection, Keypair, PublicKey } from '@solana/web3.js';

interface StarpayConfig {
  apiKey: string;
  apiEndpoint: string;
}

interface VirtualCard {
  cardId: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string; // Only shown once
  balance: number;
  currency: string;
}

export class PrivateSpending {
  private apiKey: string;
  private endpoint: string;

  constructor(config: StarpayConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.apiEndpoint;
  }

  /**
   * Issue a virtual card funded by crypto (privately)
   * Combine with Privacy Cash for full anonymity
   */
  async issuePrivateCard(params: {
    amount: number;
    currency: 'USD' | 'EUR';
    cryptoSource: 'SOL' | 'USDC';
    useZKSwap: boolean;
  }): Promise<VirtualCard> {

    let fundingTx: string;

    if (params.useZKSwap) {
      // Use ZK Swap for anonymous crypto-to-fiat
      fundingTx = await this.zkSwapFunding(params.amount, params.cryptoSource);
    } else {
      fundingTx = await this.directFunding(params.amount, params.cryptoSource);
    }

    // Issue card via Starpay API
    const response = await fetch(`${this.endpoint}/v1/cards/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        fundingTransaction: fundingTx,
        type: 'virtual'
      })
    });

    const card = await response.json();

    return {
      cardId: card.id,
      lastFour: card.last_four,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cvv: card.cvv,
      balance: params.amount,
      currency: params.currency
    };
  }

  /**
   * ZK Swap: Anonymous crypto-to-crypto execution
   */
  async zkSwap(params: {
    inputToken: string;
    outputToken: string;
    inputAmount: bigint;
    minOutput: bigint;
  }): Promise<{ txSignature: string; outputAmount: bigint }> {

    const response = await fetch(`${this.endpoint}/v1/swap/zk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        input_token: params.inputToken,
        output_token: params.outputToken,
        input_amount: params.inputAmount.toString(),
        min_output: params.minOutput.toString(),
        privacy_mode: 'full' // Use ZK proofs
      })
    });

    const result = await response.json();

    return {
      txSignature: result.signature,
      outputAmount: BigInt(result.output_amount)
    };
  }

  /**
   * Full privacy flow: Shielded wallet → ZK Swap → Private Card
   */
  async fullPrivacySpending(params: {
    privacyCashWallet: Keypair;
    spendAmount: number;
  }): Promise<VirtualCard> {

    // 1. Withdraw from Privacy Cash to ephemeral wallet
    // (Use Privacy Cash SDK)

    // 2. ZK Swap to stablecoin
    const swapResult = await this.zkSwap({
      inputToken: 'SOL',
      outputToken: 'USDC',
      inputAmount: BigInt(params.spendAmount * 1e9),
      minOutput: BigInt(params.spendAmount * 0.98 * 1e6) // 2% slippage
    });

    // 3. Issue card with ZK-swapped funds
    const card = await this.issuePrivateCard({
      amount: params.spendAmount,
      currency: 'USD',
      cryptoSource: 'USDC',
      useZKSwap: true
    });

    return card;
  }

  /**
   * Add to Apple Pay / Google Pay
   */
  async addToMobileWallet(
    cardId: string,
    walletType: 'apple' | 'google'
  ): Promise<{ provisioned: boolean; token: string }> {

    const response = await fetch(`${this.endpoint}/v1/cards/${cardId}/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ wallet_type: walletType })
    });

    return response.json();
  }

  private async zkSwapFunding(amount: number, crypto: string): Promise<string> {
    // ZK swap execution
    return 'zk_swap_tx_signature';
  }

  private async directFunding(amount: number, crypto: string): Promise<string> {
    return 'direct_funding_tx_signature';
  }
}
```

---

## Guide 6: Range Compliant Privacy

### Goal: Privacy with selective disclosure for compliance

```typescript
// src/bounties/range/compliant-privacy.ts

import { Connection, PublicKey } from '@solana/web3.js';

interface RangeConfig {
  apiKey: string;
  endpoint: string;
}

interface RiskScore {
  address: string;
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  sanctioned: boolean;
}

interface ComplianceReport {
  transactionId: string;
  compliant: boolean;
  riskScore: RiskScore;
  disclosures: {
    required: string[];
    optional: string[];
  };
}

export class CompliantPrivacy {
  private apiKey: string;
  private endpoint: string;

  constructor(config: RangeConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
  }

  /**
   * Pre-screen an address before interacting
   */
  async preScreenAddress(address: string): Promise<RiskScore> {
    const response = await fetch(`${this.endpoint}/v1/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ address })
    });

    return response.json();
  }

  /**
   * Check if private transaction can proceed
   * Combines privacy with compliance
   */
  async canTransactPrivately(params: {
    sender: string;
    recipient: string;
    amount: bigint;
    purpose: string;
  }): Promise<{
    allowed: boolean;
    requiresDisclosure: boolean;
    disclosureLevel: 'none' | 'amount' | 'identity' | 'full';
    reason?: string;
  }> {

    // Screen both parties
    const [senderRisk, recipientRisk] = await Promise.all([
      this.preScreenAddress(params.sender),
      this.preScreenAddress(params.recipient)
    ]);

    // Check sanctions
    if (senderRisk.sanctioned || recipientRisk.sanctioned) {
      return {
        allowed: false,
        requiresDisclosure: true,
        disclosureLevel: 'full',
        reason: 'Sanctioned address detected'
      };
    }

    // Check risk thresholds
    const maxRisk = Math.max(senderRisk.score, recipientRisk.score);

    if (maxRisk < 30) {
      return {
        allowed: true,
        requiresDisclosure: false,
        disclosureLevel: 'none'
      };
    } else if (maxRisk < 60) {
      return {
        allowed: true,
        requiresDisclosure: false,
        disclosureLevel: 'amount' // May need to disclose amount for large txs
      };
    } else {
      return {
        allowed: true,
        requiresDisclosure: true,
        disclosureLevel: 'identity',
        reason: 'High risk counterparty'
      };
    }
  }

  /**
   * Generate selective disclosure proof
   * Proves compliance without revealing full details
   */
  async generateSelectiveDisclosure(params: {
    transactionId: string;
    disclosureLevel: 'amount' | 'identity' | 'full';
    auditorKey: PublicKey;
  }): Promise<{
    disclosureProof: string;
    encryptedData: string; // Only auditor can decrypt
  }> {

    const response = await fetch(`${this.endpoint}/v1/disclosure/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        transaction_id: params.transactionId,
        disclosure_level: params.disclosureLevel,
        auditor_pubkey: params.auditorKey.toBase58()
      })
    });

    return response.json();
  }

  /**
   * Monitor transactions for compliance
   */
  async monitorTransaction(txSignature: string): Promise<ComplianceReport> {
    const response = await fetch(`${this.endpoint}/v1/monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ signature: txSignature })
    });

    return response.json();
  }
}

// Example: Compliant Private Payment System
async function compliantPrivatePayment() {
  const range = new CompliantPrivacy({
    apiKey: process.env.RANGE_API_KEY!,
    endpoint: 'https://api.range.org'
  });

  const sender = 'sender_address';
  const recipient = 'recipient_address';
  const amount = BigInt(1000_000000);

  // 1. Pre-screen before transaction
  const canTransact = await range.canTransactPrivately({
    sender,
    recipient,
    amount,
    purpose: 'payment'
  });

  if (!canTransact.allowed) {
    console.log('Transaction blocked:', canTransact.reason);
    return;
  }

  // 2. Execute private transaction (using Privacy Cash, etc.)
  const txSignature = 'execute_private_tx';

  // 3. If disclosure required, generate proof
  if (canTransact.requiresDisclosure) {
    const disclosure = await range.generateSelectiveDisclosure({
      transactionId: txSignature,
      disclosureLevel: canTransact.disclosureLevel as any,
      auditorKey: new PublicKey('AUDITOR_ADDRESS')
    });

    console.log('Disclosure proof generated for auditor');
  }

  // 4. Monitor for ongoing compliance
  const report = await range.monitorTransaction(txSignature);
  console.log('Compliance status:', report.compliant);
}
```

---

## Multi-Bounty Strategy

### Example: Win 4 Bounties with 1 Project

**Project: "Stealth DeFi" - Private Lending with Compliance**

Combines:
1. **Privacy Cash** ($15k) - Shield/unshield flow
2. **Helius** ($5k) - RPC and monitoring
3. **Range** ($1.5k) - Compliance layer
4. **Arcium** ($10k) - Confidential lending execution

```typescript
// One project, multiple bounties
async function stealthDeFi() {
  // Use Privacy Cash for shielding
  const privacyCash = new PrivacyCash(/* ... */);

  // Use Helius for RPC
  const helius = new HeliusRPC({
    apiKey: process.env.HELIUS_API_KEY!,
    cluster: 'devnet'
  });

  // Use Range for compliance
  const range = new CompliantPrivacy(/* ... */);

  // Use Arcium for confidential lending
  const arcium = new ArciumSDK(/* ... */);

  // Flow:
  // 1. Shield funds (Privacy Cash)
  // 2. Pre-screen counterparties (Range)
  // 3. Confidential lending execution (Arcium)
  // 4. Monitor via webhooks (Helius)
  // 5. Selective disclosure if needed (Range)
  // 6. Unshield returns (Privacy Cash)
}
```

This single project could potentially win:
- Privacy Cash: Best new app ($6,000)
- Helius: Best privacy project ($5,000)
- Range: Compliant privacy ($1,500)
- Arcium: Best confidential DeFi ($10,000)

**Total potential: $22,500+**

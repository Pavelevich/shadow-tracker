# Bounty Hunter Skill

Tools for finding vulnerabilities, claiming bounties, and participating in CTF challenges on Solana.

## Capabilities

- Analyze programs for common vulnerabilities
- Track active bounty programs
- Submit bounty claims
- Participate in CTF challenges
- Monitor exploit transactions

## Quick Start

```typescript
import { BountyHunter } from '../src/utils/bounty-hunter';
import { Connection } from '@solana/web3.js';

const connection = new Connection(process.env.HELIUS_RPC_URL!);
const hunter = new BountyHunter({ connection });

// Fetch active bounties
const bounties = await hunter.fetchActiveBounties();
console.log('Active bounties:', bounties.length);

// Analyze a program
const vulnerabilities = await hunter.analyzeProgram(programId);
```

## Vulnerability Types to Look For

### 1. Authority Misconfigurations
```typescript
// Check upgrade authority
const analysis = await hunter.analyzeProgram(programId);
if (analysis.some(v => v.vulnerabilityType === 'Upgrade Authority Risk')) {
  console.log('Found upgrade authority issue!');
}
```

### 2. Integer Overflow/Underflow
- Look for unchecked arithmetic
- SPL Math library usage
- Checked math implementations

### 3. Missing Signer Checks
- Verify all authority accounts are signers
- Check PDA derivation

### 4. Account Validation Issues
- Owner checks
- Account type validation
- Rent exemption verification

### 5. Reentrancy
- CPI calls before state updates
- Callback patterns

## Submitting a Bounty Claim

```typescript
const result = await hunter.submitBountyClaim({
  bountyId: 'solana-foundation-bug-bounty',
  hunterAddress: myWallet.publicKey,
  submission: {
    title: 'Critical: Integer Overflow in Token Transfer',
    description: 'Found integer overflow allowing minting unlimited tokens',
    proofOfConcept: `
      1. Call transfer with amount = MAX_U64
      2. Observe balance wraps to large value
      3. Drain pool
    `,
    impact: 'Complete loss of funds in affected pools',
    suggestedFix: 'Use checked_add instead of + operator'
  }
});

console.log('Submission ID:', result.submissionId);
```

## CTF Challenge Participation

```typescript
// Create a CTF challenge (for organizers)
const challenge = await hunter.createCTFChallenge({
  title: 'Privacy Protocol Bypass',
  description: 'Find the flag hidden in this ZK circuit',
  flag: 'CTF{pr1v4cy_15_n0t_s3cur1ty}',
  reward: BigInt(10_000000000), // 10 SOL
  hints: [
    'Check the circuit constraints',
    'Look for missing range proofs'
  ]
});

// Submit flag (for participants)
const result = await hunter.verifyCTFFlag({
  challengeId: challenge.id,
  flag: 'CTF{your_flag_here}',
  submitter: myWallet.publicKey
});
```

## Responsible Disclosure

1. **Never exploit** vulnerabilities on mainnet
2. **Document thoroughly** with clear reproduction steps
3. **Contact privately** before public disclosure
4. **Wait for fix** before publishing details
5. **Coordinate** release with affected parties

## Known Bounty Programs

| Program | Max Reward | Focus |
|---------|-----------|-------|
| Solana Foundation | $1M | Core runtime |
| Marinade | $250K | Liquid staking |
| Mango | $500K | DEX/Lending |
| Jupiter | $100K | Aggregator |
| Orca | $150K | AMM |

## Tools Integration

The BountyHunter class integrates with:
- Helius API for transaction analysis
- CryptoSurveillance for pattern detection
- NoirVerifier for ZK circuit analysis

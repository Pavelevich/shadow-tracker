# MEV/Sandwich Attack Analyzer - Technical Plan

## Executive Summary
Add a Sandwich Attack Analyzer to SolPrivacy that detects if a wallet has been victim of MEV attacks, calculates losses, and provides protection recommendations.

---

## Hypothesis & Thesis

### Hypothesis
If we can identify the pattern of frontrun-victim-backrun transactions in the same slot/block, we can:
1. Detect if a user was sandwiched
2. Calculate the exact loss (price difference)
3. Identify the attacking bot/validator
4. Provide actionable protection advice

### Thesis
**A sandwich attack has this signature:**
```
SAME SLOT/BLOCK:
  TX1: Attacker BUYS token X (frontrun)
  TX2: Victim SWAPS token X (target - higher price)
  TX3: Attacker SELLS token X (backrun - profit)

Detection criteria:
- TX1 and TX3 have SAME signer (attacker)
- TX2 has DIFFERENT signer (victim)
- All 3 transactions in SAME slot
- TX1 buys what TX2 is buying
- TX3 sells what TX1 bought
```

### Why This Will Work
1. **Data is on-chain** - All transactions are public and analyzable
2. **Pattern is deterministic** - Sandwich attacks follow a specific pattern
3. **Helius API provides enhanced tx data** - We can decode swap amounts/tokens easily
4. **Known attacker addresses exist** - We can cross-reference with known bad actors

### Why This Could Fail
1. **Wide sandwiches** - Attack spans multiple slots (harder to detect)
2. **Private mempools** - Some attacks happen off-chain
3. **Complex routing** - Multi-hop swaps may obscure the pattern
4. **False positives** - Legitimate arbitrage may look like attacks

---

## Known Attacker Addresses (for detection)

| Address | Name | Extracted |
|---------|------|-----------|
| `vpeNALD89BZ4KxNUFjdLmFXBCwtyqBDQ85ouNoax38b` | DeezNode Bot | $13.4M in 30 days |
| `Ai4zqY7gjyAPhtUsGnCfabM5oHcZLt3htjpSoUKvxkkt` | Unknown | $287M in 6 months |
| `4vJfp62jEzcYFnQ11oBJDgj6ZFrdEwcBBpoadNTpEWys` | Unknown | 210K attacks/month |
| `9973h...zyWp6` | arsc cold wallet | $19M stored |
| `BCbrp...vi58q` | arsc main wallet | Uses multiple signers |

---

## Test Wallets (Known Victims)

Need to find victims on sandwiched.me or by querying recent swaps on Raydium/Jupiter and checking if they were sandwiched.

### Strategy to Find Test Wallets
1. Query sandwiched.me for recent victims
2. Use Helius to find swaps in blocks where known attackers were active
3. Look at Jito bundle data for victim transactions

---

## Technical Architecture

### API Design

**Endpoint:** `GET /api/v3/mev/:walletAddress`

**Response:**
```typescript
interface MevAnalysisResponse {
  success: boolean;
  data: {
    address: string;
    totalSwaps: number;
    sandwichAttacks: SandwichAttack[];
    totalLostToMev: number; // in USD
    totalLostSol: number;
    attackerAddresses: string[];
    vulnerabilityScore: number; // 0-100
    recommendations: string[];
    protectionStatus: {
      usesJitoBundles: boolean;
      averageSlippage: number;
      recentAttackRate: number; // attacks per swap
    };
  };
}

interface SandwichAttack {
  slot: number;
  timestamp: number;
  victimTx: string;
  frontrunTx: string;
  backrunTx: string;
  attackerAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountLost: number; // in output token
  amountLostUsd: number;
  dex: string; // Raydium, Jupiter, Orca
}
```

### Detection Algorithm

```typescript
async function detectSandwichAttacks(walletAddress: string): Promise<SandwichAttack[]> {
  // 1. Get all SWAP transactions for wallet using Helius
  const swaps = await helius.getTransactionsByAddress(walletAddress, {
    type: 'SWAP'
  });

  const attacks: SandwichAttack[] = [];

  for (const swap of swaps) {
    // 2. Get all transactions in the same slot
    const slotTxs = await helius.getTransactionsForSlot(swap.slot);

    // 3. Find potential frontrun (buy same token, before victim)
    const frontrun = slotTxs.find(tx =>
      tx.signature !== swap.signature &&
      tx.slot === swap.slot &&
      tx.type === 'SWAP' &&
      isBuyingSameToken(tx, swap) &&
      tx.blockTime < swap.blockTime
    );

    // 4. Find potential backrun (sell same token, after victim, same signer as frontrun)
    const backrun = slotTxs.find(tx =>
      tx.signature !== swap.signature &&
      tx.slot === swap.slot &&
      tx.type === 'SWAP' &&
      isSellingToken(tx, frontrun?.tokenBought) &&
      tx.feePayer === frontrun?.feePayer &&
      tx.blockTime > swap.blockTime
    );

    // 5. If pattern matches, it's a sandwich
    if (frontrun && backrun) {
      attacks.push({
        slot: swap.slot,
        timestamp: swap.blockTime,
        victimTx: swap.signature,
        frontrunTx: frontrun.signature,
        backrunTx: backrun.signature,
        attackerAddress: frontrun.feePayer,
        // ... calculate loss
      });
    }
  }

  return attacks;
}
```

### Simplified Approach (MVP)

For MVP, we can use a simpler heuristic:
1. Check if wallet's swaps were in same slot as known attacker addresses
2. Flag as "potentially sandwiched" without proving the exact attack
3. Calculate average slippage vs expected to estimate losses

---

## Implementation Phases

### Phase 1: CLI Testing (1 day)
- Add `/mev` command to CLI
- Implement basic detection against known attacker list
- Test with known victim wallets

### Phase 2: API Endpoint (1 day)
- Create `/api/v3/mev/:wallet` endpoint
- Add to existing backend on Digital Ocean
- Cache results for performance

### Phase 3: Frontend Component (1 day)
- Create `MevAnalyzer.tsx` component
- Add to Index.tsx after existing analysis
- Add route `/attackanalyzer` for standalone page

### Phase 4: Testing & Refinement (1 day)
- Test with multiple wallets
- Reduce false positives
- Add more attacker addresses

---

## Files to Create/Modify

### New Files
```
/src/lib/mevDetection.ts          - Core detection logic
/src/components/MevAnalyzer.tsx   - Frontend component
/src/pages/AttackAnalyzer.tsx     - Standalone page
```

### Modified Files
```
/src/pages/Index.tsx              - Add MevAnalyzer component
/src/App.tsx                      - Add /attackanalyzer route
CLI: /src/cli.ts                  - Add /mev command
Backend: Add new endpoint
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| False positives | Start with known attacker list only |
| Performance | Cache results, limit to recent 100 swaps |
| API rate limits | Use Helius batch endpoints |
| Complex attacks | Flag as "needs review" instead of certain |

---

## Success Metrics

1. **Accuracy:** >90% true positive rate on known victims
2. **Coverage:** Detect attacks from top 5 known bots
3. **Performance:** <5s analysis time
4. **User value:** Show concrete $ lost to MEV

---

## Hackathon Fit

This feature strengthens our position for:
- **Privacy Tooling ($15K)** - This IS a privacy/security tool
- **Helius Bounty ($5K)** - Heavy use of Helius enhanced tx API
- **Open Track** - Novel MEV protection tooling

---

## Test Results (Jan 13, 2026)

### What Worked
```
✅ Helius API transaction fetch - WORKS
✅ Swap transaction detection - WORKS (found 74 swaps in test wallet)
✅ Known attacker list check - WORKS
✅ Transaction type/source parsing - WORKS
```

### What Doesn't Work (Limitations)
```
❌ Full slot-level analysis requires Helius Pro
❌ Can't see bundled transactions without Jito API
❌ Attacker transactions marked as "UNKNOWN" type (obfuscated)
```

### Key Insight
The attacker (`vpeNALD89BZ4KxNUFjdLmFXBCwtyqBDQ85ouNoax38b`) transactions show:
- Type: UNKNOWN
- Source: UNKNOWN
- Different fee payer than program address

This means attackers use proxy addresses - harder to detect by simple address matching.

---

## MVP Approach (Revised)

Since we can't do full sandwich detection without Helius Pro, here's our **Simplified MVP**:

### MEV Risk Score (0-100)

Calculate based on:
1. **DEX Usage Patterns** (30 pts)
   - Uses high-slippage DEXs? +20
   - Trades illiquid tokens? +10

2. **Transaction Patterns** (30 pts)
   - Swaps during high MEV hours? +15
   - Large swap amounts? +10
   - Fast consecutive swaps? +5

3. **Protection Usage** (40 pts)
   - No Jito bundles used? +20
   - High slippage tolerance? +10
   - Public mempool usage? +10

### Detection Heuristics

Instead of proving attacks, we detect **vulnerability indicators**:

```typescript
interface MevRiskAnalysis {
  riskScore: number; // 0-100
  vulnerabilityFactors: string[];
  recommendations: string[];
  recentSwaps: number;
  estimatedExposure: number; // USD value at risk
  protectionStatus: {
    usesPrivateMempool: boolean;
    averageSlippage: number;
    dexDiversity: number;
  };
}
```

### What We CAN Show Users

1. **"You made X swaps in the last 30 days"**
2. **"Your estimated MEV exposure is $Y"** (based on swap volume)
3. **"Your MEV Risk Score is Z"**
4. **"Recommendations to reduce risk"**

---

## Implementation Plan (MVP)

### Phase 1: Add to existing privacy analysis
Add MEV risk metrics to current `/api/v3/analyze/:wallet` response.

### Phase 2: Show in frontend
Add `MevRiskSection.tsx` component to show:
- Swap count
- Risk score
- Vulnerability factors
- Protection recommendations

### Phase 3: Standalone page (optional)
Create `/attackanalyzer` for deep analysis.

---

## Test Wallets

| Wallet | Type | Expected Result |
|--------|------|-----------------|
| `5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1` | Raydium heavy trader | High MEV risk |
| `DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK` | Low activity | Low MEV risk |

---

## Next Steps

1. [x] Test Helius API integration
2. [x] Understand attacker patterns
3. [ ] Implement MEV Risk Score calculation
4. [ ] Add to CLI for testing
5. [ ] Add to frontend
6. [ ] Deploy

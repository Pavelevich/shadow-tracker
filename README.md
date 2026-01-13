# SolPrivacy - Solana Wallet Privacy Analyzer

> **"Your wallet is talking. We show you what it's saying."**

Advanced privacy analysis tool for Solana wallets using information theory, graph analysis, and blockchain forensics techniques from academic research.

**Live Demo:** [https://solprivacy.xyz](https://solprivacy.xyz)

---

## Overview

SolPrivacy analyzes any Solana wallet address and reveals how much information it leaks to blockchain observers, exchanges, and potential adversaries. Using the same techniques employed by Chainalysis, Elliptic, and academic researchers, we show users their true privacy posture.

### The Problem

Every Solana transaction is permanently recorded on a public ledger. While addresses are pseudonymous, patterns in your transactions can reveal:
- Your real-world identity
- Your financial habits and net worth
- Your timezone and location
- Your connections to other wallets
- Your exchange accounts (KYC exposure)

**Most users have no idea how exposed they are.**

### Our Solution

SolPrivacy provides:
1. **Comprehensive Privacy Score** - Single metric (0-100) summarizing your privacy
2. **Attack Simulation** - Shows how adversaries could de-anonymize you
3. **Actionable Recommendations** - Links to privacy tools that can help
4. **Educational Content** - Explains what makes you vulnerable

---

## Scientific Methodology

Our analysis is grounded in peer-reviewed academic research:

### Information Theory Metrics

| Metric | Formula | What It Measures |
|--------|---------|------------------|
| **Shannon Entropy** | H(X) = -Σ p(x) log₂ p(x) | Transaction randomness/predictability |
| **Mutual Information** | I(X;Y) = H(X) - H(X\|Y) | Correlation between transaction features |
| **Differential Privacy (ε)** | Pr[M(D)∈S] ≤ eᵋ × Pr[M(D')∈S] | Privacy guarantees against inference |

### K-Anonymity Analysis

Based on Sweeney's k-anonymity model, we identify **quasi-identifiers** - combinations of attributes that can uniquely identify your wallet:

- Transaction amounts (round numbers are distinctive)
- Transaction timing (reveals timezone)
- Counterparty patterns (who you transact with)
- Token preferences (what you hold/trade)

**k-value** represents how many other wallets share your behavioral fingerprint. Lower k = easier to identify.

### Graph Topology Analysis

Using network science techniques:

| Metric | Description |
|--------|-------------|
| **Degree Centrality** | Number of unique counterparties |
| **Clustering Coefficient** | How interconnected your contacts are |
| **Betweenness Centrality** | Your position in transaction flows |
| **PageRank** | Your "importance" in the network |

### Attack Vector Simulation

We simulate real-world de-anonymization attacks:

1. **Temporal Fingerprinting** - Timezone inference from transaction timing
2. **Dust Attack Tracking** - Malicious small deposits to track spending
3. **Graph Topology Attack** - Network analysis to cluster wallets
4. **Exchange Correlation** - Matching deposits/withdrawals to KYC'd accounts
5. **Amount Heuristics** - Round number and change address analysis

---

## Features

### Privacy Score Dashboard
- Overall score (0-100) with letter grade
- Risk level indicator (MINIMAL → CRITICAL)
- Before/after comparison showing improvement potential

### Attack Simulation
- Probability of de-anonymization by attack type
- Estimated time for adversary to identify you
- Specific vulnerabilities in your wallet

### Identity Fingerprint
- K-anonymity value (how unique you are)
- Quasi-identifiers making you distinctive
- Graph statistics (connections, clustering)

### Detailed Alerts
- Dust attack detection and sender analysis
- Exchange/KYC exposure measurement
- Traceability risk assessment

### Privacy Tools Recommendations
- Personalized tool suggestions based on your issues
- Links to: Light Protocol, Arcium, Dust Protocol, Jupiter, Raydium
- Projected improvement scores for each tool

### Protocol Integrations
- **Light Protocol** - ZK compression for shielded transactions
- **Arcium** - MPC for confidential computing

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | TailwindCSS, Framer Motion |
| UI Components | shadcn/ui |
| API | Express.js, Node.js |
| Blockchain | Solana Web3.js, Helius RPC |
| Hosting | Digital Ocean, Nginx |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Option 1: CLI Tool (Recommended)

```bash
# Install globally
npm install -g solprivacy

# Run the CLI
solprivacy
```

The CLI includes an AI-powered agent with attack simulations, wallet comparison, and more.

**npm:** [npmjs.com/package/solprivacy](https://www.npmjs.com/package/solprivacy)

### Option 2: Web Frontend

```bash
# Clone the repository
git clone https://github.com/Pavelevich/shadow-tracker.git

# Navigate to project
cd shadow-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_API_URL=https://solprivacy.xyz/api/v3
```

---

## API Reference

### Analyze Wallet

```
GET /api/v3/analyze/:walletAddress
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "address": "...",
    "advancedPrivacyScore": 42,
    "grade": "D",
    "riskLevel": "HIGH",
    "entropy": { ... },
    "kAnonymity": { ... },
    "attackSimulation": { ... },
    "temporalAnalysis": { ... },
    "graph": { ... },
    "dustAttack": { ... },
    "exchangeFingerprint": { ... },
    "recommendations": [ ... ]
  }
}
```

---

## Academic References

1. Meiklejohn, S. et al. (2013). "A Fistful of Bitcoins: Characterizing Payments Among Men with No Names." *IMC '13*

2. Ron, D. & Shamir, A. (2013). "Quantitative Analysis of the Full Bitcoin Transaction Graph." *Financial Cryptography*

3. Sweeney, L. (2002). "k-Anonymity: A Model for Protecting Privacy." *International Journal of Uncertainty*

4. Narayanan, A. & Shmatikov, V. (2009). "De-anonymizing Social Networks." *IEEE S&P*

5. Möser, M. et al. (2018). "An Empirical Analysis of Traceability in the Monero Blockchain." *PoPETs*

6. Biryukov, A. et al. (2014). "Deanonymisation of Clients in Bitcoin P2P Network." *CCS '14*

---

## Hackathon Submission

**Solana Privacy Hackathon (January 2026)**

### Bounties Targeted

| Bounty | Prize | Fit |
|--------|-------|-----|
| Encrypt.trade - Educate about Privacy | $1,000 | Educational tool showing privacy risks |
| Open Track | $18,000 | Privacy-focused analysis tooling |
| Helius - Best Privacy Project | $5,000 | Comprehensive privacy solution |
| Light Protocol | Sponsor | Dedicated integration section |
| Arcium | Sponsor | MPC integration section |

### Why SolPrivacy?

1. **Educational Impact** - Users learn exactly how they're vulnerable
2. **Actionable** - Direct links to tools that can help
3. **Scientific Rigor** - Based on peer-reviewed research
4. **Beautiful UX** - Makes complex data accessible
5. **Real Data** - Analyzes actual mainnet transactions

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Contact

- **Website:** [solprivacy.xyz](https://solprivacy.xyz)
- **GitHub:** [github.com/Pavelevich/shadow-tracker](https://github.com/Pavelevich/shadow-tracker)

---

Built with privacy in mind for the Solana Privacy Hackathon 2026.

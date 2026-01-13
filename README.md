<p align="center">
  <img src="https://img.shields.io/badge/Solana-Privacy-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Privacy"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/npm/v/solprivacy?style=for-the-badge&logo=npm&logoColor=white&label=CLI&color=CB3837" alt="npm"/>
</p>

<h1 align="center">SolPrivacy</h1>

<p align="center">
  <strong>Your wallet is talking. We show you what it's saying.</strong>
</p>

<p align="center">
  Advanced privacy analysis for Solana wallets using information theory,<br/>
  graph analysis, and blockchain forensics from academic research.
</p>

<p align="center">
  <a href="https://solprivacy.xyz"><strong>Live Demo</strong></a> ·
  <a href="https://www.npmjs.com/package/solprivacy"><strong>CLI Tool</strong></a> ·
  <a href="#api-reference"><strong>API Docs</strong></a>
</p>

---

## The Problem

Every Solana transaction is **permanently recorded** on a public ledger. While addresses appear anonymous, patterns in your transactions can reveal:

| What's Exposed | How It's Detected |
|----------------|-------------------|
| Your real identity | Exchange KYC correlation |
| Net worth & holdings | Token balance analysis |
| Geographic location | Transaction timing patterns |
| Social connections | Counterparty graph analysis |
| Trading strategies | Behavioral fingerprinting |

**Most users have no idea how exposed they are.**

---

## How It Works

SolPrivacy uses the same techniques employed by **Chainalysis**, **Elliptic**, and academic researchers to analyze your wallet's privacy posture.

### Privacy Score (0-100)

```
┌─────────────────────────────────────────────────────────────┐
│  CRITICAL   │   HIGH    │  MODERATE  │   LOW    │  MINIMAL  │
│    0-20     │   21-40   │   41-60    │  61-80   │   81-100  │
└─────────────────────────────────────────────────────────────┘
```

### Attack Simulations

| Attack Vector | Description |
|---------------|-------------|
| **Temporal Fingerprinting** | Infer timezone from transaction timing |
| **Dust Attack Tracking** | Detect malicious micro-deposits |
| **Graph Topology** | Cluster wallets via network analysis |
| **Exchange Correlation** | Match to KYC'd exchange accounts |
| **Amount Heuristics** | Identify patterns in transaction amounts |

### Scientific Metrics

| Metric | What It Measures |
|--------|------------------|
| **Shannon Entropy** | Transaction randomness/predictability |
| **K-Anonymity** | How many wallets share your fingerprint |
| **Clustering Coefficient** | Network interconnectedness |
| **Differential Privacy (ε)** | Privacy guarantees against inference |

---

## Quick Start

### Option 1: CLI with AI Agent (Recommended)

```bash
npm install -g solprivacy
```

```bash
solprivacy
```

The CLI includes an **AI-powered agent** that can:
- Analyze wallets with natural language queries
- Simulate attacks on your wallet
- Compare privacy between wallets
- Generate detailed reports

### Option 2: Web Interface

Visit **[solprivacy.xyz](https://solprivacy.xyz)** and paste any Solana wallet address.

### Option 3: Self-Host

```bash
git clone https://github.com/Pavelevich/shadow-tracker.git
cd shadow-tracker
npm install
npm run dev
```

---

## Features

### Privacy Score Dashboard
- Overall score with letter grade (A-F)
- Risk level classification
- Before/after improvement projections

### Attack Simulation
- Probability of de-anonymization per attack type
- Estimated time for adversary identification
- Specific vulnerability breakdown

### Identity Fingerprint
- K-anonymity value
- Quasi-identifiers analysis
- Graph topology statistics

### Actionable Recommendations
- Personalized privacy tool suggestions
- Direct integration with Light Protocol, Arcium
- Projected score improvements

---

## API Reference

### Analyze Wallet

```
GET https://solprivacy.xyz/api/v3/analyze/:walletAddress
```

**Response:**

```json
{
  "success": true,
  "data": {
    "address": "...",
    "advancedPrivacyScore": 42,
    "grade": "D",
    "riskLevel": "HIGH",
    "entropy": {
      "totalEntropy": 0.73,
      "amountEntropy": 0.65,
      "temporalEntropy": 0.81
    },
    "kAnonymity": {
      "kValue": 12,
      "quasiIdentifiers": ["timing", "amounts"]
    },
    "attackSimulation": {
      "temporalAttack": { "probability": 0.78 },
      "graphAttack": { "probability": 0.45 }
    },
    "recommendations": [...]
  }
}
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, Framer Motion |
| **Components** | shadcn/ui |
| **Backend** | Express.js, Node.js |
| **Blockchain** | Helius Enhanced API |
| **Hosting** | Digital Ocean |

---

## Research Foundation

Our methodology is grounded in peer-reviewed academic research:

- Meiklejohn et al. (2013) - *"A Fistful of Bitcoins"* - IMC '13
- Ron & Shamir (2013) - *"Quantitative Analysis of Bitcoin Transaction Graph"*
- Sweeney (2002) - *"k-Anonymity: A Model for Protecting Privacy"*
- Narayanan & Shmatikov (2009) - *"De-anonymizing Social Networks"* - IEEE S&P
- Möser et al. (2018) - *"Traceability in the Monero Blockchain"* - PoPETs

---

## Integrations

<table>
  <tr>
    <td align="center" width="33%">
      <a href="https://lightprotocol.com">
        <strong>Light Protocol</strong>
      </a>
      <br/>
      ZK Compression
    </td>
    <td align="center" width="33%">
      <a href="https://helius.dev">
        <strong>Helius</strong>
      </a>
      <br/>
      Enhanced RPC
    </td>
    <td align="center" width="33%">
      <a href="https://arcium.com">
        <strong>Arcium</strong>
      </a>
      <br/>
      Confidential MPC
    </td>
  </tr>
</table>

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  <a href="https://solprivacy.xyz">Website</a> ·
  <a href="https://www.npmjs.com/package/solprivacy">npm</a> ·
  <a href="https://github.com/Pavelevich/solprivacy-cli">CLI Repo</a>
</p>

<p align="center">
  <sub>Built for the Solana ecosystem</sub>
</p>

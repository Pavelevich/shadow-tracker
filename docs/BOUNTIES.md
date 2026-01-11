# Solana Privacy Hackathon - Complete Bounty Guide

## Event Overview

**Dates:** January 12-30, 2026
**Submissions Due:** February 1, 2026
**Winners Announced:** February 10, 2026
**Total Prize Pool:** $100,000+

---

## Main Hackathon Tracks

### Track 1: Private Payments - $15,000
Build payment solutions that preserve user privacy on Solana.

### Track 2: Privacy Tooling - $15,000
Create tools and infrastructure for privacy-preserving applications.

### Track 3: Open Track (Light Protocol) - $18,000
Open-ended track for innovative privacy solutions.

---

## Sponsor Bounties

### 1. Privacy Cash - $15,000

**Sponsor:** Privacy Cash Team
**SDK:** https://github.com/Privacy-Cash/privacy-cash-sdk

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Best new app | $6,000 |
| Best integration to existing app | $6,000 |
| Honorable Mentions | $3,000 (3x $1,000) |

#### Challenge Description
Use Privacy Cash SDK to build privacy-enabled apps on Solana.

#### Suggested Use Cases
- Private lending protocols
- Whale wallet protection
- Private bridging
- Privacy-preserving games
- Anonymous DeFi interactions

#### Key Technical Pattern
```
1. Deposit main wallet's tokens to Privacy Cash (shield)
2. Withdraw tokens privately to a deterministic ephemeral wallet
3. Perform your action (lending, swaps, bridging, etc.)
4. Reshield balances back to main wallet
```

#### SDK Features
- `deposit()` / `withdraw()` - For SOL
- `depositSPL()` / `withdrawSPL()` - For USDC/USDT
- `getPrivateBalance()` / `getPrivateBalanceSpl()` - Check shielded balances

#### Requirements
- Node.js v24+
- TypeScript
- ~0.1 SOL for testing on mainnet

#### Resources
- SDK: https://github.com/Privacy-Cash/privacy-cash-sdk
- Audited by Zigtur

---

### 2. Arcium - $10,000

**Sponsor:** Arcium Team
**Docs:** https://docs.arcium.com/developers/

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Best Overall | $10,000 |

#### Challenge Description
Build fully confidential DeFi using Arcium and C-SPL (Confidential SPL Token Standard).

#### Suggested Use Cases
- Private swaps with hidden amounts
- Confidential lending/borrowing
- Dark pools for large trades
- Private order books
- Confidential yield farming

#### Technical Overview
Arcium uses Multi-Party Computation (MPC) to process encrypted data:
1. Client encrypts and sends data to MXE program
2. Program submits computation to Arcium's MPC nodes
3. Nodes process encrypted data without decryption
4. Results returned on-chain

#### Integration Libraries
```bash
# Client Library (encrypt, submit, callbacks)
npm install @arcium-hq/client

# Reader Library (read MXE state, monitor)
npm install @arcium-hq/reader
```

#### Key Features
- Familiar Anchor-based development
- `arcium` CLI wraps Anchor
- Mark functions as confidential - no crypto expertise needed
- C-SPL token standard for confidential transfers

#### Resources
- Docs: https://docs.arcium.com/developers/hello-world
- JS Library: https://ts.arcium.com/
- Network: Solana Devnet (Public Testnet)

---

### 3. Aztec (Noir) - $10,000

**Sponsor:** Aztec Team
**Docs:** https://noir-lang.org/docs

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Best Overall | $5,000 |
| Eating Glass | $2,500 |
| Most Creative | $2,500 |

**"Eating Glass"** = Do something very hard, or make something hard look easy

#### Challenge Description
Build ZK applications using Noir, now possible on Solana.

#### What is Noir?
A Domain-Specific Language for constructing privacy-preserving Zero-Knowledge programs. No previous cryptography knowledge required.

#### Key Features
- Backend agnostic (Barretenberg default, supports PLONK, R1CS)
- Compiles to ACIR (intermediate representation)
- Rust-like syntax
- Extensive standard library

#### Use Cases
- Anonymous voting systems
- Private credential verification
- ZK-based identity
- Confidential NFT ownership proofs
- Private auctions
- Merkle proof verification

#### Example Circuit
```noir
// Prove age >= 18 without revealing actual age
fn main(age: Field, threshold: pub Field) {
    assert(age >= threshold);
}
```

#### Integration Options
- Solidity Verifiers (auto-generated)
- NoirJS for web/mobile
- Custom Solana verifier programs

#### Resources
- Docs: https://noir-lang.org/docs
- awesome-noir repo for community libraries

---

### 4. Inco - $6,000

**Sponsor:** Inco Team (Remi - Founder)
**Docs:** https://docs.inco.org/svm/home

#### Prize Breakdown
| Category | Amount |
|----------|--------|
| DeFi | $2,000 |
| Consumer/Gaming/Prediction Markets | $2,000 |
| Payments | $2,000 |

#### Challenge Description
Build confidential applications using Inco Lightning on Solana.

#### Technical Overview
Inco Lightning is a confidential computing platform that enables:
- Private data types and operations
- Programmable access control
- Conditional decryption (eselect + attested decrypt)
- On-chain decryption based on program conditions

#### Architecture
- NOT threshold-FHE
- Uses TEEs with lightweight asymmetric encryption (ECIES)
- Subject to future changes

#### Key Features
- Encrypted types and handles
- Operations on encrypted data
- Random number generation
- Access control systems
- Attested Decrypt for on-chain verification
- Attested Reveal for off-chain display

#### Integration
- Rust crate for Anchor programs
- JavaScript SDK for frontend

#### Suggested Focus
- Confidential execution (primary)
- Confidential value transfer
- Private DeFi (the trend)

#### Resources
- Docs: https://docs.inco.org/svm/home
- Attested Decrypt: https://docs.inco.org/svm/js-sdk/attestations/attested-decrypt

---

### 5. Helius - $5,000

**Sponsor:** Helius Team
**Docs:** https://www.helius.dev/docs

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Best Privacy Project using Helius | $5,000 |

#### Challenge Description
Build the best privacy project that leverages Helius' RPCs and developer tooling.

#### Available Tools
- **RPC Nodes:** Lightning-fast, built for performance
- **Webhooks:** Custom notifications for on-chain events
- **Enhanced WebSockets:** Advanced subscriptions with granular filtering
- **DAS API:** Comprehensive NFT and token querying
- **Priority Fee API:** Smart fee estimation based on network conditions
- **ORB Explorer:** Intuitive blockchain visualization
- **SDKs:** Node.js and Rust libraries

#### Integration Ideas
- Private transaction monitoring via webhooks
- Confidential asset management with DAS API
- Anonymous notification systems
- Privacy-preserving analytics dashboards

#### Resources
- Docs: https://www.helius.dev/docs
- Get API key: https://helius.dev

---

### 6. Starpay - $3,500

**Sponsor:** Starpay Team
**Docs:** https://docs.starpayinfo.com/

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Best Overall Integration | $2,500 |
| Second Place | $1,000 |

#### Challenge Description
Build privacy-focused payment and DeFi integrations using Starpay APIs.

#### Features Available
- Card issuance (virtual cards in seconds)
- ZK Swap for anonymous crypto-to-crypto execution
- Apple Pay / Google Pay integration
- NFC payments
- Automatic crypto conversion

#### Use Cases
1. **Payments & Spending**
   - Card issuance
   - Crypto-funded cards
   - Anonymous spending

2. **DeFi & Privacy**
   - ZK swaps
   - Private execution flows
   - Confidential trading

3. **Consumer Apps**
   - Crypto spending wallets
   - On-chain UX improvements
   - Private subscription payments

#### Pricing
- Issuance Fee: 0.2% (min $5, max $500)

#### API Access
DM the Starpay team for API credentials.

#### Resources
- Docs: https://docs.starpayinfo.com/
- Website: https://starpay.cards
- Twitter: https://x.com/starpaycards

---

### 7. Range - $1,500 + API Credits

**Sponsor:** Range Protocol Team
**Website:** https://www.range.org/

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Best Compliant Privacy App | $1,500 + API Credits |

#### Challenge Description
Build private and confidential applications that are compliant and safe using Range's tools.

#### Features Available
- **Pre-screening:** Check transactions against sanctions/blacklists
- **Selective Disclosure:** Reveal only necessary information
- **Risk Assessment:** AI-powered real-time risk scoring
- **Transaction Monitoring:** Continuous surveillance with alerts
- **Wallet Attribution:** Identify wallet ownership

#### Use Cases
- Compliant anonymous payments
- Private DeFi with regulatory compliance
- Auditable privacy solutions
- Selective disclosure for KYC/AML
- Risk-scored private transactions

#### Key Concept
Privacy ≠ Non-compliance. Build applications where:
- Users maintain privacy
- Compliance requirements are met
- Selective disclosure is possible
- Audit trails exist when legally required

#### Resources
- Website: https://www.range.org/
- Blog: https://www.range.org/blog/risk-intelligence-now-onchain-for-solana-programs

---

### 8. Encrypt.trade - $1,000

**Sponsor:** Encrypt.trade Team

#### Prize Breakdown
| Prize | Amount |
|-------|--------|
| Educate about wallet surveillance | $500 |
| Explain privacy without jargon | $500 |

#### Challenge Description
Help users understand crypto surveillance and why privacy matters.

#### Deliverables

**Track A: Wallet Surveillance Education ($500)**
- Explain how wallets are tracked
- Demonstrate surveillance techniques
- Show real-world examples
- Visualize tracking methods

**Track B: Privacy Explanation ($500)**
- Explain privacy concepts simply
- Avoid technical jargon
- Make it accessible to non-crypto users
- Create educational content/tools

#### Ideas
- Interactive surveillance visualization tool
- "Track my wallet" demo showing what's public
- Plain-language privacy guide
- Comparison tool: public vs private transactions
- Privacy score calculator

---

### 9. Triton - RPC Infrastructure (No Cash Prize)

**Sponsor:** Triton Team
**Website:** https://triton.one/solana

#### Offering
Free RPC infrastructure access for hackathon participants.

#### Features
- Dedicated nodes (NA, Europe, APAC)
- Fast gPA (getProgramAccounts) responses
- Geyser-fed gRPC for real-time streaming
- Full blockchain history access
- Project Yellowstone tools

#### How to Get Access
Contact Triton team in hackathon Discord/Telegram for API credentials.

---

## Submission Requirements

1. **Open Source Code** - All code must be publicly available
2. **Solana Integration** - Must integrate with Solana blockchain
3. **Privacy Technology** - Must use privacy-preserving techniques
4. **Deployment** - Programs deployed to devnet or mainnet
5. **Demo Video** - Maximum 3 minutes
6. **Documentation** - Comprehensive README and docs

---

## Judging Criteria

| Criteria | Weight |
|----------|--------|
| Innovation | 25% |
| Technical Implementation | 25% |
| User Experience | 20% |
| Potential Impact | 15% |
| Presentation | 15% |

---

## Quick Reference: Prize Summary

| Sponsor | Total Prize | Focus Area |
|---------|-------------|------------|
| Private Payments Track | $15,000 | Payment solutions |
| Privacy Tooling Track | $15,000 | Developer tools |
| Open Track | $18,000 | Any privacy solution |
| Privacy Cash | $15,000 | SDK integration |
| Arcium | $10,000 | Confidential DeFi |
| Aztec (Noir) | $10,000 | ZK applications |
| Inco | $6,000 | Confidential apps |
| Helius | $5,000 | Best with Helius tools |
| Starpay | $3,500 | Payment integrations |
| Range | $1,500+ | Compliant privacy |
| Encrypt.trade | $1,000 | Education |
| **TOTAL** | **$100,000+** | |

---

## Strategy Tips

1. **Stack Bounties** - One project can win multiple bounties
2. **Use Multiple SDKs** - Combine Privacy Cash + Helius + Range for max coverage
3. **Focus on UX** - Privacy apps often have poor UX - make yours simple
4. **Document Well** - Judges need to understand your project quickly
5. **Demo Video** - Show, don't tell. Make it visual and clear
6. **Start Simple** - MVP first, then expand

---

## Resources Summary

| Tool | URL |
|------|-----|
| Privacy Cash SDK | https://github.com/Privacy-Cash/privacy-cash-sdk |
| Arcium Docs | https://docs.arcium.com/developers/ |
| Noir Docs | https://noir-lang.org/docs |
| Inco Docs | https://docs.inco.org/svm/home |
| Helius Docs | https://www.helius.dev/docs |
| Starpay Docs | https://docs.starpayinfo.com/ |
| Range | https://www.range.org/ |
| Triton | https://triton.one/solana |

---

## Contact & Support

Each sponsor has dedicated channels in the hackathon Discord/Telegram. Use them for:
- Technical questions
- API access requests
- Feedback on your ideas
- Debugging help

Good luck, hackers! Build something amazing for privacy on Solana.

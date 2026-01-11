# Mathematical Foundations for Solana Privacy Hackathon

## Research Papers and Academic References

This document compiles the mathematical and cryptographic foundations relevant to each hackathon bounty, with links to academic papers and technical resources.

---

## Table of Contents

1. [Zero-Knowledge Proofs (Aztec/Noir Bounty)](#1-zero-knowledge-proofs)
2. [Multi-Party Computation (Arcium Bounty)](#2-multi-party-computation)
3. [Confidential Transactions (Privacy Cash Bounty)](#3-confidential-transactions)
4. [Homomorphic Encryption (Inco Bounty)](#4-homomorphic-encryption)
5. [Compliance & Selective Disclosure (Range Bounty)](#5-compliance--selective-disclosure)
6. [ElGamal & Solana Confidential Transfers](#6-elgamal--solana-confidential-transfers)
7. [ZK-Friendly Hash Functions](#7-zk-friendly-hash-functions)
8. [Trusted Execution Environments](#8-trusted-execution-environments)

---

## 1. Zero-Knowledge Proofs

### Relevant Bounties: Aztec ($10,000), Privacy Cash ($15,000)

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **PLONK: Permutations over Lagrange-bases for Oecumenical Noninteractive Arguments of Knowledge** | Gabizon, Williamson, Ciobotaru | [IACR ePrint 2019/953](https://eprint.iacr.org/2019/953.pdf) | Foundation of Noir's backend |
| **Zero-Knowledge Proof Frameworks: A Systematic Survey** | Various | [arXiv 2502.07063](https://arxiv.org/pdf/2502.07063) | Comprehensive framework comparison |
| **zk-SNARKs: A Gentle Introduction** | Anca Nitulescu | [ENS Paris](https://www.di.ens.fr/~nitulesc/files/Survey-SNARKs.pdf) | Theoretical foundations |
| **A Survey on the Applications of Zero-Knowledge Proofs** | Various | [arXiv 2408.00243](https://arxiv.org/html/2408.00243v1) | Practical applications overview |

### Key Mathematical Concepts

#### 1.1 Arithmetic Circuits and R1CS

Zero-knowledge proofs work by converting computations into constraint systems:

```
R1CS (Rank-1 Constraint System):
For vectors a, b, c and witness w:
(a · w) * (b · w) = (c · w)
```

**Example**: Proving x² = y
```
Constraint: (1, x) · (1, x) = (1, y)
a = [0, 1], b = [0, 1], c = [0, 0, 1]
w = [1, x, y]
```

#### 1.2 PLONK Arithmetization

PLONK uses a different constraint system called PLONKish:

```
Gate equation:
qₗ·a + qᵣ·b + qₒ·c + qₘ·(a·b) + qc = 0

Where:
- qₗ, qᵣ, qₒ, qₘ, qc are selector polynomials
- a, b, c are wire values
```

**Polynomial Commitment (KZG)**:
```
Commit(f(x)) = g^f(τ)

Where:
- g is a generator of elliptic curve group
- τ is the toxic waste from trusted setup
- f(x) is the polynomial to commit
```

#### 1.3 Noir Circuit Example

```noir
// Mathematical proof: x² + y² = z² (Pythagorean theorem)
fn main(x: Field, y: Field, z: pub Field) {
    let x_sq = x * x;
    let y_sq = y * y;
    let z_sq = z * z;
    assert(x_sq + y_sq == z_sq);
}
```

This compiles to PLONK constraints via ACIR.

### Resources
- [Understanding PLONK by Vitalik Buterin](https://vitalik.eth.limo/general/2019/09/22/plonk.html)
- [Noir Documentation](https://noir-lang.org/docs/)
- [PLONK Arithmetization Deep Dive](https://hackmd.io/@jake/plonk-arithmetization)

---

## 2. Multi-Party Computation

### Relevant Bounty: Arcium ($10,000)

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **An Introduction to Secret-Sharing-Based Secure Multiparty Computation** | Various | [IACR ePrint 2022/062](https://eprint.iacr.org/2022/062.pdf) | Comprehensive MPC introduction |
| **Secure Multiparty Computation (MPC)** | Yehuda Lindell | [IACR ePrint 2020/300](https://eprint.iacr.org/2020/300.pdf) | Theoretical foundations |
| **Secure Multiparty Computation and Secret Sharing** | Cramer, Damgård, Nielsen | [Cambridge](https://www.cambridge.org/core/books/secure-multiparty-computation-and-secret-sharing/4C2480B202905CE5370B2609F0C2A67A) | Textbook reference |

### Key Mathematical Concepts

#### 2.1 Shamir Secret Sharing

**Original Paper**: Shamir, "How to Share a Secret", CACM 1979

Split secret S into n shares where any k shares can reconstruct S:

```
1. Choose random polynomial of degree k-1:
   f(x) = S + a₁x + a₂x² + ... + aₖ₋₁x^(k-1)

2. Generate shares:
   Share_i = (i, f(i)) for i = 1, 2, ..., n

3. Reconstruction via Lagrange interpolation:
   S = f(0) = Σᵢ yᵢ · Πⱼ≠ᵢ (xⱼ / (xⱼ - xᵢ))
```

#### 2.2 MPC Protocol Structure

```
┌─────────────────────────────────────────────────────────┐
│                    MPC Protocol                          │
├─────────────────────────────────────────────────────────┤
│  Input Phase:                                            │
│    Each party Pᵢ secret-shares input xᵢ                 │
│                                                          │
│  Computation Phase:                                      │
│    Addition: [x] + [y] = [x + y] (local operation)      │
│    Multiplication: [x] · [y] requires communication     │
│                                                          │
│  Output Phase:                                           │
│    Reconstruct result by combining shares               │
└─────────────────────────────────────────────────────────┘
```

#### 2.3 Beaver Triples (Multiplication)

For secure multiplication without revealing inputs:

```
Pre-computed triple: (a, b, c) where c = a·b

To compute [x·y]:
1. Open d = x - a and e = y - b
2. [x·y] = [c] + d·[b] + e·[a] + d·e
```

### Application to Arcium

Arcium uses MPC to enable confidential DeFi:
- Order amounts encrypted
- MPC nodes compute matches without seeing values
- Only final settlement revealed

---

## 3. Confidential Transactions

### Relevant Bounty: Privacy Cash ($15,000), Starpay ($3,500)

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **Bulletproofs: Short Proofs for Confidential Transactions and More** | Bünz, Bootle, Boneh, et al. | [Stanford](https://web.stanford.edu/~buenz/pubs/bulletproofs.pdf) | Range proofs for hidden amounts |
| **Bulletproofs++: Next Generation Confidential Transactions** | Various | [IACR ePrint 2022/510](https://eprint.iacr.org/2022/510.pdf) | Improved efficiency |
| **SoK: Zero-Knowledge Range Proofs** | Miranda Christ | [Dagstuhl](https://drops.dagstuhl.de/storage/00lipics/lipics-vol316-aft2024/LIPIcs.AFT.2024.14/LIPIcs.AFT.2024.14.pdf) | Comprehensive range proof survey |

### Key Mathematical Concepts

#### 3.1 Pedersen Commitments

**Binding & Hiding Commitment Scheme**:

```
Setup: G, H generators of elliptic curve group
       (nobody knows log_G(H))

Commit(v, r) = v·G + r·H

Properties:
- Perfectly hiding: For any v, commitment looks random
- Computationally binding: Can't open to different value
- Homomorphic: C(v₁) + C(v₂) = C(v₁ + v₂)
```

#### 3.2 Range Proofs

Prove that committed value v is in range [0, 2ⁿ) without revealing v:

```
Bulletproof range proof:
1. Commit to v using Pedersen commitment
2. Express v in binary: v = Σᵢ vᵢ · 2ⁱ
3. Prove each vᵢ ∈ {0, 1}
4. Use inner product argument for efficiency

Proof size: O(log n) instead of O(n)
```

#### 3.3 Confidential Transaction Structure

```
TX: {
  inputs: [C₁, C₂, ...],      // Pedersen commitments
  outputs: [C₁', C₂', ...],   // Pedersen commitments
  range_proofs: [π₁, π₂, ...], // Bulletproofs
  balance_proof: π_balance     // Proves Σinputs = Σoutputs
}

Verification:
1. Σ C_inputs - Σ C_outputs = 0 (mod group order)
2. All range proofs valid
3. Signatures valid
```

### Application to Privacy Cash

```typescript
// Shield: public → private
deposit(amount) → Pedersen.commit(amount, randomness)

// Private transfer
transfer(commitment_in, commitment_out, range_proof)

// Unshield: private → public
withdraw(commitment, amount, opening) // Reveals amount
```

---

## 4. Homomorphic Encryption

### Relevant Bounty: Inco ($6,000)

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **A Fully Homomorphic Encryption Scheme** | Craig Gentry | [Stanford Thesis](https://crypto.stanford.edu/craig/craig-thesis.pdf) | FHE foundations |
| **smartFHE: Privacy-Preserving Smart Contracts from FHE** | Various | [IACR ePrint 2021/133](https://eprint.iacr.org/2021/133.pdf) | Blockchain applications |
| **FHEVM Whitepaper** | Zama | [GitHub](https://github.com/zama-ai/fhevm/blob/main/fhevm-whitepaper.pdf) | Practical FHE for blockchains |

### Key Mathematical Concepts

#### 4.1 Homomorphic Encryption Properties

```
Encryption scheme E is homomorphic if:

Additive: E(m₁) ⊕ E(m₂) = E(m₁ + m₂)
Multiplicative: E(m₁) ⊗ E(m₂) = E(m₁ · m₂)

Fully Homomorphic: Both operations supported
```

#### 4.2 Learning With Errors (LWE)

Foundation of modern FHE schemes:

```
LWE Problem:
Given: (A, b = A·s + e) where:
  - A is random matrix
  - s is secret vector
  - e is small error vector

Find: s

Security: Believed quantum-resistant
```

#### 4.3 CKKS Scheme (Approximate FHE)

For real number computations:

```
Encrypt(m):
1. Encode m as polynomial p(x)
2. Add noise: c = p(x) + e
3. Encrypt under LWE

Operations:
- Add: c₁ + c₂
- Multiply: c₁ · c₂ (requires rescaling)
- Bootstrap: Reduce noise accumulation
```

### Application to Inco

Inco uses TEE-based encryption (not full FHE) for performance:

```
Inco Architecture:
1. Client encrypts input with ECIES
2. TEE decrypts, computes, re-encrypts
3. Only authorized parties can decrypt output

Attested Decrypt:
- Proves computation happened correctly
- Without revealing intermediate values
```

---

## 5. Compliance & Selective Disclosure

### Relevant Bounty: Range ($1,500+)

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium** | Buterin, Illum, Nadler, et al. | [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2096720923000519) | Privacy Pools protocol |
| **SeDe: Selective De-Anonymization** | Various | [arXiv 2311.08167](https://arxiv.org/html/2311.08167v5) | Compliant privacy framework |
| **Multi-Level Regulation Compliance** | Various | [Nature/Scientific Reports](https://www.nature.com/articles/s41598-023-50209-x) | ZK-based regulation |

### Key Mathematical Concepts

#### 5.1 Privacy Pools (Association Sets)

```
Association Set S = {tx₁, tx₂, ..., txₙ}

User proves:
1. My transaction ∈ S (Merkle proof)
2. S contains only "clean" transactions
3. Without revealing which tx is mine

ZK Statement:
∃ i : tx_i ∈ S ∧ tx_i = my_tx ∧ S ⊆ CleanSet
```

#### 5.2 Attribute-Based Encryption (ABE)

For selective disclosure based on attributes:

```
Setup: Generate master key MK, public params PP

KeyGen(MK, attributes):
  SK_user = key for user's attributes

Encrypt(PP, message, policy):
  CT = encryption under access policy

Decrypt(SK_user, CT):
  If attributes satisfy policy → message
  Else → ⊥
```

#### 5.3 Proof of Innocence

```
Statement: "My funds did not come from sanctioned addresses"

Proof structure:
1. Merkle tree of all deposits
2. Subtree of compliant deposits
3. ZK proof: My deposit ∈ compliant subtree
4. Nullifier prevents double-claiming
```

### Application to Range

```typescript
// Pre-screen before transaction
const risk = await range.screenAddress(counterparty);

if (risk.score < threshold) {
  // Proceed with private transaction
  await privateTransfer(...);
} else {
  // Generate selective disclosure for auditor
  const proof = await range.generateDisclosure({
    level: 'amount_only',
    auditorKey: auditorPubkey
  });
}
```

---

## 6. ElGamal & Solana Confidential Transfers

### Relevant Bounties: All privacy bounties on Solana

### Core Documentation

| Resource | Link | Description |
|----------|------|-------------|
| **Solana Confidential Transfer Docs** | [Solana](https://solana.com/docs/tokens/extensions/confidential-transfer) | Official documentation |
| **SPL Encryption Deep Dive** | [SPL Docs](https://spl.solana.com/confidential-token/deep-dive/encryption) | Twisted ElGamal details |
| **SIMD 0153: ZK ElGamal Proof Program** | [GitHub](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0153-elgamal-proof-program.md) | Proposal for native ZK proofs |

### Key Mathematical Concepts

#### 6.1 Standard ElGamal

```
KeyGen:
  sk = random x
  pk = g^x

Encrypt(pk, m):
  r = random
  c₁ = g^r
  c₂ = m · pk^r = m · g^(x·r)
  return (c₁, c₂)

Decrypt(sk, c₁, c₂):
  m = c₂ / c₁^sk = c₂ / g^(r·x)
```

#### 6.2 Twisted ElGamal (Solana)

Modified for homomorphic operations:

```
Encrypt(pk, m):
  r = random
  C = m·G + r·H        // Pedersen commitment
  D = r·pk             // Decryption handle
  return (C, D)

Decrypt(sk, C, D):
  r·G = D / sk
  m·G = C - r·H
  m = discrete_log(m·G)  // Only works for small m

Homomorphic Addition:
  (C₁, D₁) + (C₂, D₂) = (C₁ + C₂, D₁ + D₂)
```

#### 6.3 Sigma Protocols for Validation

```
Prove: Ciphertext encrypts value in [0, 2^64)

Protocol:
1. Prover commits to bit decomposition
2. Prover sends range proof π
3. Verifier checks:
   - Commitment structure valid
   - Range proof valid
   - Homomorphic relation holds
```

---

## 7. ZK-Friendly Hash Functions

### Relevant Bounty: Aztec ($10,000), All ZK applications

### Core Paper

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **Poseidon: A New Hash Function for Zero-Knowledge Proof Systems** | Grassi, Khovratovich, et al. | [USENIX Security 21](https://www.usenix.org/system/files/sec21-grassi.pdf) | Standard ZK hash |

### Key Mathematical Concepts

#### 7.1 Why ZK-Friendly Hashes?

```
SHA-256 in ZK circuits: ~25,000 constraints
Poseidon in ZK circuits: ~300 constraints

Reason: SHA-256 uses bitwise operations (XOR, AND)
        Poseidon uses field arithmetic (add, multiply)
```

#### 7.2 Poseidon Construction

```
Sponge construction over prime field Fp:

State: [s₀, s₁, ..., sₜ₋₁]

Round function:
1. Add round constants
2. Apply S-box: x → x^α (where gcd(α, p-1) = 1)
3. Linear layer: MDS matrix multiplication

Full rounds: Apply S-box to all state elements
Partial rounds: Apply S-box to first element only
```

#### 7.3 Poseidon in Merkle Trees

```
Optimal configuration for ZK Merkle proofs:
- Arity: 4 (width 5)
- Security: 128 bits
- Constraints per hash: ~300

Merkle proof verification:
1. Hash leaf with Poseidon
2. For each level: hash siblings together
3. Compare with root (public input)
```

---

## 8. Trusted Execution Environments

### Relevant Bounty: Inco ($6,000)

### Core Resources

| Resource | Link | Description |
|----------|------|-------------|
| **TEEs: A Primer** | [a16z crypto](https://a16zcrypto.com/posts/article/trusted-execution-environments-tees-primer/) | Comprehensive introduction |
| **TEEs for Blockchain** | [IEEE](https://ieeexplore.ieee.org/iel8/6488907/11153580/11073814.pdf) | Academic survey |

### Key Concepts

#### 8.1 TEE Security Model

```
┌─────────────────────────────────────────────┐
│              Untrusted Host                  │
│  ┌───────────────────────────────────────┐  │
│  │           TEE Enclave                  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │      Encrypted Memory            │  │  │
│  │  │   - Private keys                 │  │  │
│  │  │   - Decrypted computation        │  │  │
│  │  │   - Secrets                      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  Attestation: Prove code integrity    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### 8.2 Remote Attestation

```
Attestation Protocol:
1. TEE generates measurement of loaded code
2. TEE signs measurement with hardware key
3. Verifier checks:
   - Signature from genuine TEE hardware
   - Code measurement matches expected
   - TEE is in secure state
```

#### 8.3 TEE vs Cryptographic Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **TEE** | Fast, practical | Hardware trust, side-channels |
| **FHE** | Pure math security | Very slow (1000x overhead) |
| **MPC** | Distributed trust | Communication overhead |
| **ZKP** | Strongest privacy | Prover computation cost |

---

## 9. Mixing Protocols & Anonymity Sets

### Relevant Bounty: Privacy Cash ($15,000), Encrypt.trade ($1,000)

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **SoK: How private is Bitcoin?** | Various | [IACR ePrint 2021/629](https://eprint.iacr.org/2021/629.pdf) | Bitcoin privacy analysis |
| **Anonymity on Blockchain E-Cash** | Various | [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S1574013721000344) | Comprehensive survey |

### Key Mathematical Concepts

#### 9.1 Anonymity Set

```
Definition:
Anonymity set = Group of possible transaction origins

Attack success probability:
P(identify sender) = 1 / |anonymity_set|

Larger set → Better privacy
```

#### 9.2 Mixing Protocol (Tornado Cash style)

```
Deposit:
1. Generate secret (nullifier, secret)
2. Compute commitment = hash(nullifier, secret)
3. Add commitment to Merkle tree
4. Deposit fixed amount

Withdraw:
1. Generate ZK proof:
   - I know (nullifier, secret) for some leaf
   - This leaf is in the Merkle tree
   - nullifier hasn't been used before
2. Reveal nullifier (prevents double-spend)
3. Receive funds to new address

Privacy: Withdrawal unlinkable to deposit
```

#### 9.3 Ring Signatures (Monero style)

```
Sign message m with key pair (sk, pk):

1. Choose decoy public keys: pk₁, pk₂, ..., pkₙ
2. Create ring: R = {pk, pk₁, pk₂, ..., pkₙ}
3. Generate ring signature σ
4. Verifier knows: One of R signed m
5. Verifier doesn't know: Which one

Anonymity set = |R|
```

---

## 10. Dark Pools & Private Order Books

### Relevant Bounty: Arcium ($10,000), Starpay ($3,500)

### Core Paper

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **Rialto: Privacy-Preserving Decentralized Exchange** | Various | [arXiv 2111.15259](https://arxiv.org/abs/2111.15259) | Confidential DEX design |

### Key Concepts

#### 10.1 Order Book Privacy Requirements

```
Properties needed:
1. Price privacy: Order prices hidden until execution
2. Size privacy: Order sizes hidden
3. Identity privacy: Trader addresses unlinkable
4. Front-running resistance: MEV protection
```

#### 10.2 Encrypted Order Matching

```
Order structure:
  Order = {
    Encrypt(price),
    Encrypt(size),
    side: buy/sell,
    commitment: hash(price, size, nonce)
  }

Matching in MPC:
1. Collect encrypted orders
2. MPC nodes compute matches
3. Reveal only matched orders
4. Settlement on-chain
```

#### 10.3 Commit-Reveal Scheme

```
Phase 1 - Commit:
  commitment = hash(order || random_nonce)
  Submit commitment to chain

Phase 2 - Reveal:
  Submit (order, nonce)
  Verify hash matches commitment

Phase 3 - Match:
  Match revealed orders by price-time priority

Anti-front-running:
  Commitment hides order until reveal
  All reveals in same block
```

---

## 11. Anonymous Voting

### Relevant Bounty: Aztec ($10,000) - Most Creative

### Core Papers

| Paper | Authors | Link | Relevance |
|-------|---------|------|-----------|
| **ElectAnon** | Various | [arXiv 2204.00057](https://arxiv.org/pdf/2204.00057) | Anonymous voting protocol |
| **Scalable Decentralized E-Voting** | Various | [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S2214212623002296) | ZK off-chain computation |

### Implementation Pattern

```noir
// Anonymous voting circuit in Noir

fn main(
    // Private inputs
    voter_secret: Field,
    merkle_path: [Field; DEPTH],
    merkle_indices: [u1; DEPTH],

    // Public inputs
    voters_root: pub Field,
    nullifier: pub Field,
    vote: pub Field
) {
    // 1. Derive voter commitment
    let voter_commitment = poseidon_hash([voter_secret]);

    // 2. Verify Merkle membership
    let computed_root = verify_merkle_path(
        voter_commitment,
        merkle_path,
        merkle_indices
    );
    assert(computed_root == voters_root);

    // 3. Verify nullifier (prevents double voting)
    let expected_nullifier = poseidon_hash([voter_secret, vote]);
    assert(nullifier == expected_nullifier);

    // 4. Vote is valid (0, 1, or 2)
    assert(vote as u8 < 3);
}
```

---

## 12. Quick Reference: Math for Each Bounty

| Bounty | Primary Math | Key Papers |
|--------|--------------|------------|
| **Privacy Cash ($15k)** | Pedersen commitments, Bulletproofs, Merkle trees | Bulletproofs paper, Tornado Cash |
| **Arcium ($10k)** | Shamir secret sharing, MPC protocols, Beaver triples | IACR 2022/062, 2020/300 |
| **Aztec/Noir ($10k)** | PLONK arithmetization, KZG commitments, Poseidon hash | PLONK paper, Poseidon paper |
| **Inco ($6k)** | TEE attestation, ECIES encryption, conditional decryption | a16z TEE primer |
| **Helius ($5k)** | Use above + Solana-specific optimizations | Solana docs |
| **Starpay ($3.5k)** | ZK swaps, commitment schemes | Rialto paper |
| **Range ($1.5k)** | Privacy Pools, selective disclosure, ABE | Buterin et al. 2023 |
| **Encrypt.trade ($1k)** | Mixing analysis, anonymity metrics | SoK Bitcoin privacy |

---

## 13. Implementation Checklist

### For ZK Applications (Noir)
- [ ] Understand PLONK constraint system
- [ ] Use Poseidon hash (not SHA-256)
- [ ] Minimize constraints (audit circuit size)
- [ ] Separate public/private inputs correctly
- [ ] Test with `nargo prove` and `nargo verify`

### For MPC Applications (Arcium)
- [ ] Understand Shamir secret sharing
- [ ] Design for minimal communication rounds
- [ ] Handle malicious parties (abort protocol)
- [ ] Use Arcium's MXE for computation

### For Confidential Transactions
- [ ] Use Pedersen commitments correctly
- [ ] Include range proofs for all outputs
- [ ] Verify balance equation (inputs = outputs)
- [ ] Handle fee payments

### For Compliance
- [ ] Implement association sets
- [ ] Support auditor keys
- [ ] Enable selective disclosure
- [ ] Pre-screen counterparties

---

## Sources

### Academic Papers
- [IACR ePrint Archive](https://eprint.iacr.org/)
- [arXiv Cryptography](https://arxiv.org/list/cs.CR/recent)
- [USENIX Security](https://www.usenix.org/conferences/byname/108)

### Technical Documentation
- [Solana Confidential Transfers](https://solana.com/docs/tokens/extensions/confidential-transfer)
- [Noir Documentation](https://noir-lang.org/docs/)
- [Arcium Docs](https://docs.arcium.com/developers/)
- [Inco Docs](https://docs.inco.org/svm/home)

### Tutorials & Guides
- [Understanding PLONK - Vitalik](https://vitalik.eth.limo/general/2019/09/22/plonk.html)
- [a16z TEE Primer](https://a16zcrypto.com/posts/article/trusted-execution-environments-tees-primer/)
- [Zero Knowledge Proofs - ZKProof.org](https://zkproof.org/)

# Cryptographic Primitives Implementation Guide

## Code Examples Based on Academic Research

This document provides practical implementations of the cryptographic primitives documented in `MATHEMATICAL_FOUNDATIONS.md`.

---

## 1. Pedersen Commitments

**Paper Reference**: Bulletproofs (Stanford)

```typescript
// src/crypto/pedersen.ts

import { Point, Scalar } from '@noble/secp256k1';

/**
 * Pedersen Commitment Scheme
 *
 * Mathematical basis:
 * C = v·G + r·H
 *
 * Where:
 * - G, H are generator points (H = hash_to_curve(G))
 * - v is the value to commit
 * - r is random blinding factor
 *
 * Properties:
 * - Perfectly hiding: commitment reveals nothing about v
 * - Computationally binding: can't open to different v
 * - Additively homomorphic: C(v1) + C(v2) = C(v1 + v2)
 */
export class PedersenCommitment {
  private G: Point;
  private H: Point;

  constructor() {
    // G is the standard generator
    this.G = Point.BASE;
    // H is derived from G using hash-to-curve
    // In practice: H = hash_to_curve("Pedersen_H")
    this.H = this.deriveH();
  }

  private deriveH(): Point {
    // Derive H such that nobody knows log_G(H)
    const hash = crypto.createHash('sha256')
      .update('PedersenGeneratorH')
      .digest();
    // Hash to curve (simplified)
    return Point.fromHex(hash);
  }

  /**
   * Commit to a value
   * @param value - The value to commit to
   * @param blinding - Random blinding factor (optional, generated if not provided)
   * @returns Commitment and opening information
   */
  commit(value: bigint, blinding?: bigint): {
    commitment: Point;
    opening: { value: bigint; blinding: bigint };
  } {
    const r = blinding ?? this.randomScalar();

    // C = v·G + r·H
    const vG = this.G.multiply(value);
    const rH = this.H.multiply(r);
    const commitment = vG.add(rH);

    return {
      commitment,
      opening: { value, blinding: r }
    };
  }

  /**
   * Verify a commitment opening
   */
  verify(
    commitment: Point,
    opening: { value: bigint; blinding: bigint }
  ): boolean {
    const expected = this.G.multiply(opening.value)
      .add(this.H.multiply(opening.blinding));
    return commitment.equals(expected);
  }

  /**
   * Add two commitments (homomorphic property)
   * C(v1, r1) + C(v2, r2) = C(v1 + v2, r1 + r2)
   */
  add(c1: Point, c2: Point): Point {
    return c1.add(c2);
  }

  /**
   * Subtract commitments
   */
  subtract(c1: Point, c2: Point): Point {
    return c1.add(c2.negate());
  }

  private randomScalar(): bigint {
    const bytes = crypto.randomBytes(32);
    return BigInt('0x' + bytes.toString('hex')) % Point.ORDER;
  }
}

// Usage example
async function pedersenExample() {
  const pedersen = new PedersenCommitment();

  // Commit to value 100
  const { commitment: c1, opening: o1 } = pedersen.commit(100n);

  // Commit to value 50
  const { commitment: c2, opening: o2 } = pedersen.commit(50n);

  // Homomorphic addition
  const cSum = pedersen.add(c1, c2);

  // Verify: cSum should commit to 150
  const sumOpening = {
    value: o1.value + o2.value,
    blinding: o1.blinding + o2.blinding
  };

  console.log('Sum commitment valid:', pedersen.verify(cSum, sumOpening));
}
```

---

## 2. Merkle Tree with Poseidon Hash

**Paper Reference**: Poseidon (USENIX Security 21)

```typescript
// src/crypto/merkle-poseidon.ts

/**
 * Merkle Tree using Poseidon Hash
 *
 * Why Poseidon?
 * - SHA-256: ~25,000 constraints in ZK circuit
 * - Poseidon: ~300 constraints in ZK circuit
 *
 * Poseidon is designed for prime fields, making it
 * extremely efficient for ZK proof systems.
 */

// Simulated Poseidon hash (in production, use actual implementation)
function poseidonHash(inputs: bigint[]): bigint {
  // This is a placeholder - use actual Poseidon implementation
  // e.g., from @aztec/foundation or circomlibjs
  const crypto = require('crypto');
  const data = inputs.map(i => i.toString(16).padStart(64, '0')).join('');
  const hash = crypto.createHash('sha256').update(data, 'hex').digest('hex');
  return BigInt('0x' + hash) % (2n ** 254n); // Field modulus
}

export class PoseidonMerkleTree {
  private leaves: bigint[] = [];
  private layers: bigint[][] = [];
  private depth: number;

  constructor(depth: number = 20) {
    this.depth = depth;
    this.initializeTree();
  }

  private initializeTree(): void {
    // Initialize with zero values
    let currentLayer: bigint[] = new Array(2 ** this.depth).fill(0n);
    this.layers = [currentLayer];

    for (let i = 0; i < this.depth; i++) {
      const nextLayer: bigint[] = [];
      for (let j = 0; j < currentLayer.length; j += 2) {
        nextLayer.push(poseidonHash([currentLayer[j], currentLayer[j + 1]]));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  /**
   * Insert a leaf and return its index
   */
  insert(leaf: bigint): number {
    const index = this.leaves.length;
    this.leaves.push(leaf);

    // Update tree
    this.layers[0][index] = leaf;
    let currentIndex = index;

    for (let i = 0; i < this.depth; i++) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
      const parentIndex = Math.floor(currentIndex / 2);

      const left = currentIndex % 2 === 0 ? this.layers[i][currentIndex] : this.layers[i][siblingIndex];
      const right = currentIndex % 2 === 0 ? this.layers[i][siblingIndex] : this.layers[i][currentIndex];

      this.layers[i + 1][parentIndex] = poseidonHash([left, right]);
      currentIndex = parentIndex;
    }

    return index;
  }

  /**
   * Get Merkle root
   */
  getRoot(): bigint {
    return this.layers[this.depth][0];
  }

  /**
   * Generate Merkle proof for a leaf
   */
  getProof(index: number): {
    path: bigint[];
    indices: number[];
  } {
    const path: bigint[] = [];
    const indices: number[] = [];
    let currentIndex = index;

    for (let i = 0; i < this.depth; i++) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
      path.push(this.layers[i][siblingIndex]);
      indices.push(currentIndex % 2);
      currentIndex = Math.floor(currentIndex / 2);
    }

    return { path, indices };
  }

  /**
   * Verify a Merkle proof
   */
  verifyProof(
    leaf: bigint,
    proof: { path: bigint[]; indices: number[] },
    root: bigint
  ): boolean {
    let current = leaf;

    for (let i = 0; i < proof.path.length; i++) {
      const left = proof.indices[i] === 0 ? current : proof.path[i];
      const right = proof.indices[i] === 0 ? proof.path[i] : current;
      current = poseidonHash([left, right]);
    }

    return current === root;
  }
}

// Usage for anonymous voting or mixing
async function merkleExample() {
  const tree = new PoseidonMerkleTree(10); // 2^10 = 1024 leaves

  // User generates commitment
  const secret = BigInt('0x' + crypto.randomBytes(32).toString('hex'));
  const nullifier = BigInt('0x' + crypto.randomBytes(32).toString('hex'));
  const commitment = poseidonHash([nullifier, secret]);

  // Insert commitment (deposit)
  const index = tree.insert(commitment);
  console.log('Deposited at index:', index);

  // Get proof for withdrawal
  const proof = tree.getProof(index);
  const root = tree.getRoot();

  // Verify proof
  console.log('Proof valid:', tree.verifyProof(commitment, proof, root));

  // For ZK proof: prove knowledge of (nullifier, secret) such that
  // commitment = hash(nullifier, secret) and commitment is in tree
}
```

---

## 3. Shamir Secret Sharing

**Paper Reference**: Shamir, "How to Share a Secret" (1979)

```typescript
// src/crypto/shamir.ts

/**
 * Shamir's Secret Sharing Scheme
 *
 * Mathematical basis:
 * - Secret S is constant term of polynomial f(x)
 * - f(x) = S + a₁x + a₂x² + ... + aₖ₋₁x^(k-1)
 * - Shares are points (i, f(i))
 * - Any k shares can reconstruct S via Lagrange interpolation
 * - k-1 shares reveal nothing about S
 */

// Prime field for arithmetic
const PRIME = 2n ** 256n - 2n ** 32n - 977n; // secp256k1 order

function mod(n: bigint, p: bigint = PRIME): bigint {
  return ((n % p) + p) % p;
}

function modInverse(a: bigint, p: bigint = PRIME): bigint {
  // Extended Euclidean algorithm
  let [old_r, r] = [a, p];
  let [old_s, s] = [1n, 0n];

  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }

  return mod(old_s, p);
}

export class ShamirSecretSharing {
  /**
   * Split a secret into n shares with threshold k
   * @param secret - The secret to split
   * @param n - Total number of shares
   * @param k - Threshold (minimum shares needed to reconstruct)
   */
  static split(secret: bigint, n: number, k: number): Array<[bigint, bigint]> {
    if (k > n) throw new Error('Threshold cannot exceed total shares');

    // Generate random polynomial coefficients
    const coefficients: bigint[] = [secret];
    for (let i = 1; i < k; i++) {
      const randomBytes = crypto.randomBytes(32);
      coefficients.push(mod(BigInt('0x' + randomBytes.toString('hex'))));
    }

    // Generate shares: (i, f(i))
    const shares: Array<[bigint, bigint]> = [];
    for (let i = 1; i <= n; i++) {
      const x = BigInt(i);
      let y = 0n;

      // Evaluate polynomial at x
      for (let j = 0; j < coefficients.length; j++) {
        y = mod(y + coefficients[j] * mod(x ** BigInt(j)));
      }

      shares.push([x, y]);
    }

    return shares;
  }

  /**
   * Reconstruct secret from k shares using Lagrange interpolation
   */
  static reconstruct(shares: Array<[bigint, bigint]>): bigint {
    let secret = 0n;

    for (let i = 0; i < shares.length; i++) {
      const [xi, yi] = shares[i];

      // Calculate Lagrange basis polynomial at x=0
      let numerator = 1n;
      let denominator = 1n;

      for (let j = 0; j < shares.length; j++) {
        if (i !== j) {
          const [xj, _] = shares[j];
          numerator = mod(numerator * (0n - xj));
          denominator = mod(denominator * (xi - xj));
        }
      }

      const lagrange = mod(numerator * modInverse(denominator));
      secret = mod(secret + yi * lagrange);
    }

    return secret;
  }

  /**
   * Add shares (for MPC addition)
   * [x] + [y] = [x + y]
   */
  static addShares(
    share1: [bigint, bigint],
    share2: [bigint, bigint]
  ): [bigint, bigint] {
    if (share1[0] !== share2[0]) {
      throw new Error('Shares must have same x coordinate');
    }
    return [share1[0], mod(share1[1] + share2[1])];
  }

  /**
   * Multiply share by constant
   * c · [x] = [c·x]
   */
  static multiplyByConstant(
    share: [bigint, bigint],
    constant: bigint
  ): [bigint, bigint] {
    return [share[0], mod(share[1] * constant)];
  }
}

// Usage for MPC
async function shamirExample() {
  // Secret: 1000 (e.g., order amount)
  const secret = 1000n;

  // Split into 5 shares, need 3 to reconstruct
  const shares = ShamirSecretSharing.split(secret, 5, 3);
  console.log('Shares:', shares);

  // Reconstruct with any 3 shares
  const reconstructed = ShamirSecretSharing.reconstruct(shares.slice(0, 3));
  console.log('Reconstructed:', reconstructed);
  console.log('Match:', reconstructed === secret);

  // MPC: Add two shared values without revealing them
  const secret1 = 100n;
  const secret2 = 200n;

  const shares1 = ShamirSecretSharing.split(secret1, 3, 2);
  const shares2 = ShamirSecretSharing.split(secret2, 3, 2);

  // Each party adds their shares locally
  const sumShares = shares1.map((s1, i) =>
    ShamirSecretSharing.addShares(s1, shares2[i])
  );

  // Reconstruct sum
  const sum = ShamirSecretSharing.reconstruct(sumShares.slice(0, 2));
  console.log('Sum (MPC):', sum); // Should be 300
}
```

---

## 4. Twisted ElGamal (Solana Confidential Transfers)

**Reference**: Solana SPL Token Documentation

```typescript
// src/crypto/twisted-elgamal.ts

import { Point, Scalar } from '@noble/secp256k1';

/**
 * Twisted ElGamal Encryption
 *
 * Used by Solana for confidential transfers.
 * Combines Pedersen commitment with ElGamal decryption handle.
 *
 * Ciphertext: (C, D) where
 * - C = m·G + r·H (Pedersen commitment)
 * - D = r·P (decryption handle, P is recipient's public key)
 *
 * Decryption:
 * - Compute r·G = D / sk (using secret key sk)
 * - Compute m·G = C - r·H
 * - Solve discrete log for small m (lookup table)
 */
export class TwistedElGamal {
  private G: Point;
  private H: Point;

  constructor() {
    this.G = Point.BASE;
    // H derived such that log_G(H) is unknown
    this.H = this.deriveH();
  }

  private deriveH(): Point {
    const hash = crypto.createHash('sha256')
      .update('TwistedElGamalH')
      .digest();
    // Proper hash-to-curve in production
    return Point.fromHex(hash);
  }

  /**
   * Generate keypair
   */
  generateKeyPair(): { secretKey: bigint; publicKey: Point } {
    const secretKey = BigInt('0x' + crypto.randomBytes(32).toString('hex')) % Point.ORDER;
    const publicKey = this.G.multiply(secretKey);
    return { secretKey, publicKey };
  }

  /**
   * Encrypt a value for a recipient
   */
  encrypt(
    value: bigint,
    recipientPubKey: Point
  ): {
    commitment: Point;    // C = v·G + r·H
    decryptionHandle: Point; // D = r·P
    randomness: bigint;
  } {
    const r = BigInt('0x' + crypto.randomBytes(32).toString('hex')) % Point.ORDER;

    // C = v·G + r·H (Pedersen commitment)
    const commitment = this.G.multiply(value).add(this.H.multiply(r));

    // D = r·P (decryption handle)
    const decryptionHandle = recipientPubKey.multiply(r);

    return { commitment, decryptionHandle, randomness: r };
  }

  /**
   * Decrypt a ciphertext (only works for small values due to discrete log)
   */
  decrypt(
    commitment: Point,
    decryptionHandle: Point,
    secretKey: bigint,
    maxValue: number = 2 ** 32
  ): bigint | null {
    // Compute r·H from decryption handle
    // D = r·P, so D·(1/sk) = r·G (if P = sk·G)
    // But we need r·H, so we use: sk·D = sk·r·P = r·sk·G = r·P'
    // This doesn't directly give us r·H...

    // Actually: D/sk would give r·G if we could divide
    // In EC: D * inverse(sk) mod order

    const skInverse = this.modInverse(secretKey, Point.ORDER);
    const rG = decryptionHandle.multiply(skInverse); // This gives r·G

    // We need to find r such that rG is known
    // Then compute m·G = C - r·H

    // For Solana's implementation, they use a different approach:
    // Store r·H directly or use lookup tables

    // Simplified: brute force for small values
    for (let v = 0n; v < BigInt(maxValue); v++) {
      const expected = this.G.multiply(v);
      // This is a placeholder - actual implementation needs the randomness
      // or a different approach
    }

    return null; // Placeholder
  }

  /**
   * Homomorphic addition of ciphertexts
   * (C1, D1) + (C2, D2) = (C1 + C2, D1 + D2)
   */
  add(
    cipher1: { commitment: Point; decryptionHandle: Point },
    cipher2: { commitment: Point; decryptionHandle: Point }
  ): { commitment: Point; decryptionHandle: Point } {
    return {
      commitment: cipher1.commitment.add(cipher2.commitment),
      decryptionHandle: cipher1.decryptionHandle.add(cipher2.decryptionHandle)
    };
  }

  /**
   * Subtract ciphertexts
   */
  subtract(
    cipher1: { commitment: Point; decryptionHandle: Point },
    cipher2: { commitment: Point; decryptionHandle: Point }
  ): { commitment: Point; decryptionHandle: Point } {
    return {
      commitment: cipher1.commitment.add(cipher2.commitment.negate()),
      decryptionHandle: cipher1.decryptionHandle.add(cipher2.decryptionHandle.negate())
    };
  }

  private modInverse(a: bigint, n: bigint): bigint {
    let [old_r, r] = [a, n];
    let [old_s, s] = [1n, 0n];

    while (r !== 0n) {
      const q = old_r / r;
      [old_r, r] = [r, old_r - q * r];
      [old_s, s] = [s, old_s - q * s];
    }

    return ((old_s % n) + n) % n;
  }
}
```

---

## 5. Range Proof (Simplified Bulletproof Concept)

**Paper Reference**: Bulletproofs (Stanford)

```typescript
// src/crypto/range-proof.ts

/**
 * Range Proof Concept
 *
 * Proves: committed value v is in range [0, 2^n)
 * Without revealing: the actual value v
 *
 * Bulletproof approach:
 * 1. Express v in binary: v = Σ vᵢ · 2ⁱ
 * 2. Commit to each bit
 * 3. Prove each vᵢ ∈ {0, 1}
 * 4. Use inner product argument for O(log n) proof size
 */

interface RangeProof {
  bitCommitments: Point[];
  innerProductProof: any; // Simplified
  challenge: bigint;
}

export class SimpleRangeProof {
  private pedersen: PedersenCommitment;
  private bits: number;

  constructor(bits: number = 64) {
    this.pedersen = new PedersenCommitment();
    this.bits = bits;
  }

  /**
   * Generate range proof for a committed value
   *
   * This is a simplified version - real Bulletproofs use
   * inner product arguments for logarithmic proof size
   */
  prove(value: bigint, blinding: bigint): RangeProof {
    if (value < 0n || value >= 2n ** BigInt(this.bits)) {
      throw new Error(`Value out of range [0, 2^${this.bits})`);
    }

    const bitCommitments: Point[] = [];
    const bitBlindings: bigint[] = [];

    // Commit to each bit
    for (let i = 0; i < this.bits; i++) {
      const bit = (value >> BigInt(i)) & 1n;
      const { commitment, opening } = this.pedersen.commit(bit);
      bitCommitments.push(commitment);
      bitBlindings.push(opening.blinding);
    }

    // In real Bulletproofs, we'd use inner product argument here
    // to compress the proof to O(log n) size

    return {
      bitCommitments,
      innerProductProof: null, // Placeholder
      challenge: this.generateChallenge(bitCommitments)
    };
  }

  /**
   * Verify range proof
   */
  verify(
    valueCommitment: Point,
    proof: RangeProof
  ): boolean {
    // 1. Verify bit commitments sum to value commitment
    let reconstructed = proof.bitCommitments[0];
    for (let i = 1; i < proof.bitCommitments.length; i++) {
      // Each bit commitment should be scaled by 2^i
      const scaled = proof.bitCommitments[i]; // Simplified
      reconstructed = reconstructed.add(scaled);
    }

    // 2. Verify each bit is in {0, 1}
    // In real Bulletproofs, this is done via inner product argument

    // 3. Check challenge is correctly computed
    const expectedChallenge = this.generateChallenge(proof.bitCommitments);

    return proof.challenge === expectedChallenge;
  }

  private generateChallenge(commitments: Point[]): bigint {
    const data = commitments.map(c => c.toHex()).join('');
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return BigInt('0x' + hash);
  }
}
```

---

## 6. Nullifier Scheme (Double-Spend Prevention)

**Used by**: Privacy Cash, Tornado Cash, Zcash

```typescript
// src/crypto/nullifier.ts

/**
 * Nullifier Scheme
 *
 * Purpose: Prevent double-spending while maintaining privacy
 *
 * How it works:
 * 1. User generates secret (nullifier_secret, randomness)
 * 2. Commitment = hash(nullifier_secret, randomness) - stored in Merkle tree
 * 3. Nullifier = hash(nullifier_secret) - revealed when spending
 * 4. ZK proof: "I know a secret that produces this nullifier and
 *              the corresponding commitment is in the tree"
 * 5. Contract checks nullifier hasn't been used before
 */

function poseidonHash(inputs: bigint[]): bigint {
  // Placeholder - use actual Poseidon
  const crypto = require('crypto');
  const data = inputs.map(i => i.toString(16).padStart(64, '0')).join('');
  return BigInt('0x' + crypto.createHash('sha256').update(data, 'hex').digest('hex'));
}

export class NullifierScheme {
  private usedNullifiers: Set<string> = new Set();

  /**
   * Generate deposit note (secret information)
   */
  generateNote(): {
    nullifierSecret: bigint;
    randomness: bigint;
    commitment: bigint;
    nullifier: bigint;
  } {
    const nullifierSecret = BigInt('0x' + crypto.randomBytes(31).toString('hex'));
    const randomness = BigInt('0x' + crypto.randomBytes(31).toString('hex'));

    // Commitment stored in Merkle tree (public)
    const commitment = poseidonHash([nullifierSecret, randomness]);

    // Nullifier revealed when spending (public, but unlinkable to commitment)
    const nullifier = poseidonHash([nullifierSecret]);

    return { nullifierSecret, randomness, commitment, nullifier };
  }

  /**
   * Check and mark nullifier as used
   */
  useNullifier(nullifier: bigint): boolean {
    const key = nullifier.toString();

    if (this.usedNullifiers.has(key)) {
      return false; // Double spend attempt!
    }

    this.usedNullifiers.add(key);
    return true;
  }

  /**
   * Verify withdrawal (simplified - would be ZK proof in practice)
   */
  verifyWithdrawal(
    nullifier: bigint,
    commitment: bigint,
    merkleRoot: bigint,
    merkleProof: { path: bigint[]; indices: number[] }
  ): boolean {
    // 1. Check nullifier not used
    if (this.usedNullifiers.has(nullifier.toString())) {
      return false;
    }

    // 2. Verify Merkle proof (commitment is in tree)
    // This would be done in ZK

    // 3. Verify nullifier corresponds to commitment
    // This is proven in ZK without revealing the secret

    return true;
  }
}

// Noir circuit for nullifier verification
const NOIR_NULLIFIER_CIRCUIT = `
// circuits/nullifier/src/main.nr

use dep::std::hash::poseidon;

fn main(
    // Private inputs
    nullifier_secret: Field,
    randomness: Field,
    merkle_path: [Field; 20],
    merkle_indices: [u1; 20],

    // Public inputs
    merkle_root: pub Field,
    nullifier: pub Field,
    recipient: pub Field  // Binds withdrawal to recipient
) {
    // 1. Verify nullifier is correctly derived
    let computed_nullifier = poseidon::bn254::hash_1([nullifier_secret]);
    assert(computed_nullifier == nullifier);

    // 2. Compute commitment
    let commitment = poseidon::bn254::hash_2([nullifier_secret, randomness]);

    // 3. Verify Merkle membership
    let mut current = commitment;
    for i in 0..20 {
        let (left, right) = if merkle_indices[i] == 0 {
            (current, merkle_path[i])
        } else {
            (merkle_path[i], current)
        };
        current = poseidon::bn254::hash_2([left, right]);
    }
    assert(current == merkle_root);

    // 4. Bind to recipient (prevent front-running)
    // recipient is just a public input that gets included in the proof
}
`;
```

---

## 7. Privacy Pools (Compliant Mixing)

**Paper Reference**: Buterin et al. (2023)

```typescript
// src/crypto/privacy-pools.ts

/**
 * Privacy Pools - Compliant Mixing
 *
 * Key insight: Prove membership in a "clean" subset without
 * revealing which specific transaction is yours.
 *
 * Association Set: Set of transactions user claims association with
 * - Can exclude known bad actors
 * - Enables compliance while preserving privacy
 */

export class PrivacyPools {
  private allDeposits: bigint[] = [];
  private cleanDeposits: Set<string> = new Set();
  private sanctionedAddresses: Set<string> = new Set();

  /**
   * Add deposit to pool
   */
  addDeposit(commitment: bigint, depositorAddress: string): void {
    this.allDeposits.push(commitment);

    // Mark as clean if depositor not sanctioned
    if (!this.sanctionedAddresses.has(depositorAddress)) {
      this.cleanDeposits.add(commitment.toString());
    }
  }

  /**
   * Generate association set proof
   *
   * Proves: "My deposit is in the set of clean deposits"
   * Without revealing: Which specific deposit is mine
   */
  generateAssociationProof(
    myCommitment: bigint,
    myMerkleProof: { path: bigint[]; indices: number[] }
  ): {
    associationSetRoot: bigint;
    membershipProof: any;
    excludedCount: number;
  } {
    // Build Merkle tree of clean deposits only
    const cleanArray = Array.from(this.cleanDeposits).map(s => BigInt(s));

    // Generate proof that myCommitment is in clean tree
    // This is a ZK proof

    return {
      associationSetRoot: this.computeMerkleRoot(cleanArray),
      membershipProof: {}, // ZK proof
      excludedCount: this.allDeposits.length - cleanArray.length
    };
  }

  /**
   * Verify association proof
   */
  verifyAssociationProof(
    nullifier: bigint,
    associationSetRoot: bigint,
    membershipProof: any
  ): {
    valid: boolean;
    trustScore: number; // Higher = more trusted association set
  } {
    // Verify ZK proof of membership in association set

    // Trust score based on association set size and exclusions
    const trustScore = 100; // Placeholder

    return { valid: true, trustScore };
  }

  private computeMerkleRoot(leaves: bigint[]): bigint {
    // Compute Merkle root of leaves
    return 0n; // Placeholder
  }
}

// Noir circuit for Privacy Pools
const NOIR_PRIVACY_POOLS_CIRCUIT = `
// circuits/privacy-pools/src/main.nr

use dep::std::hash::poseidon;

fn main(
    // Private inputs
    nullifier_secret: Field,
    randomness: Field,

    // Merkle proof for ALL deposits tree
    all_deposits_path: [Field; 20],
    all_deposits_indices: [u1; 20],

    // Merkle proof for CLEAN deposits subtree
    clean_deposits_path: [Field; 20],
    clean_deposits_indices: [u1; 20],

    // Public inputs
    all_deposits_root: pub Field,
    clean_deposits_root: pub Field,  // Association set
    nullifier: pub Field
) {
    // Compute commitment
    let commitment = poseidon::bn254::hash_2([nullifier_secret, randomness]);

    // Verify membership in ALL deposits
    let all_root = compute_merkle_root(
        commitment,
        all_deposits_path,
        all_deposits_indices
    );
    assert(all_root == all_deposits_root);

    // Verify membership in CLEAN deposits (association set)
    let clean_root = compute_merkle_root(
        commitment,
        clean_deposits_path,
        clean_deposits_indices
    );
    assert(clean_root == clean_deposits_root);

    // Verify nullifier
    let computed_nullifier = poseidon::bn254::hash_1([nullifier_secret]);
    assert(computed_nullifier == nullifier);
}

fn compute_merkle_root(
    leaf: Field,
    path: [Field; 20],
    indices: [u1; 20]
) -> Field {
    let mut current = leaf;
    for i in 0..20 {
        let (left, right) = if indices[i] == 0 {
            (current, path[i])
        } else {
            (path[i], current)
        };
        current = poseidon::bn254::hash_2([left, right]);
    }
    current
}
`;
```

---

## Quick Reference: Crypto Primitives by Bounty

| Bounty | Primary Primitives | Implementation Files |
|--------|-------------------|---------------------|
| **Privacy Cash** | Pedersen, Merkle, Nullifiers | `pedersen.ts`, `merkle-poseidon.ts`, `nullifier.ts` |
| **Arcium** | Shamir, MPC protocols | `shamir.ts` |
| **Aztec/Noir** | PLONK, Poseidon, R1CS | Noir circuits |
| **Inco** | TEE attestation, ECIES | Platform-specific |
| **Helius** | All above + Solana specifics | - |
| **Starpay** | ZK commitments, range proofs | `range-proof.ts` |
| **Range** | Privacy Pools, ABE | `privacy-pools.ts` |

---

## Next Steps

1. Install dependencies:
   ```bash
   npm install @noble/secp256k1 @noble/hashes
   ```

2. For Noir circuits:
   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   noirup
   ```

3. Test implementations:
   ```bash
   npm test
   ```

/**
 * Noir ZK Proof Integration
 * Build ZK applications using Noir language
 * https://noir-lang.org
 *
 * SECURITY: All path inputs are validated and sanitized to prevent command injection
 */

import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface NoirCircuit {
  name: string;
  path: string;
  publicInputs: string[];
  privateInputs: string[];
}

export interface ProofData {
  proof: Uint8Array;
  publicInputs: any[];
  verificationKey: Uint8Array;
}

// Security: Allowed base directories for circuit operations
const ALLOWED_BASE_DIRS = [
  process.cwd(),
  path.join(process.cwd(), 'circuits'),
  path.join(process.cwd(), 'noir'),
  path.join(process.cwd(), 'zk')
];

/**
 * Validate and sanitize a circuit path to prevent path traversal and command injection
 * @throws Error if path is invalid or outside allowed directories
 */
function validateCircuitPath(circuitPath: string): string {
  // Check for null bytes (null byte injection prevention)
  if (circuitPath.includes('\x00') || circuitPath.includes('\0')) {
    throw new Error('Null bytes not allowed in path');
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(circuitPath);

  // Check for path traversal attempts
  if (circuitPath.includes('..') || circuitPath.includes('~')) {
    throw new Error('Path traversal not allowed');
  }

  // Check for shell metacharacters (command injection prevention)
  const dangerousChars = /[;&|`$(){}[\]<>!#*?\\'"]/;
  if (dangerousChars.test(circuitPath)) {
    throw new Error('Invalid characters in path');
  }

  // Verify path is within allowed directories
  const isAllowed = ALLOWED_BASE_DIRS.some(baseDir =>
    resolvedPath.startsWith(path.resolve(baseDir))
  );

  if (!isAllowed) {
    throw new Error(`Path must be within allowed directories: ${ALLOWED_BASE_DIRS.join(', ')}`);
  }

  // Verify directory exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Circuit directory does not exist: ${resolvedPath}`);
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${resolvedPath}`);
  }

  return resolvedPath;
}

/**
 * Validate project name for safe filesystem operations
 */
function validateProjectName(name: string): string {
  // Only allow alphanumeric, underscore, and hyphen
  const safeNamePattern = /^[a-zA-Z0-9_-]+$/;
  if (!safeNamePattern.test(name)) {
    throw new Error('Project name must contain only alphanumeric characters, underscores, and hyphens');
  }
  if (name.length > 64) {
    throw new Error('Project name must be 64 characters or less');
  }
  return name;
}

export class NoirVerifier {
  private connection: Connection;
  private verifierProgramId: PublicKey;

  constructor(connection: Connection, verifierProgramId: PublicKey) {
    this.connection = connection;
    this.verifierProgramId = verifierProgramId;
  }

  /**
   * Compile a Noir circuit
   * Requires `nargo` CLI to be installed
   * SECURITY: Uses spawnSync with array arguments to prevent command injection
   */
  async compileCircuit(circuitPath: string): Promise<{
    bytecode: Uint8Array;
    abi: any;
  }> {
    // Validate and sanitize path
    const safePath = validateCircuitPath(circuitPath);

    // Use spawnSync with array arguments (safe from injection)
    const result = spawnSync('nargo', ['compile'], {
      cwd: safePath,
      stdio: 'inherit',
      shell: false // Explicitly disable shell
    });

    if (result.status !== 0) {
      throw new Error(`Failed to compile circuit: ${result.error?.message || 'Unknown error'}`);
    }

    // Read compiled artifacts using validated path
    const artifactPath = path.join(safePath, 'target', 'main.json');
    if (!fs.existsSync(artifactPath)) {
      throw new Error('Compiled artifact not found');
    }

    const bytecode = fs.readFileSync(artifactPath);

    return {
      bytecode: new Uint8Array(bytecode),
      abi: JSON.parse(bytecode.toString()).abi
    };
  }

  /**
   * Generate a ZK proof for given inputs
   * SECURITY: Uses spawnSync with array arguments to prevent command injection
   */
  async generateProof(
    circuitPath: string,
    inputs: Record<string, any>
  ): Promise<ProofData> {
    // Validate and sanitize path
    const safePath = validateCircuitPath(circuitPath);

    // Sanitize input keys (prevent injection via TOML)
    const safeKeyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    for (const key of Object.keys(inputs)) {
      if (!safeKeyPattern.test(key)) {
        throw new Error(`Invalid input key: ${key}`);
      }
    }

    // Write inputs to Prover.toml
    const proverToml = Object.entries(inputs)
      .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
      .join('\n');

    const proverPath = path.join(safePath, 'Prover.toml');
    fs.writeFileSync(proverPath, proverToml);

    // Generate proof using spawnSync (safe from injection)
    const result = spawnSync('nargo', ['prove'], {
      cwd: safePath,
      stdio: 'inherit',
      shell: false
    });

    if (result.status !== 0) {
      throw new Error(`Failed to generate proof: ${result.error?.message || 'Unknown error'}`);
    }

    // Read proof and verification key using validated paths
    const proofPath = path.join(safePath, 'proofs', 'main.proof');
    const vkPath = path.join(safePath, 'target', 'vk');

    if (!fs.existsSync(proofPath) || !fs.existsSync(vkPath)) {
      throw new Error('Proof or verification key not found');
    }

    const proofData = fs.readFileSync(proofPath);
    const vkData = fs.readFileSync(vkPath);

    return {
      proof: new Uint8Array(proofData),
      publicInputs: [],
      verificationKey: new Uint8Array(vkData)
    };
  }

  /**
   * Verify a proof locally (off-chain)
   * SECURITY: Uses spawnSync with array arguments to prevent command injection
   */
  async verifyProofLocal(circuitPath: string): Promise<boolean> {
    // Validate and sanitize path
    const safePath = validateCircuitPath(circuitPath);

    const result = spawnSync('nargo', ['verify'], {
      cwd: safePath,
      stdio: 'inherit',
      shell: false
    });

    return result.status === 0;
  }

  /**
   * Verify proof on-chain via Solana program
   */
  async verifyProofOnChain(proof: ProofData): Promise<string> {
    const instruction = new TransactionInstruction({
      programId: this.verifierProgramId,
      keys: [],
      data: Buffer.concat([
        Buffer.from([0]), // Verify instruction
        Buffer.from(proof.proof),
        Buffer.from(JSON.stringify(proof.publicInputs))
      ])
    });

    const transaction = new Transaction().add(instruction);

    // Note: Requires signing and sending
    return 'tx_signature_placeholder';
  }

  /**
   * Create a new Noir project for the hackathon
   * SECURITY: Uses spawnSync with array arguments and validates project name
   */
  async initNoirProject(name: string, template: 'basic' | 'merkle' | 'ecdsa' = 'basic'): Promise<void> {
    // Validate project name to prevent injection
    const safeName = validateProjectName(name);

    // Use spawnSync with array arguments (safe from injection)
    const result = spawnSync('nargo', ['new', safeName], {
      stdio: 'inherit',
      shell: false
    });

    if (result.status !== 0) {
      throw new Error(`Failed to create Noir project: ${result.error?.message || 'Unknown error'}`);
    }

    // Add template-specific code
    const templates: Record<string, string> = {
      basic: `
// Basic ZK proof circuit
fn main(x: Field, y: pub Field) {
    assert(x * x == y);
}
`,
      merkle: `
// Merkle proof verification
use dep::std::hash::pedersen_hash;

fn main(
    leaf: pub Field,
    root: pub Field,
    path: [Field; 10],
    indices: [u1; 10]
) {
    let mut current = leaf;
    for i in 0..10 {
        let (left, right) = if indices[i] == 0 {
            (current, path[i])
        } else {
            (path[i], current)
        };
        current = pedersen_hash([left, right]);
    }
    assert(current == root);
}
`,
      ecdsa: `
// ECDSA signature verification
use dep::std::ecdsa_secp256k1::verify_signature;

fn main(
    public_key_x: [u8; 32],
    public_key_y: [u8; 32],
    signature: [u8; 64],
    message_hash: pub [u8; 32]
) {
    let valid = verify_signature(public_key_x, public_key_y, signature, message_hash);
    assert(valid);
}
`
    };

    // Use path.join for safe file path construction
    const mainNrPath = path.join(safeName, 'src', 'main.nr');
    fs.writeFileSync(mainNrPath, templates[template]);
  }
}

export default NoirVerifier;

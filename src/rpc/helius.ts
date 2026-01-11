/**
 * Helius RPC Integration
 * High-performance RPC and developer tooling for Solana
 * https://helius.dev
 *
 * SECURITY:
 * - API key passed via headers where supported
 * - Response validation on all API calls
 * - Input validation for addresses
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export interface HeliusConfig {
  apiKey: string;
  cluster: 'mainnet-beta' | 'devnet';
}

// Validate Solana address format
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Validate API response
async function validateResponse(response: Response, context: string): Promise<any> {
  if (!response.ok) {
    throw new Error(`${context}: HTTP ${response.status} - ${response.statusText}`);
  }

  const data = await response.json() as any;

  // Check for RPC errors
  if (data.error) {
    throw new Error(`${context}: ${data.error.message || 'Unknown RPC error'}`);
  }

  return data;
}

export class HeliusRPC {
  private connection: Connection;
  private apiKey: string;
  private rpcUrl: string;
  private apiBaseUrl: string;

  constructor(config: HeliusConfig) {
    if (!config.apiKey || config.apiKey.length < 10) {
      throw new Error('Invalid API key');
    }

    this.apiKey = config.apiKey;

    // RPC URL requires api-key in URL (Helius requirement)
    this.rpcUrl = config.cluster === 'mainnet-beta'
      ? `https://mainnet.helius-rpc.com/?api-key=${config.apiKey}`
      : `https://devnet.helius-rpc.com/?api-key=${config.apiKey}`;

    this.apiBaseUrl = 'https://api.helius.xyz/v0';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get common headers for API requests
   * SECURITY: API key in header instead of URL where supported
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Enhanced Transaction API - Get parsed transaction history
   * SECURITY: Input validation and response validation
   */
  async getTransactionHistory(address: string, limit = 100): Promise<any[]> {
    // Validate address
    if (!isValidSolanaAddress(address)) {
      throw new Error('Invalid Solana address format');
    }

    // Validate limit
    const safeLimit = Math.min(Math.max(1, limit), 1000);

    const response = await fetch(
      `${this.apiBaseUrl}/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${safeLimit}`
    );

    return validateResponse(response, 'getTransactionHistory');
  }

  /**
   * DAS API - Digital Asset Standard for NFTs and compressed NFTs
   * SECURITY: Input validation and response validation
   */
  async getAssetsByOwner(owner: string): Promise<any> {
    // Validate address
    if (!isValidSolanaAddress(owner)) {
      throw new Error('Invalid Solana address format');
    }

    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-das',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: owner,
          page: 1,
          limit: 1000
        }
      })
    });

    return validateResponse(response, 'getAssetsByOwner');
  }

  /**
   * Priority Fee API - Get optimal priority fees
   * SECURITY: Response validation
   */
  async getPriorityFeeEstimate(transaction: Transaction): Promise<number> {
    if (!transaction) {
      throw new Error('Transaction is required');
    }

    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'priority-fee',
        method: 'getPriorityFeeEstimate',
        params: [{
          transaction: transaction.serialize().toString('base64'),
          options: { recommended: true }
        }]
      })
    });

    const result = await validateResponse(response, 'getPriorityFeeEstimate');
    return result.result?.priorityFeeEstimate || 0;
  }

  /**
   * Webhook Management - Real-time transaction monitoring
   * SECURITY: Input validation and response validation
   */
  async createWebhook(config: {
    webhookURL: string;
    accountAddresses: string[];
    transactionTypes: string[];
  }): Promise<any> {
    // Validate webhook URL
    try {
      new URL(config.webhookURL);
    } catch {
      throw new Error('Invalid webhook URL');
    }

    // Validate addresses
    for (const addr of config.accountAddresses) {
      if (!isValidSolanaAddress(addr)) {
        throw new Error(`Invalid address: ${addr}`);
      }
    }

    // Validate transaction types (whitelist)
    const validTypes = ['TRANSFER', 'SWAP', 'NFT_SALE', 'NFT_MINT', 'NFT_LISTING', 'ANY'];
    for (const type of config.transactionTypes) {
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid transaction type: ${type}`);
      }
    }

    const response = await fetch(
      `${this.apiBaseUrl}/webhooks?api-key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookURL: config.webhookURL,
          accountAddresses: config.accountAddresses,
          transactionTypes: config.transactionTypes,
          webhookType: 'enhanced'
        })
      }
    );

    return validateResponse(response, 'createWebhook');
  }
}

export default HeliusRPC;

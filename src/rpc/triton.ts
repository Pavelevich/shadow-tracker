/**
 * Triton RPC Integration
 * High-performance Solana RPC infrastructure
 * Special hackathon access for participants
 */

import { Connection, PublicKey, Commitment } from '@solana/web3.js';

export interface TritonConfig {
  endpoint: string;
  apiKey?: string;
  commitment?: Commitment;
}

export class TritonRPC {
  private connection: Connection;
  private endpoint: string;
  private apiKey?: string;

  constructor(config: TritonConfig) {
    this.endpoint = config.apiKey
      ? `${config.endpoint}?api-key=${config.apiKey}`
      : config.endpoint;
    this.apiKey = config.apiKey;

    this.connection = new Connection(this.endpoint, {
      commitment: config.commitment || 'confirmed',
      wsEndpoint: this.endpoint.replace('https://', 'wss://').replace('http://', 'ws://')
    });
  }

  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get account info with optimized caching
   */
  async getAccountInfo(pubkey: PublicKey): Promise<any> {
    return this.connection.getAccountInfo(pubkey);
  }

  /**
   * Subscribe to account changes (real-time)
   */
  subscribeToAccount(pubkey: PublicKey, callback: (info: any) => void): number {
    return this.connection.onAccountChange(pubkey, callback);
  }

  /**
   * Get multiple accounts in batch (optimized)
   */
  async getMultipleAccounts(pubkeys: PublicKey[]): Promise<any[]> {
    return this.connection.getMultipleAccountsInfo(pubkeys);
  }

  /**
   * Send transaction with retry logic
   */
  async sendTransactionWithRetry(
    transaction: any,
    signers: any[],
    maxRetries = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const signature = await this.connection.sendTransaction(transaction, signers, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });

        await this.connection.confirmTransaction(signature, 'confirmed');
        return signature;
      } catch (error) {
        lastError = error as Error;
        console.log(`Retry ${i + 1}/${maxRetries} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw lastError;
  }

  /**
   * Health check for RPC endpoint
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now();
    try {
      await this.connection.getSlot();
      return { healthy: true, latency: Date.now() - start };
    } catch {
      return { healthy: false, latency: -1 };
    }
  }
}

export default TritonRPC;

/**
 * Crypto Surveillance Tools
 * Monitor and analyze blockchain activity for compliance and security
 */

import { Connection, PublicKey } from '@solana/web3.js';

export interface SurveillanceConfig {
  connection: Connection;
  heliusApiKey?: string;
  alertWebhook?: string;
}

export interface WalletRiskProfile {
  address: string;
  riskScore: number; // 0-100
  flags: string[];
  transactionVolume: {
    last24h: bigint;
    last7d: bigint;
    last30d: bigint;
  };
  connections: {
    directContacts: number;
    suspiciousContacts: number;
  };
  lastActivity: Date;
}

export interface TransactionAlert {
  signature: string;
  type: 'high_value' | 'suspicious_pattern' | 'sanctioned_address' | 'mixer_interaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  timestamp: Date;
}

export class CryptoSurveillance {
  private config: SurveillanceConfig;
  private watchlist: Set<string> = new Set();
  private alertCallbacks: ((alert: TransactionAlert) => void)[] = [];

  constructor(config: SurveillanceConfig) {
    this.config = config;
  }

  // ==========================================
  // WALLET MONITORING
  // ==========================================

  /**
   * Add wallet addresses to watchlist
   */
  addToWatchlist(addresses: string[]): void {
    addresses.forEach(addr => this.watchlist.add(addr));
    console.log(`Added ${addresses.length} addresses to watchlist. Total: ${this.watchlist.size}`);
  }

  /**
   * Remove wallet addresses from watchlist
   */
  removeFromWatchlist(addresses: string[]): void {
    addresses.forEach(addr => this.watchlist.delete(addr));
  }

  /**
   * Get risk profile for a wallet
   */
  async getWalletRiskProfile(address: string): Promise<WalletRiskProfile> {
    const pubkey = new PublicKey(address);

    // Fetch transaction history
    const signatures = await this.config.connection.getSignaturesForAddress(pubkey, {
      limit: 1000
    });

    // Analyze patterns
    const flags: string[] = [];
    let suspiciousCount = 0;

    // Check for suspicious patterns
    if (signatures.length > 100 && this.checkRapidTransactions(signatures)) {
      flags.push('rapid_transactions');
    }

    // Calculate volumes (simplified)
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const last24h = signatures.filter(s => (s.blockTime || 0) * 1000 > now - day).length;
    const last7d = signatures.filter(s => (s.blockTime || 0) * 1000 > now - 7 * day).length;
    const last30d = signatures.filter(s => (s.blockTime || 0) * 1000 > now - 30 * day).length;

    // Calculate risk score
    let riskScore = 0;
    if (flags.includes('rapid_transactions')) riskScore += 20;
    if (flags.includes('mixer_interaction')) riskScore += 40;
    if (flags.includes('sanctioned_connection')) riskScore += 50;

    return {
      address,
      riskScore: Math.min(100, riskScore),
      flags,
      transactionVolume: {
        last24h: BigInt(last24h),
        last7d: BigInt(last7d),
        last30d: BigInt(last30d)
      },
      connections: {
        directContacts: 0, // Would need graph analysis
        suspiciousContacts: suspiciousCount
      },
      lastActivity: signatures[0] ? new Date((signatures[0].blockTime || 0) * 1000) : new Date(0)
    };
  }

  // ==========================================
  // TRANSACTION MONITORING
  // ==========================================

  /**
   * Start real-time transaction monitoring
   */
  startMonitoring(): number {
    const subscriptionId = this.config.connection.onLogs(
      'all',
      async (logs) => {
        await this.analyzeTransaction(logs.signature);
      },
      'confirmed'
    );

    console.log('Started real-time transaction monitoring');
    return subscriptionId;
  }

  /**
   * Stop transaction monitoring
   */
  async stopMonitoring(subscriptionId: number): Promise<void> {
    await this.config.connection.removeOnLogsListener(subscriptionId);
    console.log('Stopped transaction monitoring');
  }

  /**
   * Analyze a specific transaction for suspicious activity
   */
  async analyzeTransaction(signature: string): Promise<TransactionAlert | null> {
    const tx = await this.config.connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) return null;

    const alerts: TransactionAlert[] = [];

    // Check for watchlist interactions
    const accounts = tx.transaction.message.accountKeys.map(k =>
      typeof k === 'string' ? k : k.pubkey.toBase58()
    );

    for (const account of accounts) {
      if (this.watchlist.has(account)) {
        alerts.push({
          signature,
          type: 'sanctioned_address',
          severity: 'critical',
          details: `Transaction involves watchlisted address: ${account}`,
          timestamp: new Date()
        });
      }
    }

    // Check for high-value transfers
    if (tx.meta?.postBalances && tx.meta?.preBalances) {
      const maxChange = Math.max(
        ...tx.meta.preBalances.map((pre, i) =>
          Math.abs(pre - (tx.meta?.postBalances?.[i] || 0))
        )
      );

      if (maxChange > 1000 * 1e9) { // > 1000 SOL
        alerts.push({
          signature,
          type: 'high_value',
          severity: 'high',
          details: `High value transaction: ${maxChange / 1e9} SOL`,
          timestamp: new Date()
        });
      }
    }

    // Notify callbacks
    for (const alert of alerts) {
      this.alertCallbacks.forEach(cb => cb(alert));
    }

    return alerts[0] || null;
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: TransactionAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  // ==========================================
  // COMPLIANCE TOOLS
  // ==========================================

  /**
   * Generate compliance report for a wallet
   */
  async generateComplianceReport(address: string): Promise<{
    wallet: string;
    riskAssessment: WalletRiskProfile;
    recommendations: string[];
    generatedAt: Date;
  }> {
    const riskProfile = await this.getWalletRiskProfile(address);

    const recommendations: string[] = [];

    if (riskProfile.riskScore > 70) {
      recommendations.push('BLOCK: High risk wallet, recommend blocking');
    } else if (riskProfile.riskScore > 40) {
      recommendations.push('REVIEW: Manual review recommended');
      recommendations.push('MONITOR: Add to enhanced monitoring');
    } else {
      recommendations.push('ALLOW: Low risk, normal processing');
    }

    if (riskProfile.flags.includes('mixer_interaction')) {
      recommendations.push('FLAG: Mixer interaction detected, enhanced KYC required');
    }

    return {
      wallet: address,
      riskAssessment: riskProfile,
      recommendations,
      generatedAt: new Date()
    };
  }

  /**
   * Check if wallet is safe to interact with
   */
  async isWalletSafe(address: string, threshold = 50): Promise<boolean> {
    const profile = await this.getWalletRiskProfile(address);
    return profile.riskScore < threshold;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private checkRapidTransactions(signatures: any[]): boolean {
    // Check for rapid-fire transactions (potential bot/mixer activity)
    if (signatures.length < 10) return false;

    let rapidCount = 0;
    for (let i = 1; i < Math.min(signatures.length, 100); i++) {
      const timeDiff = Math.abs(
        (signatures[i - 1].blockTime || 0) - (signatures[i].blockTime || 0)
      );
      if (timeDiff < 5) { // Less than 5 seconds apart
        rapidCount++;
      }
    }

    return rapidCount > 10; // More than 10 rapid transactions
  }
}

export default CryptoSurveillance;

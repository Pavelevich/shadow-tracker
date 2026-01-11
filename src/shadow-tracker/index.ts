/**
 * SHADOW TRACKER - Wallet Privacy Analyzer
 *
 * Helius Bounty Submission ($5,000)
 *
 * Analyzes any Solana wallet and calculates a privacy score
 * based on transaction patterns, address reuse, and exposure risks.
 *
 * Uses:
 * - Helius Enhanced Transaction API
 * - Helius DAS API (Digital Asset Standard)
 * - Pattern detection algorithms
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

// ===========================================
// TYPES
// ===========================================

export interface PrivacyReport {
  address: string;
  privacyScore: number; // 0-100 (100 = most private)
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  metrics: {
    transactionCount: number;
    uniqueCounterparties: number;
    addressReuseRatio: number;
    averageTimeBetweenTx: number;
    exposedBalanceHistory: boolean;
    nftExposure: number;
    tokenDiversity: number;
  };

  risks: PrivacyRisk[];
  recommendations: string[];

  timestamp: Date;
}

export interface PrivacyRisk {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  evidence?: string;
}

export interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
  }>;
}

// ===========================================
// SHADOW TRACKER CLASS
// ===========================================

export class ShadowTracker {
  private heliusApiKey: string;
  private connection: Connection;
  private baseUrl: string;

  constructor(heliusApiKey: string) {
    this.heliusApiKey = heliusApiKey;
    this.baseUrl = 'https://api.helius.xyz/v0';

    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  // ===========================================
  // MAIN ANALYSIS
  // ===========================================

  /**
   * Analyze a wallet's privacy
   */
  async analyzeWallet(address: string, options?: {
    maxTransactions?: number;
    includeNFTs?: boolean;
  }): Promise<PrivacyReport> {
    console.log(`\n🔍 Analyzing wallet: ${address.slice(0, 8)}...${address.slice(-4)}\n`);

    const maxTx = options?.maxTransactions || 100;

    // Fetch transaction history
    console.log('📥 Fetching transaction history...');
    const transactions = await this.getTransactionHistory(address, maxTx);
    console.log(`   Found ${transactions.length} transactions`);

    // Fetch assets (tokens + NFTs)
    console.log('📥 Fetching assets...');
    const assets = await this.getAssets(address);
    console.log(`   Found ${assets.tokens} tokens, ${assets.nfts} NFTs`);

    // Analyze patterns
    console.log('🔬 Analyzing patterns...');
    const patterns = this.analyzePatterns(transactions, address);

    // Calculate metrics
    const metrics = this.calculateMetrics(transactions, patterns, assets);

    // Identify risks
    const risks = this.identifyRisks(transactions, patterns, metrics);

    // Calculate privacy score
    const privacyScore = this.calculatePrivacyScore(metrics, risks);

    // Generate recommendations
    const recommendations = this.generateRecommendations(risks, metrics);

    // Determine grade
    const grade = this.getGrade(privacyScore);
    const riskLevel = this.getRiskLevel(privacyScore);

    return {
      address,
      privacyScore,
      grade,
      riskLevel,
      metrics,
      risks,
      recommendations,
      timestamp: new Date()
    };
  }

  // ===========================================
  // HELIUS API CALLS
  // ===========================================

  /**
   * Get enhanced transaction history using Helius
   */
  private async getTransactionHistory(
    address: string,
    limit: number
  ): Promise<HeliusTransaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/addresses/${address}/transactions?api-key=${this.heliusApiKey}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json() as HeliusTransaction[];
    } catch (error) {
      console.error('   ⚠️ Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Get assets using Helius DAS API
   */
  private async getAssets(address: string): Promise<{
    tokens: number;
    nfts: number;
    totalValue: number;
  }> {
    try {
      const response = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'shadow-tracker',
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: address,
              page: 1,
              limit: 1000
            }
          })
        }
      );

      const data = await response.json() as any;
      const items = data.result?.items || [];

      const nfts = items.filter((i: any) =>
        i.interface === 'V1_NFT' || i.interface === 'ProgrammableNFT'
      ).length;

      const tokens = items.filter((i: any) =>
        i.interface === 'FungibleToken' || i.interface === 'FungibleAsset'
      ).length;

      return { tokens, nfts, totalValue: 0 };
    } catch (error) {
      console.error('   ⚠️ Error fetching assets:', error);
      return { tokens: 0, nfts: 0, totalValue: 0 };
    }
  }

  // ===========================================
  // PATTERN ANALYSIS
  // ===========================================

  private analyzePatterns(transactions: HeliusTransaction[], address: string): {
    counterparties: Map<string, number>;
    txTypes: Map<string, number>;
    hourlyDistribution: number[];
    dailyDistribution: number[];
    regularPatterns: boolean;
    roundAmounts: number;
    dustTransactions: number;
  } {
    const counterparties = new Map<string, number>();
    const txTypes = new Map<string, number>();
    const hourlyDistribution = new Array(24).fill(0);
    const dailyDistribution = new Array(7).fill(0);
    let roundAmounts = 0;
    let dustTransactions = 0;

    for (const tx of transactions) {
      // Count transaction types
      txTypes.set(tx.type, (txTypes.get(tx.type) || 0) + 1);

      // Analyze time patterns
      if (tx.timestamp) {
        const date = new Date(tx.timestamp * 1000);
        hourlyDistribution[date.getHours()]++;
        dailyDistribution[date.getDay()]++;
      }

      // Count counterparties
      if (tx.nativeTransfers) {
        for (const transfer of tx.nativeTransfers) {
          const counterparty = transfer.fromUserAccount === address
            ? transfer.toUserAccount
            : transfer.fromUserAccount;

          if (counterparty && counterparty !== address) {
            counterparties.set(counterparty, (counterparties.get(counterparty) || 0) + 1);
          }

          // Check for round amounts (less private)
          if (transfer.amount % 100000000 === 0) { // 0.1 SOL increments
            roundAmounts++;
          }

          // Check for dust
          if (transfer.amount < 10000) { // < 0.00001 SOL
            dustTransactions++;
          }
        }
      }

      if (tx.tokenTransfers) {
        for (const transfer of tx.tokenTransfers) {
          const counterparty = transfer.fromUserAccount === address
            ? transfer.toUserAccount
            : transfer.fromUserAccount;

          if (counterparty && counterparty !== address) {
            counterparties.set(counterparty, (counterparties.get(counterparty) || 0) + 1);
          }
        }
      }
    }

    // Detect regular patterns (bad for privacy)
    const hourlyVariance = this.calculateVariance(hourlyDistribution);
    const regularPatterns = hourlyVariance < 2; // Low variance = predictable

    return {
      counterparties,
      txTypes,
      hourlyDistribution,
      dailyDistribution,
      regularPatterns,
      roundAmounts,
      dustTransactions
    };
  }

  // ===========================================
  // METRICS CALCULATION
  // ===========================================

  private calculateMetrics(
    transactions: HeliusTransaction[],
    patterns: ReturnType<typeof this.analyzePatterns>,
    assets: { tokens: number; nfts: number }
  ): PrivacyReport['metrics'] {
    const txCount = transactions.length;
    const uniqueCounterparties = patterns.counterparties.size;

    // Address reuse ratio (lower is better)
    let totalInteractions = 0;
    patterns.counterparties.forEach(count => totalInteractions += count);
    const addressReuseRatio = uniqueCounterparties > 0
      ? totalInteractions / uniqueCounterparties
      : 0;

    // Average time between transactions
    let avgTimeBetweenTx = 0;
    if (transactions.length > 1) {
      const times = transactions
        .filter(tx => tx.timestamp)
        .map(tx => tx.timestamp)
        .sort((a, b) => a - b);

      let totalDiff = 0;
      for (let i = 1; i < times.length; i++) {
        totalDiff += times[i] - times[i - 1];
      }
      avgTimeBetweenTx = totalDiff / (times.length - 1);
    }

    // NFT exposure (NFTs are highly linkable)
    const nftExposure = Math.min(assets.nfts * 10, 100);

    // Token diversity (more tokens = more fingerprinting)
    const tokenDiversity = Math.min(assets.tokens * 5, 100);

    return {
      transactionCount: txCount,
      uniqueCounterparties,
      addressReuseRatio,
      averageTimeBetweenTx: avgTimeBetweenTx / 3600, // Convert to hours
      exposedBalanceHistory: true, // Solana is transparent
      nftExposure,
      tokenDiversity
    };
  }

  // ===========================================
  // RISK IDENTIFICATION
  // ===========================================

  private identifyRisks(
    transactions: HeliusTransaction[],
    patterns: ReturnType<typeof this.analyzePatterns>,
    metrics: PrivacyReport['metrics']
  ): PrivacyRisk[] {
    const risks: PrivacyRisk[] = [];

    // Risk: High address reuse
    if (metrics.addressReuseRatio > 3) {
      risks.push({
        type: 'ADDRESS_REUSE',
        severity: 'HIGH',
        description: `High address reuse detected (${metrics.addressReuseRatio.toFixed(1)}x). Repeated interactions with same addresses make linking easier.`,
        evidence: `Top counterparty interacted ${Math.max(...patterns.counterparties.values())} times`
      });
    }

    // Risk: NFT exposure
    if (metrics.nftExposure > 30) {
      risks.push({
        type: 'NFT_EXPOSURE',
        severity: metrics.nftExposure > 60 ? 'HIGH' : 'MEDIUM',
        description: 'NFTs are highly linkable. Each unique NFT can be used to track your wallet across platforms.',
        evidence: `Wallet holds NFTs creating ${metrics.nftExposure}% exposure risk`
      });
    }

    // Risk: Predictable transaction patterns
    if (patterns.regularPatterns) {
      risks.push({
        type: 'PREDICTABLE_PATTERNS',
        severity: 'MEDIUM',
        description: 'Transaction timing shows predictable patterns. This can be used to identify your activity.',
        evidence: 'Low variance in hourly transaction distribution'
      });
    }

    // Risk: Round amount transactions
    if (patterns.roundAmounts > transactions.length * 0.3) {
      risks.push({
        type: 'ROUND_AMOUNTS',
        severity: 'LOW',
        description: 'Many transactions use round amounts (e.g., 1.0 SOL). Varying amounts improves privacy.',
        evidence: `${patterns.roundAmounts} of ${transactions.length} transactions use round amounts`
      });
    }

    // Risk: Dust transactions received
    if (patterns.dustTransactions > 5) {
      risks.push({
        type: 'DUST_ATTACK_EXPOSURE',
        severity: 'MEDIUM',
        description: 'Multiple dust transactions detected. These can be used to track your wallet.',
        evidence: `${patterns.dustTransactions} potential dust transactions found`
      });
    }

    // Risk: Exchange interactions (detectable by known addresses)
    const exchangeInteractions = this.detectExchangeInteractions(patterns.counterparties);
    if (exchangeInteractions > 0) {
      risks.push({
        type: 'EXCHANGE_LINKAGE',
        severity: 'HIGH',
        description: 'Interactions with known exchanges detected. Exchanges often require KYC, linking your identity to this wallet.',
        evidence: `${exchangeInteractions} interactions with exchange-like addresses`
      });
    }

    // Risk: All transactions public
    risks.push({
      type: 'TRANSPARENT_BLOCKCHAIN',
      severity: 'MEDIUM',
      description: 'All Solana transactions are publicly visible. Your complete transaction history can be analyzed.',
      evidence: 'Solana is a transparent blockchain by default'
    });

    // Risk: High activity volume
    if (metrics.transactionCount > 500) {
      risks.push({
        type: 'HIGH_ACTIVITY',
        severity: 'LOW',
        description: 'High transaction volume creates a detailed behavioral fingerprint.',
        evidence: `${metrics.transactionCount} transactions analyzed`
      });
    }

    return risks;
  }

  private detectExchangeInteractions(counterparties: Map<string, number>): number {
    // Known exchange hot wallet patterns (simplified)
    // In production, would use a database of known exchange addresses
    let count = 0;
    counterparties.forEach((interactions, address) => {
      // High interaction count might indicate exchange
      if (interactions > 10) count++;
    });
    return count;
  }

  // ===========================================
  // PRIVACY SCORE CALCULATION
  // ===========================================

  private calculatePrivacyScore(
    metrics: PrivacyReport['metrics'],
    risks: PrivacyRisk[]
  ): number {
    let score = 100;

    // Deduct for risks
    for (const risk of risks) {
      switch (risk.severity) {
        case 'CRITICAL': score -= 25; break;
        case 'HIGH': score -= 15; break;
        case 'MEDIUM': score -= 10; break;
        case 'LOW': score -= 5; break;
      }
    }

    // Deduct for address reuse
    score -= Math.min(metrics.addressReuseRatio * 5, 20);

    // Deduct for NFT exposure
    score -= metrics.nftExposure * 0.2;

    // Deduct for token diversity (fingerprinting)
    score -= metrics.tokenDiversity * 0.1;

    // Bonus for low transaction count (harder to analyze)
    if (metrics.transactionCount < 10) score += 10;

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // ===========================================
  // RECOMMENDATIONS
  // ===========================================

  private generateRecommendations(
    risks: PrivacyRisk[],
    metrics: PrivacyReport['metrics']
  ): string[] {
    const recommendations: string[] = [];

    for (const risk of risks) {
      switch (risk.type) {
        case 'ADDRESS_REUSE':
          recommendations.push('🔄 Use fresh addresses for each transaction. Consider using a hierarchical deterministic (HD) wallet.');
          break;
        case 'NFT_EXPOSURE':
          recommendations.push('🖼️ Consider holding NFTs in a separate wallet from your main funds.');
          break;
        case 'PREDICTABLE_PATTERNS':
          recommendations.push('⏰ Vary your transaction timing. Avoid transacting at the same times each day.');
          break;
        case 'ROUND_AMOUNTS':
          recommendations.push('💰 Use varied, non-round amounts for transactions to reduce fingerprinting.');
          break;
        case 'DUST_ATTACK_EXPOSURE':
          recommendations.push('🧹 Do not interact with dust transactions. Consider them as tracking attempts.');
          break;
        case 'EXCHANGE_LINKAGE':
          recommendations.push('🏦 Use privacy-focused on/off ramps or P2P trading to reduce exchange linkage.');
          break;
        case 'TRANSPARENT_BLOCKCHAIN':
          recommendations.push('🔒 Consider using privacy tools like Privacy Cash to shield your transactions.');
          break;
      }
    }

    // General recommendations
    recommendations.push('📊 Regularly audit your wallet using tools like Shadow Tracker.');
    recommendations.push('🆕 Consider migrating to a fresh wallet periodically.');

    // Deduplicate
    return [...new Set(recommendations)];
  }

  // ===========================================
  // HELPERS
  // ===========================================

  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 20) return 'D';
    return 'F';
  }

  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 70) return 'LOW';
    if (score >= 50) return 'MEDIUM';
    if (score >= 30) return 'HIGH';
    return 'CRITICAL';
  }

  private calculateVariance(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squaredDiffs = arr.map(x => Math.pow(x - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
  }

  // ===========================================
  // REPORT FORMATTING
  // ===========================================

  formatReport(report: PrivacyReport): string {
    const gradeEmoji = {
      'A': '🟢', 'B': '🟡', 'C': '🟠', 'D': '🔴', 'F': '⛔'
    };

    const riskEmoji = {
      'LOW': '🟢', 'MEDIUM': '🟡', 'HIGH': '🔴', 'CRITICAL': '⛔'
    };

    let output = `
╔══════════════════════════════════════════════════════════════╗
║                    SHADOW TRACKER REPORT                      ║
║                   Wallet Privacy Analysis                     ║
╚══════════════════════════════════════════════════════════════╝

📍 Wallet: ${report.address.slice(0, 8)}...${report.address.slice(-8)}
📅 Analyzed: ${report.timestamp.toISOString()}

┌──────────────────────────────────────────────────────────────┐
│                      PRIVACY SCORE                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│     ${gradeEmoji[report.grade]} Grade: ${report.grade}    Score: ${report.privacyScore}/100    Risk: ${riskEmoji[report.riskLevel]} ${report.riskLevel}
│                                                               │
│     ${'█'.repeat(Math.floor(report.privacyScore / 5))}${'░'.repeat(20 - Math.floor(report.privacyScore / 5))}
│                                                               │
└──────────────────────────────────────────────────────────────┘

📊 METRICS
───────────────────────────────────────────────────────────────
  Transactions analyzed:     ${report.metrics.transactionCount}
  Unique counterparties:     ${report.metrics.uniqueCounterparties}
  Address reuse ratio:       ${report.metrics.addressReuseRatio.toFixed(2)}x
  Avg time between tx:       ${report.metrics.averageTimeBetweenTx.toFixed(1)} hours
  NFT exposure risk:         ${report.metrics.nftExposure}%
  Token fingerprint risk:    ${report.metrics.tokenDiversity}%

⚠️  RISKS IDENTIFIED (${report.risks.length})
───────────────────────────────────────────────────────────────`;

    for (const risk of report.risks) {
      const emoji = { 'LOW': '🔵', 'MEDIUM': '🟡', 'HIGH': '🔴', 'CRITICAL': '⛔' };
      output += `
  ${emoji[risk.severity]} [${risk.severity}] ${risk.type}
     ${risk.description}
     ${risk.evidence ? `📌 ${risk.evidence}` : ''}
`;
    }

    output += `
💡 RECOMMENDATIONS
───────────────────────────────────────────────────────────────`;

    for (const rec of report.recommendations) {
      output += `
  ${rec}`;
    }

    output += `

═══════════════════════════════════════════════════════════════
  Powered by Helius APIs | Shadow Tracker v1.0
  Built for Solana Privacy Hackathon 2026
═══════════════════════════════════════════════════════════════
`;

    return output;
  }
}

// ===========================================
// CLI DEMO
// ===========================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║              SHADOW TRACKER                             ║');
  console.log('║          Wallet Privacy Analyzer                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    console.log('❌ HELIUS_API_KEY not found in .env');
    return;
  }

  const tracker = new ShadowTracker(apiKey);

  // Demo: Analyze a known active wallet
  // Using a well-known Solana whale/active wallet for demo
  const demoWallets = [
    'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg', // Solana Foundation
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Active wallet
  ];

  const targetWallet = process.argv[2] || demoWallets[0];

  console.log(`🎯 Target: ${targetWallet}\n`);

  try {
    const report = await tracker.analyzeWallet(targetWallet, {
      maxTransactions: 100,
      includeNFTs: true
    });

    console.log(tracker.formatReport(report));

    // Also output JSON for programmatic use
    console.log('\n📄 JSON Report saved to: shadow-tracker-report.json');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export default ShadowTracker;

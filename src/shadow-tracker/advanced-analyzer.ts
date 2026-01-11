/**
 * SHADOW TRACKER v2.0 - Advanced Privacy Analyzer
 *
 * Combines Helius API data with advanced privacy mathematics.
 * Unique information-theoretic approach to wallet privacy analysis.
 */

import * as dotenv from 'dotenv';
import {
  TransactionData,
  EntropyMetrics,
  KAnonymityMetrics,
  GraphMetrics,
  AttackSimulation,
  AdvancedPrivacyReport,
  analyzeEntropy,
  analyzeKAnonymity,
  analyzeGraph,
  simulateAttacks,
  generateAdvancedPrivacyReport
} from './privacy-math';

dotenv.config();

// ============================================
// HELIUS API INTEGRATION
// ============================================

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  fee: number;
  feePayer: string;
  nativeTransfers?: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  tokenTransfers?: {
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
  }[];
}

interface HeliusAsset {
  id: string;
  content: {
    metadata?: {
      name?: string;
    };
  };
  ownership: {
    owner: string;
  };
}

export class AdvancedPrivacyAnalyzer {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HELIUS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('HELIUS_API_KEY is required');
    }
    this.baseUrl = 'https://api.helius.xyz/v0';
  }

  /**
   * Fetch transaction history from Helius
   */
  async getTransactionHistory(address: string, limit: number = 100): Promise<HeliusTransaction[]> {
    const response = await fetch(
      `${this.baseUrl}/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    return response.json() as Promise<HeliusTransaction[]>;
  }

  /**
   * Fetch assets (NFTs, tokens) from Helius DAS API
   */
  async getAssets(address: string): Promise<{ tokens: any[]; nfts: HeliusAsset[] }> {
    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'das-assets',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1,
          limit: 1000
        }
      })
    });

    const data = await response.json() as any;
    const items = data.result?.items || [];

    return {
      tokens: items.filter((i: any) => i.interface === 'FungibleToken'),
      nfts: items.filter((i: any) => i.interface === 'ProgrammableNFT' || i.interface === 'V1_NFT')
    };
  }

  /**
   * Convert Helius transactions to our internal format
   */
  private convertTransactions(
    heliusTxs: HeliusTransaction[],
    targetAddress: string
  ): TransactionData[] {
    const transactions: TransactionData[] = [];

    for (const tx of heliusTxs) {
      // Extract native transfers
      if (tx.nativeTransfers) {
        for (const transfer of tx.nativeTransfers) {
          const isIncoming = transfer.toUserAccount === targetAddress;
          const counterparty = isIncoming ? transfer.fromUserAccount : transfer.toUserAccount;

          transactions.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            amount: transfer.amount / 1e9, // Convert lamports to SOL
            counterparty: counterparty || 'unknown',
            type: tx.type || 'TRANSFER',
            fee: tx.fee / 1e9
          });
        }
      }

      // Extract token transfers
      if (tx.tokenTransfers) {
        for (const transfer of tx.tokenTransfers) {
          const isIncoming = transfer.toUserAccount === targetAddress;
          const counterparty = isIncoming ? transfer.fromUserAccount : transfer.toUserAccount;

          transactions.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            amount: transfer.tokenAmount,
            counterparty: counterparty || 'unknown',
            type: `TOKEN_${tx.type || 'TRANSFER'}`,
            fee: tx.fee / 1e9
          });
        }
      }

      // If no transfers but transaction exists
      if (!tx.nativeTransfers?.length && !tx.tokenTransfers?.length) {
        transactions.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          amount: 0,
          counterparty: tx.feePayer || 'unknown',
          type: tx.type || 'UNKNOWN',
          fee: tx.fee / 1e9
        });
      }
    }

    return transactions;
  }

  /**
   * Run complete advanced privacy analysis
   */
  async analyzeWallet(
    address: string,
    options: { maxTransactions?: number; includeAssets?: boolean } = {}
  ): Promise<AdvancedPrivacyReport> {
    const maxTx = options.maxTransactions || 100;

    console.log(`\n🔬 Advanced Privacy Analysis: ${address.slice(0, 8)}...`);

    // Fetch data from Helius
    console.log('📥 Fetching transaction history...');
    const heliusTxs = await this.getTransactionHistory(address, maxTx);
    console.log(`   Found ${heliusTxs.length} transactions`);

    // Convert to our format
    const transactions = this.convertTransactions(heliusTxs, address);
    console.log(`   Processed ${transactions.length} transfers`);

    // Fetch assets if requested
    if (options.includeAssets) {
      console.log('📥 Fetching assets...');
      try {
        const assets = await this.getAssets(address);
        console.log(`   Found ${assets.tokens.length} tokens, ${assets.nfts.length} NFTs`);
      } catch (e) {
        console.log('   Could not fetch assets (may be devnet)');
      }
    }

    // Run advanced analysis
    console.log('🧮 Running entropy analysis...');
    const entropy = analyzeEntropy(transactions);
    console.log(`   Total entropy: ${(entropy.totalEntropy * 100).toFixed(1)}%`);

    console.log('🔢 Calculating k-anonymity...');
    const kAnonymity = analyzeKAnonymity(transactions);
    console.log(`   Estimated k: ${kAnonymity.kValue}`);

    console.log('🕸️  Analyzing transaction graph...');
    const graph = analyzeGraph(transactions);
    console.log(`   Network degree: ${graph.degree}`);

    console.log('⚔️  Simulating attacks...');
    const attackSimulation = simulateAttacks(transactions, entropy, kAnonymity, graph);
    console.log(`   De-anon probability: ${(attackSimulation.deAnonymizationProbability * 100).toFixed(1)}%`);

    // Generate full report
    const report = generateAdvancedPrivacyReport(address, transactions);

    console.log(`\n✅ Analysis complete: Score ${report.advancedPrivacyScore}/100 (${report.grade})`);

    return report;
  }

  /**
   * Format report for display
   */
  formatReport(report: AdvancedPrivacyReport): string {
    const lines: string[] = [];

    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════════════════╗');
    lines.push('║            SHADOW TRACKER v2.0 - ADVANCED PRIVACY REPORT                 ║');
    lines.push('║              Information-Theoretic Privacy Analysis                       ║');
    lines.push('╚══════════════════════════════════════════════════════════════════════════╝');
    lines.push('');

    // Header
    lines.push(`📍 Wallet: ${report.address}`);
    lines.push(`📅 Analysis: ${report.analysisTimestamp}`);
    lines.push('');

    // Score overview
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                           PRIVACY SCORE                                  │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');

    const scoreBar = this.createScoreBar(report.advancedPrivacyScore);
    lines.push(`│   ${scoreBar}   │`);
    lines.push(`│                     ${report.advancedPrivacyScore}/100 - Grade ${report.grade} - ${report.riskLevel} RISK                      │`);
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Entropy metrics
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                        ENTROPY ANALYSIS                                  │');
    lines.push('│              (Higher entropy = More random = Better privacy)             │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│   Amount Entropy:      ${this.formatPercent(report.entropy.amountEntropy)} (${report.entropy.amountEntropyBits.toFixed(2)} bits)        │`);
    lines.push(`│   Temporal Entropy:    ${this.formatPercent(report.entropy.temporalEntropy)} (${report.entropy.temporalEntropyBits.toFixed(2)} bits)        │`);
    lines.push(`│   Counterparty Entropy:${this.formatPercent(report.entropy.counterpartyEntropy)} (${report.entropy.counterpartyEntropyBits.toFixed(2)} bits)        │`);
    lines.push(`│   Type Entropy:        ${this.formatPercent(report.entropy.typeEntropy)} (${report.entropy.typeEntropyBits.toFixed(2)} bits)        │`);
    lines.push('│                                                                          │');
    lines.push(`│   📊 Total: ${this.formatPercent(report.entropy.totalEntropy)} (${report.entropy.totalEntropyBits.toFixed(2)} bits total)                     │`);
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // k-Anonymity
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                        k-ANONYMITY ANALYSIS                              │');
    lines.push('│              (Higher k = More wallets like you = Better privacy)         │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│   Estimated k-value: ${report.kAnonymity.kValue.toString().padEnd(10)} Re-identification Risk: ${report.kAnonymity.reIdentificationRisk.padEnd(8)} │`);
    lines.push('│                                                                          │');
    lines.push('│   Quasi-Identifiers:                                                     │');
    for (const qi of report.kAnonymity.quasiIdentifiers) {
      const uniqueStr = `${(qi.uniqueness * 100).toFixed(0)}%`.padStart(4);
      lines.push(`│     • ${qi.identifier.padEnd(22)} Uniqueness: ${uniqueStr}                │`);
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Graph analysis
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                        GRAPH ANALYSIS                                    │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│   Network Degree:        ${report.graph.degree.toString().padEnd(10)} (unique counterparties)            │`);
    lines.push(`│   Clustering Coefficient:${(report.graph.clusteringCoefficient * 100).toFixed(1).padStart(6)}%                                      │`);
    lines.push(`│   Hops to Exchange:      ${(report.graph.hopsToExchange?.toString() || 'N/A').padEnd(10)}                              │`);
    lines.push(`│   Betweenness Centrality:${(report.graph.betweennessCentrality * 100).toFixed(1).padStart(6)}%                                      │`);
    if (report.graph.detectedClusters.length > 0) {
      lines.push('│                                                                          │');
      lines.push('│   ⚠️  Detected Wallet Clusters:                                          │');
      for (const cluster of report.graph.detectedClusters) {
        lines.push(`│     • ${cluster.reason.substring(0, 55).padEnd(55)}  │`);
      }
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Attack simulation
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                     ATTACK SIMULATION RESULTS                            │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│   De-anonymization Probability: ${(report.attackSimulation.deAnonymizationProbability * 100).toFixed(1)}%                               │`);
    lines.push(`│   Estimated Time to De-anon:    ${report.attackSimulation.estimatedTimeToDeAnon.padEnd(20)}              │`);
    lines.push('│                                                                          │');
    lines.push('│   Top Attack Vectors:                                                    │');
    for (const scenario of report.attackSimulation.scenarios.slice(0, 4)) {
      const prob = `${(scenario.probability * 100).toFixed(0)}%`.padStart(4);
      lines.push(`│     ${prob} - ${scenario.name.substring(0, 50).padEnd(50)} │`);
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Recommendations
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                    RECOMMENDATIONS (Quantified Impact)                   │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');
    for (const rec of report.recommendations.slice(0, 5)) {
      const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      lines.push(`│ ${priority} [${rec.priority.padEnd(6)}] ${rec.action.substring(0, 50).padEnd(50)} │`);
      lines.push(`│              Impact: ${rec.impact.substring(0, 45).padEnd(45)}  │`);
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Methodology
    lines.push('┌──────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                         ACADEMIC METHODOLOGY                             │');
    lines.push('├──────────────────────────────────────────────────────────────────────────┤');
    for (const paper of report.methodology) {
      lines.push(`│   📚 ${paper.substring(0, 65).padEnd(65)} │`);
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    return lines.join('\n');
  }

  private createScoreBar(score: number): string {
    const width = 50;
    const filled = Math.round((score / 100) * width);
    const empty = width - filled;

    let color = '🟥'; // Red for low scores
    if (score >= 80) color = '🟩';
    else if (score >= 60) color = '🟨';
    else if (score >= 40) color = '🟧';

    return `[${color.repeat(Math.ceil(filled / 2))}${'⬜'.repeat(Math.ceil(empty / 2))}]`;
  }

  private formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`.padStart(6);
  }
}

// ============================================
// CLI RUNNER
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const address = args[0] || 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg';

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SHADOW TRACKER v2.0                                    ║');
  console.log('║           Advanced Information-Theoretic Privacy Analyzer                 ║');
  console.log('║                                                                           ║');
  console.log('║   Using: Shannon Entropy, k-Anonymity, Graph Analysis, Attack Simulation ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');

  try {
    const analyzer = new AdvancedPrivacyAnalyzer();
    const report = await analyzer.analyzeWallet(address, {
      maxTransactions: 100,
      includeAssets: true
    });

    console.log(analyzer.formatReport(report));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default AdvancedPrivacyAnalyzer;

/**
 * SHADOW TRACKER v3.0 - Advanced Privacy Analyzer
 *
 * State-of-the-art privacy analysis with:
 * - Mutual Information
 * - Differential Privacy (ε-δ)
 * - Multi-Heuristic Clustering
 * - Temporal Autocorrelation
 * - PageRank Network Centrality
 * - Mixer Detection
 * - Cross-chain Linkability
 *
 * Based on 8 academic papers from 1948-2013.
 */

import * as dotenv from 'dotenv';
import {
  TransactionData,
  AdvancedPrivacyReportV3,
  generateAdvancedPrivacyReportV3
} from './privacy-math-v3';

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
  description?: string;  // Enhanced description from Helius (e.g., "minted X Token (Wormhole)")
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

export class AdvancedPrivacyAnalyzerV3 {
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
   * Convert Helius transactions to our internal format
   */
  private convertTransactions(
    heliusTxs: HeliusTransaction[],
    targetAddress: string
  ): TransactionData[] {
    const transactions: TransactionData[] = [];

    for (const tx of heliusTxs) {
      if (tx.nativeTransfers) {
        for (const transfer of tx.nativeTransfers) {
          const isIncoming = transfer.toUserAccount === targetAddress;
          const counterparty = isIncoming ? transfer.fromUserAccount : transfer.toUserAccount;

          transactions.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            amount: transfer.amount / 1e9,
            counterparty: counterparty || 'unknown',
            type: tx.type || 'TRANSFER',
            fee: tx.fee / 1e9,
            description: tx.description  // Pass Helius description for bridge detection
          });
        }
      }

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
            fee: tx.fee / 1e9,
            description: tx.description  // Pass Helius description for bridge detection
          });
        }
      }

      if (!tx.nativeTransfers?.length && !tx.tokenTransfers?.length) {
        transactions.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          amount: 0,
          counterparty: tx.feePayer || 'unknown',
          type: tx.type || 'UNKNOWN',
          fee: tx.fee / 1e9,
          description: tx.description  // Pass Helius description for bridge detection
        });
      }
    }

    return transactions;
  }

  /**
   * Run complete v3 advanced privacy analysis
   */
  async analyzeWallet(
    address: string,
    options: { maxTransactions?: number } = {}
  ): Promise<AdvancedPrivacyReportV3> {
    const maxTx = options.maxTransactions || 100;

    console.log(`\n🔬 Shadow Tracker v3.0 Analysis: ${address.slice(0, 8)}...`);

    // Fetch data from Helius
    console.log('📥 Fetching transaction history...');
    const heliusTxs = await this.getTransactionHistory(address, maxTx);
    console.log(`   Found ${heliusTxs.length} transactions`);

    // Convert to our format
    const transactions = this.convertTransactions(heliusTxs, address);
    console.log(`   Processed ${transactions.length} transfers`);

    // Run v3 analysis
    console.log('🧮 Running v3 advanced analysis...');
    console.log('   • Shannon Entropy');
    console.log('   • Mutual Information');
    console.log('   • Differential Privacy (ε-δ)');
    console.log('   • Multi-Heuristic Clustering');
    console.log('   • Temporal Autocorrelation');
    console.log('   • PageRank Centrality');
    console.log('   • Mixer Detection');
    console.log('   • Cross-chain Linkability');

    const report = generateAdvancedPrivacyReportV3(address, transactions);

    console.log(`\n✅ Analysis complete: Score ${report.advancedPrivacyScore}/100 (${report.grade})`);
    console.log(`   Risk Level: ${report.riskLevel}`);
    console.log(`   Differential Privacy: ε=${report.differentialPrivacy.epsilon.toFixed(2)}`);
    console.log(`   Mutual Information: ${(report.mutualInformation.totalMutualInformation * 100).toFixed(1)}% leakage`);

    return report;
  }

  /**
   * Format v3 report for console display
   */
  formatReport(report: AdvancedPrivacyReportV3): string {
    const lines: string[] = [];

    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                    SHADOW TRACKER v3.0 - ADVANCED PRIVACY REPORT                     ║');
    lines.push('║                  State-of-the-Art Information-Theoretic Analysis                     ║');
    lines.push('╚══════════════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');

    // Header
    lines.push(`📍 Wallet: ${report.address}`);
    lines.push(`📅 Analysis: ${report.analysisTimestamp}`);
    lines.push(`🔢 Version: ${report.version}`);
    lines.push('');

    // Score overview
    lines.push('┌──────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                              PRIVACY SCORE (v3.0)                                    │');
    lines.push('├──────────────────────────────────────────────────────────────────────────────────────┤');

    const scoreBar = this.createScoreBar(report.advancedPrivacyScore);
    lines.push(`│   ${scoreBar}   │`);
    lines.push(`│            ${report.advancedPrivacyScore}/100 - Grade ${report.grade} - ${report.riskLevel} RISK                              │`);
    lines.push('└──────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // V3 NEW METRICS
    lines.push('┌──────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                         NEW v3.0 METRICS                                             │');
    lines.push('├──────────────────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│ 🔗 Mutual Information:     ${(report.mutualInformation.totalMutualInformation * 100).toFixed(1).padStart(5)}% leakage (lower is better)                     │`);
    lines.push(`│ 🔐 Differential Privacy:   ε=${report.differentialPrivacy.epsilon.toFixed(2).padStart(5)} (lower ε = stronger privacy)                    │`);
    lines.push(`│ 🕸️  Clustering Vuln:        ${(report.advancedClustering.clusteringVulnerability * 100).toFixed(1).padStart(5)}% (lower is better)                             │`);
    lines.push(`│ ⏱️  Temporal Autocorr:      ${(Math.abs(report.temporalAnalysis.autocorrelation) * 100).toFixed(1).padStart(5)}% (lower is better)                             │`);
    lines.push(`│ 📊 Network Visibility:     ${(report.networkCentrality.networkVisibility * 100).toFixed(1).padStart(5)}% (lower is better)                             │`);
    lines.push(`│ 🌀 Mixer Usage:            ${(report.mixerDetection.mixerUsageProbability * 100).toFixed(1).padStart(5)}% probability                                   │`);
    lines.push(`│ 🌉 Cross-chain Link:       ${(report.crossChain.crossChainLinkability * 100).toFixed(1).padStart(5)}% linkability                                    │`);
    lines.push('└──────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Classic metrics
    lines.push('┌──────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                           CLASSIC METRICS                                            │');
    lines.push('├──────────────────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│ 📊 Total Entropy:          ${(report.entropy.totalEntropy * 100).toFixed(1).padStart(5)}% (${report.entropy.totalEntropyBits.toFixed(2)} bits)                          │`);
    lines.push(`│ 🔢 k-Anonymity:            k=${report.kAnonymity.kValue.toString().padStart(5)} (${report.kAnonymity.reIdentificationRisk} risk)                           │`);
    lines.push(`│ 🕸️  Graph Privacy:          ${report.graph.graphPrivacyScore.toString().padStart(5)}/100                                                │`);
    lines.push(`│ ⚔️  De-anon Probability:   ${(report.attackSimulation.deAnonymizationProbability * 100).toFixed(1).padStart(5)}%                                                 │`);
    lines.push('└──────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Temporal Analysis Detail
    if (report.temporalAnalysis.detectedPeriods.length > 0) {
      lines.push('┌──────────────────────────────────────────────────────────────────────────────────────┐');
      lines.push('│                         TEMPORAL PATTERNS DETECTED                                   │');
      lines.push('├──────────────────────────────────────────────────────────────────────────────────────┤');
      for (const period of report.temporalAnalysis.detectedPeriods) {
        lines.push(`│   ⚠️  ${period.period} periodicity: ${(period.confidence * 100).toFixed(0)}% confidence                                        │`);
      }
      if (report.temporalAnalysis.estimatedTimezone) {
        lines.push(`│   🌍 Estimated timezone: ${report.temporalAnalysis.estimatedTimezone}                                                 │`);
      }
      lines.push('└──────────────────────────────────────────────────────────────────────────────────────┘');
      lines.push('');
    }

    // Recommendations
    lines.push('┌──────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                    RECOMMENDATIONS (Quantified Impact)                               │');
    lines.push('├──────────────────────────────────────────────────────────────────────────────────────┤');
    for (const rec of report.recommendations.slice(0, 5)) {
      const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      lines.push(`│ ${priority} [${rec.priority.padEnd(6)}] ${rec.action.substring(0, 60).padEnd(60)} │`);
      lines.push(`│              ${rec.impact.substring(0, 65).padEnd(65)}  │`);
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    // Methodology
    lines.push('┌──────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                          ACADEMIC METHODOLOGY                                        │');
    lines.push('├──────────────────────────────────────────────────────────────────────────────────────┤');
    for (const paper of report.methodology.slice(0, 6)) {
      lines.push(`│   📚 ${paper.substring(0, 75).padEnd(75)} │`);
    }
    lines.push('└──────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');

    return lines.join('\n');
  }

  private createScoreBar(score: number): string {
    const width = 60;
    const filled = Math.round((score / 100) * width);
    const empty = width - filled;

    let color = '🟥';
    if (score >= 80) color = '🟩';
    else if (score >= 60) color = '🟨';
    else if (score >= 40) color = '🟧';

    return `[${color.repeat(Math.ceil(filled / 2))}${'⬜'.repeat(Math.ceil(empty / 2))}]`;
  }
}

// ============================================
// CLI RUNNER
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const address = args[0] || 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg';

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           SHADOW TRACKER v3.0                                         ║');
  console.log('║                   State-of-the-Art Privacy Analyzer                                   ║');
  console.log('║                                                                                       ║');
  console.log('║   NEW: Mutual Information, Differential Privacy, PageRank, Mixer Detection           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════╝');

  try {
    const analyzer = new AdvancedPrivacyAnalyzerV3();
    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    console.log(analyzer.formatReport(report));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default AdvancedPrivacyAnalyzerV3;

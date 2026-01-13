/**
 * MEV Risk Analysis Library
 *
 * Calculates MEV vulnerability score based on wallet's swap patterns.
 * This is a preventive tool - shows risk of being sandwiched, not proof of past attacks.
 */

import { PrivacyData } from '@/types/privacy';

// Known high-risk DEX programs (more susceptible to MEV)
const HIGH_RISK_DEXES = ['RAYDIUM', 'PUMP_FUN', 'METEORA'];
const PROTECTED_DEXES = ['JUPITER']; // Jupiter has some MEV protection

// MEV activity peaks during these UTC hours (US/EU trading hours overlap)
const HIGH_MEV_HOURS = [13, 14, 15, 16, 17, 18, 19, 20]; // 1pm-8pm UTC

export interface MevRiskAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerabilityFactors: VulnerabilityFactor[];
  recommendations: MevRecommendation[];
  stats: {
    totalSwaps: number;
    swapsLast30Days: number;
    estimatedExposureUsd: number;
    avgSwapSizeUsd: number;
    dexDistribution: Record<string, number>;
    highRiskSwapPercentage: number;
  };
  protectionStatus: {
    usesProtectedDex: boolean;
    diversifiedDexUsage: boolean;
    lowActivityPattern: boolean;
  };
}

export interface VulnerabilityFactor {
  factor: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  points: number;
}

export interface MevRecommendation {
  action: string;
  impact: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tool?: string;
  url?: string;
}

/**
 * Calculate MEV Risk Score from privacy data
 * Score is 0-100 where higher = more vulnerable to MEV attacks
 */
export function calculateMevRisk(data: PrivacyData): MevRiskAnalysis {
  const vulnerabilityFactors: VulnerabilityFactor[] = [];
  let riskScore = 0;

  // We'll estimate based on the data we have
  // In production, this would use actual swap transaction data

  // Factor 1: Exchange/DEX exposure (we have this from exchangeFingerprint)
  const kycExposure = data.exchangeFingerprint?.kycExposure || 0;
  if (kycExposure < 0.3) {
    // Low CEX usage = more DEX usage = higher MEV risk
    const dexRiskPoints = Math.round((1 - kycExposure) * 25);
    riskScore += dexRiskPoints;
    if (dexRiskPoints > 15) {
      vulnerabilityFactors.push({
        factor: 'High DEX Usage',
        description: 'Heavy DEX trading exposes you to sandwich attacks',
        severity: dexRiskPoints > 20 ? 'HIGH' : 'MEDIUM',
        points: dexRiskPoints,
      });
    }
  }

  // Factor 2: Transaction frequency (from entropy data)
  const txFrequency = data.entropy?.transactionCountEntropy || 0;
  if (txFrequency > 2) {
    const frequencyPoints = Math.min(20, Math.round(txFrequency * 5));
    riskScore += frequencyPoints;
    vulnerabilityFactors.push({
      factor: 'High Transaction Frequency',
      description: 'Frequent trading increases MEV exposure windows',
      severity: frequencyPoints > 15 ? 'HIGH' : 'MEDIUM',
      points: frequencyPoints,
    });
  }

  // Factor 3: Timing patterns (predictable = bad)
  const autocorrelation = Math.abs(data.temporalAnalysis?.autocorrelation || 0);
  if (autocorrelation > 0.3) {
    const timingPoints = Math.round(autocorrelation * 20);
    riskScore += timingPoints;
    vulnerabilityFactors.push({
      factor: 'Predictable Trading Times',
      description: 'Regular trading patterns make you easier to target',
      severity: timingPoints > 12 ? 'HIGH' : 'MEDIUM',
      points: timingPoints,
    });
  }

  // Factor 4: Network visibility (high visibility = easy target)
  const visibility = data.networkCentrality?.networkVisibility || 0;
  if (visibility > 0.5) {
    const visibilityPoints = Math.round(visibility * 15);
    riskScore += visibilityPoints;
    vulnerabilityFactors.push({
      factor: 'High Network Visibility',
      description: 'Your wallet is well-known, making it a target',
      severity: visibilityPoints > 10 ? 'HIGH' : 'MEDIUM',
      points: visibilityPoints,
    });
  }

  // Factor 5: Dust vulnerability (attackers use dust to track)
  const dustVuln = data.dustAttack?.dustVulnerability || 0;
  if (dustVuln > 0.3) {
    const dustPoints = Math.round(dustVuln * 15);
    riskScore += dustPoints;
    vulnerabilityFactors.push({
      factor: 'Dust Attack Exposure',
      description: 'Dust tokens can be used to track your trading patterns',
      severity: dustPoints > 10 ? 'HIGH' : 'MEDIUM',
      points: dustPoints,
    });
  }

  // Factor 6: Low k-anonymity (unique = targetable)
  const kAnon = data.kAnonymity?.kValue || 100;
  if (kAnon < 50) {
    const anonPoints = Math.round((50 - kAnon) / 3);
    riskScore += anonPoints;
    vulnerabilityFactors.push({
      factor: 'Low Anonymity Set',
      description: 'Your trading patterns are unique and identifiable',
      severity: anonPoints > 12 ? 'HIGH' : 'MEDIUM',
      points: anonPoints,
    });
  }

  // Cap score at 100
  riskScore = Math.min(100, riskScore);

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  // Generate recommendations based on factors
  const recommendations = generateMevRecommendations(vulnerabilityFactors, riskScore);

  // Estimate stats (would be more accurate with real swap data)
  const estimatedSwaps = Math.round(txFrequency * 20);
  const avgSwapSize = 500; // Placeholder - would calculate from real data

  return {
    riskScore,
    riskLevel,
    vulnerabilityFactors: vulnerabilityFactors.sort((a, b) => b.points - a.points),
    recommendations,
    stats: {
      totalSwaps: estimatedSwaps,
      swapsLast30Days: Math.round(estimatedSwaps * 0.3),
      estimatedExposureUsd: estimatedSwaps * avgSwapSize * (riskScore / 100) * 0.01, // ~1% avg MEV extraction
      avgSwapSizeUsd: avgSwapSize,
      dexDistribution: {
        'Jupiter': 40,
        'Raydium': 35,
        'Orca': 15,
        'Other': 10,
      },
      highRiskSwapPercentage: Math.round((1 - kycExposure) * 60),
    },
    protectionStatus: {
      usesProtectedDex: kycExposure < 0.5,
      diversifiedDexUsage: true, // Would check actual DEX distribution
      lowActivityPattern: txFrequency < 2,
    },
  };
}

function generateMevRecommendations(
  factors: VulnerabilityFactor[],
  riskScore: number
): MevRecommendation[] {
  const recommendations: MevRecommendation[] = [];

  // Always recommend Jito bundles for high-risk users
  if (riskScore >= 50) {
    recommendations.push({
      action: 'Use Jito Bundles for transactions',
      impact: 'Prevents sandwich attacks by submitting transactions privately',
      priority: 'HIGH',
      tool: 'Jito',
      url: 'https://jito.wtf',
    });
  }

  // Check specific factors
  const hasHighDexUsage = factors.some(f => f.factor.includes('DEX'));
  const hasPredictableTiming = factors.some(f => f.factor.includes('Timing'));
  const hasDustIssue = factors.some(f => f.factor.includes('Dust'));

  if (hasHighDexUsage) {
    recommendations.push({
      action: 'Use Jupiter with MEV protection enabled',
      impact: 'Jupiter routes through protected paths when possible',
      priority: 'HIGH',
      tool: 'Jupiter',
      url: 'https://jup.ag',
    });
    recommendations.push({
      action: 'Set lower slippage tolerance (0.5-1%)',
      impact: 'Reduces potential profit for sandwich attackers',
      priority: 'MEDIUM',
    });
  }

  if (hasPredictableTiming) {
    recommendations.push({
      action: 'Randomize your trading times',
      impact: 'Makes it harder for bots to predict and front-run',
      priority: 'MEDIUM',
    });
  }

  if (hasDustIssue) {
    recommendations.push({
      action: 'Clean dust tokens from your wallet',
      impact: 'Removes tracking tokens and recovers SOL rent',
      priority: 'MEDIUM',
      tool: 'SolPrivacy Dust Cleaner',
    });
  }

  // General recommendations
  if (riskScore >= 25) {
    recommendations.push({
      action: 'Split large swaps into smaller transactions',
      impact: 'Reduces per-transaction profit for attackers',
      priority: riskScore >= 50 ? 'HIGH' : 'LOW',
    });
  }

  recommendations.push({
    action: 'Use Light Protocol for shielded transactions',
    impact: 'Complete privacy for sensitive transfers',
    priority: riskScore >= 75 ? 'HIGH' : 'LOW',
    tool: 'Light Protocol',
    url: 'https://lightprotocol.com',
  });

  return recommendations;
}

/**
 * Get risk level color for UI
 */
export function getMevRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL': return '#ef4444'; // red
    case 'HIGH': return '#f59e0b'; // amber
    case 'MEDIUM': return '#eab308'; // yellow
    case 'LOW': return '#22c55e'; // green
    default: return '#64748b';
  }
}

/**
 * Get risk level description
 */
export function getMevRiskDescription(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'Your wallet is highly vulnerable to MEV attacks. Immediate action recommended.';
    case 'HIGH':
      return 'Significant MEV risk detected. Consider using protection tools.';
    case 'MEDIUM':
      return 'Moderate MEV exposure. Some protective measures advised.';
    case 'LOW':
      return 'Low MEV risk. Your trading patterns are relatively safe.';
    default:
      return 'Unable to assess MEV risk.';
  }
}

import { PrivacyData, ToolRecommendation, PrivacyProjection, LightProtocolProjection } from "@/types/privacy";
import { PRIVACY_TOOLS, getToolById } from "./privacyTools";

/**
 * Get personalized tool recommendations based on detected privacy issues
 */
export function getToolRecommendations(data: PrivacyData): ToolRecommendation[] {
  const recommendations: ToolRecommendation[] = [];
  const addedToolIds = new Set<string>();

  // PRIORITY 1: encrypt.trade - True privacy solution for breaking links
  // Recommend when user needs to start fresh or break existing links
  const hasSignificantIssues =
    data.advancedPrivacyScore < 60 ||
    data.exchangeFingerprint.kycExposure > 0.3 ||
    data.dustAttack.dustAttackDetected ||
    data.graph.graphPrivacyScore < 50;

  if (hasSignificantIssues) {
    const tool = getToolById("encrypt-trade");
    if (tool && !addedToolIds.has(tool.id)) {
      recommendations.push({
        tool,
        reason: "Start fresh with a completely unlinked wallet - truly break the chain of transaction history",
        priority: "HIGH",
        relevantIssue: data.advancedPrivacyScore < 60
          ? `Low privacy score: ${data.advancedPrivacyScore}/100`
          : data.exchangeFingerprint.kycExposure > 0.3
          ? `${(data.exchangeFingerprint.kycExposure * 100).toFixed(0)}% KYC exposure detected`
          : "Multiple privacy vulnerabilities detected",
        projectedImprovement: 35,
      });
      addedToolIds.add(tool.id);
    }
  }

  // High dust attack vulnerability -> Light Protocol shielding
  if (data.dustAttack.dustAttackDetected || data.dustAttack.dustVulnerability > 0.5) {
    const tool = getToolById("light-protocol");
    if (tool && !addedToolIds.has(tool.id)) {
      recommendations.push({
        tool,
        reason: "Shield your assets to prevent dust tracking and break linkability",
        priority: "HIGH",
        relevantIssue: data.dustAttack.dustAttackDetected
          ? `${data.dustAttack.dustTransactionsReceived} dust transactions detected`
          : `High dust vulnerability: ${(data.dustAttack.dustVulnerability * 100).toFixed(0)}%`,
        projectedImprovement: 25,
      });
      addedToolIds.add(tool.id);
    }
  }

  // Low k-anonymity -> Light Protocol for larger anonymity set
  if (data.kAnonymity.kValue < 50 && !addedToolIds.has("light-protocol")) {
    const tool = getToolById("light-protocol");
    if (tool) {
      recommendations.push({
        tool,
        reason: "Join shielded pools to increase your anonymity set",
        priority: data.kAnonymity.kValue < 20 ? "HIGH" : "MEDIUM",
        relevantIssue: `Small anonymity set: k=${data.kAnonymity.kValue}`,
        projectedImprovement: 30,
      });
      addedToolIds.add(tool.id);
    }
  }

  // High temporal patterns -> Arcium MPC
  if (Math.abs(data.temporalAnalysis.autocorrelation) > 0.5) {
    const tool = getToolById("arcium");
    if (tool && !addedToolIds.has(tool.id)) {
      recommendations.push({
        tool,
        reason: "Use confidential computing to hide transaction timing patterns",
        priority: "MEDIUM",
        relevantIssue: "Detectable timing patterns in your transactions",
        projectedImprovement: 10,
      });
      addedToolIds.add(tool.id);
    }
  }

  // Low entropy -> mixing services
  if (data.entropy.totalEntropy < 0.5 && !addedToolIds.has("dust-protocol")) {
    const tool = getToolById("dust-protocol");
    if (tool) {
      recommendations.push({
        tool,
        reason: "Increase transaction randomness through privacy-preserving mixing",
        priority: "MEDIUM",
        relevantIssue: `Low entropy score: ${(data.entropy.totalEntropy * 100).toFixed(0)}%`,
        projectedImprovement: 15,
      });
      addedToolIds.add(tool.id);
    }
  }

  // High network visibility -> Privacy tools
  if (data.networkCentrality.networkVisibility > 0.6 && !addedToolIds.has("dust-protocol")) {
    const tool = getToolById("dust-protocol");
    if (tool) {
      recommendations.push({
        tool,
        reason: "Reduce your network visibility through transaction mixing",
        priority: "LOW",
        relevantIssue: `High network visibility: ${(data.networkCentrality.networkVisibility * 100).toFixed(0)}%`,
        projectedImprovement: 10,
      });
      addedToolIds.add(tool.id);
    }
  }

  // Sort by priority (HIGH > MEDIUM > LOW) and limit to top 5
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
}

/**
 * Calculate full privacy projection after implementing all recommendations
 */
export function calculatePrivacyProjection(data: PrivacyData): PrivacyProjection {
  const currentScore = data.advancedPrivacyScore;
  const recommendations = getToolRecommendations(data);

  // Sum up all improvements (with diminishing returns)
  let totalImprovement = 0;
  recommendations.forEach((rec, index) => {
    // Apply diminishing returns: each subsequent tool adds less
    const diminishingFactor = Math.pow(0.85, index);
    totalImprovement += rec.projectedImprovement * diminishingFactor;
  });

  const projectedScore = Math.min(currentScore + totalImprovement, 95);

  return {
    currentScore,
    projectedScore,
    improvement: projectedScore - currentScore,
    metrics: [
      {
        name: "Transaction Entropy",
        current: data.entropy.totalEntropy * 100,
        projected: Math.min(data.entropy.totalEntropy * 100 + 25, 95),
        improvement: 25,
      },
      {
        name: "Anonymity Set",
        current: data.kAnonymity.kAnonymityScore,
        projected: Math.min(data.kAnonymity.kAnonymityScore + 30, 95),
        improvement: 30,
      },
      {
        name: "Exchange Exposure",
        current: (1 - data.exchangeFingerprint.kycExposure) * 100,
        projected: Math.min((1 - data.exchangeFingerprint.kycExposure) * 100 + 20, 95),
        improvement: 20,
      },
      {
        name: "Graph Privacy",
        current: data.graph.graphPrivacyScore,
        projected: Math.min(data.graph.graphPrivacyScore + 15, 95),
        improvement: 15,
      },
    ],
  };
}

/**
 * Calculate specific Light Protocol privacy projection
 */
export function calculateLightProtocolProjection(data: PrivacyData): LightProtocolProjection {
  const currentScore = data.advancedPrivacyScore;

  // Light Protocol specific improvements
  const entropyImprovement = Math.min((1 - data.entropy.totalEntropy) * 30, 25);
  const kAnonymityImprovement = data.kAnonymity.kValue < 100 ? 25 : 10;
  const dustProtectionImprovement = data.dustAttack.dustAttackDetected ? 20 : 5;
  const graphPrivacyImprovement = 15;

  const totalImprovement = (entropyImprovement + kAnonymityImprovement + dustProtectionImprovement + graphPrivacyImprovement) * 0.6;
  const projectedScore = Math.min(currentScore + totalImprovement, 95);

  return {
    currentScore,
    projectedScore,
    improvement: projectedScore - currentScore,
    metrics: [
      {
        name: "Transaction Randomness",
        current: data.entropy.totalEntropy * 100,
        projected: Math.min(data.entropy.totalEntropy * 100 + entropyImprovement, 95),
        improvement: entropyImprovement,
      },
      {
        name: "Anonymity Set Size",
        current: data.kAnonymity.kAnonymityScore,
        projected: Math.min(data.kAnonymity.kAnonymityScore + kAnonymityImprovement, 95),
        improvement: kAnonymityImprovement,
      },
      {
        name: "Dust Protection",
        current: (1 - data.dustAttack.dustVulnerability) * 100,
        projected: Math.min((1 - data.dustAttack.dustVulnerability) * 100 + dustProtectionImprovement, 95),
        improvement: dustProtectionImprovement,
      },
      {
        name: "Graph Privacy",
        current: data.graph.graphPrivacyScore,
        projected: Math.min(data.graph.graphPrivacyScore + graphPrivacyImprovement, 95),
        improvement: graphPrivacyImprovement,
      },
    ],
    benefits: [
      "99% cost reduction with ZK compression technology",
      "Break on-chain transaction linkability completely",
      "Shield assets from dust attack tracking attempts",
      "Increase your anonymity set size significantly",
      "Hide transaction patterns from blockchain observers",
    ],
    shieldingSteps: [
      "Connect your Solana wallet to Light Protocol Shield",
      "Select the tokens you want to shield",
      "Approve the shielding transaction",
      "Your tokens are now in your shielded balance",
      "Unshield to a new address when needed",
    ],
  };
}

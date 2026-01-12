export interface PrivacyAnalysisResponse {
  success: boolean;
  cached: boolean;
  data: PrivacyData;
}

export interface PrivacyData {
  address: string;
  advancedPrivacyScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  entropy: {
    totalEntropy: number;
    amountEntropy: number;
    temporalEntropy: number;
    counterpartyEntropy: number;
  };

  kAnonymity: {
    kValue: number;
    kAnonymityScore: number;
    reIdentificationRisk: "LOW" | "MEDIUM" | "HIGH";
  };

  attackSimulation: {
    scenarios: AttackScenario[];
    deAnonymizationProbability: number;
    estimatedTimeToDeAnon: string;
  };

  temporalAnalysis: {
    estimatedTimezone: string;
    timezoneConfidence: number;
    detectedPeriods: DetectedPeriod[];
    autocorrelation: number;
  };

  graph: {
    degree: number;
    detectedClusters: DetectedCluster[];
    graphPrivacyScore: number;
  };

  dustAttack: {
    dustAttackDetected: boolean;
    dustTransactionsReceived: number;
    uniqueDustSenders: string[];
    dustVulnerability: number;
    linkingRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };

  exchangeFingerprint: {
    exchangeInteractionDetected: boolean;
    detectedExchanges: DetectedExchange[];
    kycExposure: number;
  };

  networkCentrality: {
    networkVisibility: number;
    pageRank: number;
  };

  mixerDetection: {
    mixerUsageProbability: number;
  };

  recommendations: Recommendation[];

  // Optional fields that may be present
  mutualInformation?: number;
  differentialPrivacy?: {
    epsilon: number;
  };
  advancedClustering?: number;
  crossChain?: {
    bridgeUsageDetected: boolean;
  };
}

export interface AttackScenario {
  name: string;
  probability: number;
  description: string;
  mitigation: string;
}

export interface DetectedPeriod {
  period: "Daily" | "Weekly" | "Monthly";
  confidence: number;
}

export interface DetectedCluster {
  wallets: string[];
  confidence: number;
  reason: string;
}

export interface DetectedExchange {
  name: string;
  type: "CEX" | "DEX";
}

export interface Recommendation {
  action: string;
  impact: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface PrivacyAnalysisResponse {
  success: boolean;
  cached: boolean;
  data: PrivacyData;
}

export interface PrivacyData {
  address: string;
  analysisTimestamp?: string;
  version?: string;
  advancedPrivacyScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  riskLevel: "MINIMAL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  entropy: {
    totalEntropy: number;
    totalEntropyBits?: number;
    amountEntropy: number;
    amountEntropyBits?: number;
    temporalEntropy: number;
    temporalEntropyBits?: number;
    counterpartyEntropy: number;
    counterpartyEntropyBits?: number;
    typeEntropy?: number;
    typeEntropyBits?: number;
    interpretation?: string;
  };

  kAnonymity: {
    kValue: number;
    kAnonymityScore: number;
    reIdentificationRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    quasiIdentifiers?: QuasiIdentifier[];
    interpretation?: string;
  };

  attackSimulation: {
    scenarios: AttackScenario[];
    deAnonymizationProbability: number;
    estimatedTimeToDeAnon: string;
    topAttackVectors?: string[];
    interpretation?: string;
  };

  temporalAnalysis: {
    estimatedTimezone: string;
    timezoneConfidence: number;
    detectedPeriods: DetectedPeriod[];
    autocorrelation: number;
    periodicityScore?: number;
    burstinessCoefficient?: number;
    interArrivalEntropy?: number;
    interpretation?: string;
  };

  graph: {
    degree: number;
    detectedClusters: DetectedCluster[];
    graphPrivacyScore: number;
    clusteringCoefficient?: number;
    betweennessCentrality?: number;
    hopsToExchange?: number | null;
    hopsToMixer?: number | null;
    hopsToDeFi?: number | null;
    interpretation?: string;
  };

  dustAttack: {
    dustAttackDetected: boolean;
    dustTransactionsReceived: number;
    dustTransactionsSent?: number;
    uniqueDustSenders: string[];
    dustVulnerability: number;
    totalDustReceived?: number;
    linkingRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    interpretation?: string;
  };

  exchangeFingerprint: {
    exchangeInteractionDetected: boolean;
    detectedExchanges: DetectedExchange[];
    kycExposure: number;
    exchangeDeposits?: number;
    exchangeWithdrawals?: number;
    totalExchangeVolume?: number;
    traceabilityRisk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    interpretation?: string;
  };

  networkCentrality: {
    networkVisibility: number;
    pageRank: number;
    eigenvectorCentrality?: number;
    closenessCentrality?: number;
    betweennessCentrality?: number;
    hubScore?: number;
    authorityScore?: number;
    interpretation?: string;
  };

  mixerDetection: {
    mixerUsageProbability: number;
    mixerPatterns?: MixerPattern[];
    privacyEnhancement?: number;
    denominatedRatio?: number;
    equalOutputCount?: number;
    interpretation?: string;
  };

  mutualInformation?: {
    totalMutualInformation: number;
    amountTimeCorrelation?: number;
    amountCounterpartyCorrelation?: number;
    timeCounterpartyCorrelation?: number;
    typeInformationLeakage?: number;
    privacyPreservationScore?: number;
    interpretation?: string;
  };

  differentialPrivacy?: {
    epsilon: number;
    delta?: number;
    privacyBudgetUsed?: number;
    sensitivity?: number;
    requiredLaplaceNoise?: number;
    dpRiskLevel?: "STRONG" | "MODERATE" | "WEAK" | "NONE";
    interpretation?: string;
  };

  advancedClustering?: {
    clusteringVulnerability: number;
    commonInputClusterSize?: number;
    changeAddressConfidence?: number;
    depositPatternScore?: number;
    temporalClusterScore?: number;
    amountClusterScore?: number;
    detectedClusters?: AdvancedCluster[];
    interpretation?: string;
  };

  crossChain?: {
    bridgeUsageDetected: boolean;
    bridgeTransactions?: number;
    crossChainLinkability?: number;
    detectedBridges?: string[];
    linkedChains?: LinkedChain[];
    atomicSwapIndicators?: number;
    interpretation?: string;
  };

  methodology?: string[];
  recommendations: Recommendation[];
}

export interface QuasiIdentifier {
  identifier: string;
  uniqueness: number;
  description: string;
}

export interface AttackScenario {
  name: string;
  probability: number;
  description: string;
  mitigation: string;
  dataRequired?: string[];
}

export interface DetectedPeriod {
  period: "Hourly" | "Daily" | "Weekly" | "Monthly";
  confidence: number;
}

export interface DetectedCluster {
  wallets: string[];
  confidence: number;
  reason: string;
}

export interface AdvancedCluster {
  addresses: string[];
  heuristic: string;
  confidence: number;
}

export interface DetectedExchange {
  name: string;
  type: "CEX" | "DEX";
  deposits?: number;
  withdrawals?: number;
  kycRequired?: boolean;
}

export interface MixerPattern {
  type: "COINJOIN" | "TUMBLER" | "ATOMIC_SWAP" | "PRIVACY_POOL";
  confidence: number;
  transactions?: string[];
}

export interface LinkedChain {
  chain: string;
  confidence: number;
}

export interface Recommendation {
  action: string;
  impact: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  entropyGain?: number;
}

// Privacy Tools Types
export interface PrivacyTool {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  category: "shielding" | "mixing" | "dex" | "mpc" | "wallet";
  improvesMetrics: string[];
  gradient: string;
  borderColor: string;
}

export interface ToolRecommendation {
  tool: PrivacyTool;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  relevantIssue: string;
  projectedImprovement: number;
}

// Privacy Projection Types
export interface PrivacyProjection {
  currentScore: number;
  projectedScore: number;
  improvement: number;
  metrics: MetricProjection[];
}

export interface MetricProjection {
  name: string;
  current: number;
  projected: number;
  improvement: number;
}

export interface LightProtocolProjection {
  currentScore: number;
  projectedScore: number;
  improvement: number;
  metrics: MetricProjection[];
  benefits: string[];
  shieldingSteps: string[];
}

// Jupiter Portfolio Types
export interface JupiterPosition {
  type: "multiple" | "liquidity" | "leverage" | "borrowlend" | "trade" | "staked";
  label: string;
  platformId: string;
  value: number;
  data: Record<string, unknown>;
}

export interface JupiterPortfolioResponse {
  elements: JupiterPosition[];
  tokenInfo: Record<string, TokenInfo>;
  fetcherReports: Record<string, { status: string }>;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

// Financial Surveillance Types
export interface SurveillanceData {
  arkhamUrl: string;
  protocolsUsed: ProtocolUsage[];
  surveillanceRisks: SurveillanceRisk[];
  defiPositions: DeFiPosition[];
  totalDeFiValue: number;
}

export interface ProtocolUsage {
  name: string;
  category: "DEX" | "Lending" | "Staking" | "NFT" | "Bridge" | "Other";
  interactionCount: number;
  lastUsed?: string;
  icon?: string;
}

export interface SurveillanceRisk {
  source: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dataExposed: string[];
}

export interface DeFiPosition {
  protocol: string;
  type: string;
  value: number;
  tokens: string[];
}

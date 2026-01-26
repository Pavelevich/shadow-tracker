import { motion } from "framer-motion";
import {
  Shuffle, Lock, Users, Graph, Clock, Eye,
  Fingerprint, Stack, Warning, Bank, CheckCircle, XCircle, WarningCircle
} from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";

interface MetricsGridProps {
  data: PrivacyData;
}

interface Metric {
  name: string;
  value: number;
  displayValue: string;
  icon: React.ElementType;
  interpretation: string;
}

export function MetricsGrid({ data }: MetricsGridProps) {
  // All metrics follow: higher value = better privacy = green
  // Progress bar fills more = better
  const metrics: Metric[] = [
    {
      name: "Transaction Randomness",
      value: data.entropy.totalEntropy * 100,
      displayValue: `${(data.entropy.totalEntropy * 100).toFixed(0)}%`,
      icon: Shuffle,
      interpretation: data.entropy.totalEntropy > 0.7 ? "High randomness makes patterns hard to detect" : "Low randomness reveals behavioral patterns",
    },
    {
      name: "Data Protection",
      value: data.mutualInformation ? (1 - data.mutualInformation.totalMutualInformation) * 100 : 75,
      displayValue: data.mutualInformation ? `${((1 - data.mutualInformation.totalMutualInformation) * 100).toFixed(0)}%` : "N/A",
      icon: Lock,
      interpretation: data.mutualInformation && data.mutualInformation.totalMutualInformation > 0.5
        ? "High information leakage detected"
        : "Good data protection level",
    },
    {
      name: "Privacy Strength",
      value: data.differentialPrivacy ? Math.max(0, 100 - data.differentialPrivacy.epsilon * 10) : 60,
      displayValue: data.differentialPrivacy ? `ε=${data.differentialPrivacy.epsilon.toFixed(2)}` : "N/A",
      icon: Lock,
      interpretation: data.differentialPrivacy && data.differentialPrivacy.epsilon < 5
        ? "Strong privacy guarantees (low epsilon)"
        : "Weak privacy guarantees (high epsilon)",
    },
    {
      name: "Crowd Blending",
      value: Math.min(data.kAnonymity.kValue / 100 * 100, 100),
      displayValue: `k=${data.kAnonymity.kValue}`,
      icon: Users,
      interpretation: data.kAnonymity.kValue > 50 ? "You blend well with the crowd" : "Easily distinguishable from others",
    },
    {
      name: "Cluster Resistance",
      value: data.advancedClustering ? (1 - data.advancedClustering.clusteringVulnerability) * 100 : data.graph.graphPrivacyScore,
      displayValue: `${data.graph.graphPrivacyScore}%`,
      icon: Graph,
      interpretation: data.graph.graphPrivacyScore > 60
        ? "Good resistance to clustering attacks"
        : "Vulnerable to wallet clustering algorithms",
    },
    {
      name: "Timing Privacy",
      value: (1 - Math.abs(data.temporalAnalysis.autocorrelation)) * 100,
      displayValue: `${((1 - Math.abs(data.temporalAnalysis.autocorrelation)) * 100).toFixed(0)}%`,
      icon: Clock,
      interpretation: Math.abs(data.temporalAnalysis.autocorrelation) < 0.3 ? "No detectable timing patterns" : "Regular timing patterns detected",
    },
    {
      name: "Network Anonymity",
      value: Math.max(0, 100 - data.networkCentrality.networkVisibility * 50),
      displayValue: `${Math.max(0, 100 - data.networkCentrality.networkVisibility * 50).toFixed(0)}%`,
      icon: Eye,
      interpretation: data.networkCentrality.networkVisibility < 1
        ? "Low visibility in transaction graph"
        : "High visibility makes you easy to track",
    },
    {
      name: "Privacy Tool Usage",
      value: data.mixerDetection.mixerUsageProbability * 100,
      displayValue: `${(data.mixerDetection.mixerUsageProbability * 100).toFixed(0)}%`,
      icon: Stack,
      interpretation: data.mixerDetection.mixerUsageProbability > 0.3 ? "Privacy tools detected in history" : "No privacy tool usage detected",
    },
    {
      name: "Cross-chain Privacy",
      value: data.crossChain?.bridgeUsageDetected ? 40 : 100,
      displayValue: data.crossChain?.bridgeUsageDetected ? "At Risk" : "Protected",
      icon: Fingerprint,
      interpretation: data.crossChain?.bridgeUsageDetected ? "Bridge usage may link identities" : "No cross-chain exposure",
    },
    {
      name: "Dust Protection",
      value: data.dustAttack.dustAttackDetected ? 20 : 100,
      displayValue: data.dustAttack.dustAttackDetected ? `${data.dustAttack.dustTransactionsReceived} attacks` : "Clean",
      icon: Warning,
      interpretation: data.dustAttack.dustAttackDetected ? "You've received dust attack transactions" : "No dust attacks detected",
    },
    {
      name: "Exchange Privacy",
      value: (1 - data.exchangeFingerprint.kycExposure) * 100,
      displayValue: `${((1 - data.exchangeFingerprint.kycExposure) * 100).toFixed(0)}%`,
      icon: Bank,
      interpretation: data.exchangeFingerprint.kycExposure > 0.5 ? "High KYC exposure through exchanges" : "Low exchange exposure",
    },
  ];

  // Higher value = better privacy = green
  const getStatusIcon = (value: number) => {
    if (value >= 70) return <CheckCircle className="text-success" size={16} weight="bold" />;
    if (value >= 40) return <WarningCircle className="text-warning" size={16} weight="bold" />;
    return <XCircle className="text-critical" size={16} weight="bold" />;
  };

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-success";
    if (value >= 40) return "bg-warning";
    return "bg-critical";
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Graph className="text-primary" size={24} weight="bold" />
        Privacy Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.5 }}
            className="glass-card p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <metric.icon className="text-primary" size={20} weight="bold" />
                <span className="font-medium text-sm">{metric.name}</span>
              </div>
              {getStatusIcon(metric.value)}
            </div>

            <div className="text-3xl font-bold mb-3">{metric.displayValue}</div>

            <div className="h-1.5 bg-muted overflow-hidden mb-3">
              <motion.div
                className={`h-full ${getProgressColor(metric.value)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metric.value, 100)}%` }}
                transition={{ delay: index * 0.05 + 0.7, duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <p className="text-xs text-muted-foreground">{metric.interpretation}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

import { motion } from "framer-motion";
import { 
  Shuffle, Lock, Users, Network, Clock, Eye, 
  Fingerprint, Layers, AlertTriangle, Building, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
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
  inverted?: boolean;
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const metrics: Metric[] = [
    {
      name: "Transaction Randomness",
      value: data.entropy.totalEntropy * 100,
      displayValue: `${(data.entropy.totalEntropy * 100).toFixed(0)}%`,
      icon: Shuffle,
      interpretation: data.entropy.totalEntropy > 0.7 ? "High randomness makes patterns hard to detect" : "Low randomness reveals behavioral patterns",
    },
    {
      name: "Data Leakage",
      value: data.mutualInformation ? (1 - data.mutualInformation) * 100 : 75,
      displayValue: data.mutualInformation ? `${((1 - data.mutualInformation) * 100).toFixed(0)}%` : "N/A",
      icon: Lock,
      interpretation: "Amount of information leaked through transactions",
      inverted: true,
    },
    {
      name: "Privacy Strength",
      value: data.differentialPrivacy ? Math.max(0, 100 - data.differentialPrivacy.epsilon * 10) : 60,
      displayValue: data.differentialPrivacy ? `ε=${data.differentialPrivacy.epsilon.toFixed(2)}` : "N/A",
      icon: Lock,
      interpretation: "Lower epsilon means stronger privacy guarantees",
      inverted: true,
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
      value: data.advancedClustering ? (1 - data.advancedClustering) * 100 : data.graph.graphPrivacyScore,
      displayValue: `${data.graph.graphPrivacyScore}%`,
      icon: Network,
      interpretation: "Resistance to wallet clustering algorithms",
      inverted: true,
    },
    {
      name: "Timing Privacy",
      value: (1 - Math.abs(data.temporalAnalysis.autocorrelation)) * 100,
      displayValue: `${((1 - Math.abs(data.temporalAnalysis.autocorrelation)) * 100).toFixed(0)}%`,
      icon: Clock,
      interpretation: Math.abs(data.temporalAnalysis.autocorrelation) < 0.3 ? "No detectable timing patterns" : "Regular timing patterns detected",
    },
    {
      name: "Network Visibility",
      value: Math.max(0, 100 - data.networkCentrality.networkVisibility * 50),
      displayValue: `${data.networkCentrality.networkVisibility.toFixed(2)}`,
      icon: Eye,
      interpretation: "How visible you are in the transaction graph",
      inverted: true,
    },
    {
      name: "Privacy Tool Usage",
      value: data.mixerDetection.mixerUsageProbability * 100,
      displayValue: `${(data.mixerDetection.mixerUsageProbability * 100).toFixed(0)}%`,
      icon: Layers,
      interpretation: data.mixerDetection.mixerUsageProbability > 0.3 ? "Privacy tools detected in history" : "No privacy tool usage detected",
    },
    {
      name: "Cross-chain Privacy",
      value: data.crossChain?.bridgeUsageDetected ? 70 : 30,
      displayValue: data.crossChain?.bridgeUsageDetected ? "Detected" : "None",
      icon: Fingerprint,
      interpretation: data.crossChain?.bridgeUsageDetected ? "Bridge usage may link identities" : "No cross-chain activity detected",
    },
    {
      name: "Dust Attack Status",
      value: data.dustAttack.dustAttackDetected ? 20 : 100,
      displayValue: data.dustAttack.dustAttackDetected ? `${data.dustAttack.dustTransactionsReceived} txns` : "Clean",
      icon: AlertTriangle,
      interpretation: data.dustAttack.dustAttackDetected ? "You've received dust attack transactions" : "No dust attacks detected",
    },
    {
      name: "Exchange Exposure",
      value: (1 - data.exchangeFingerprint.kycExposure) * 100,
      displayValue: `${(data.exchangeFingerprint.kycExposure * 100).toFixed(0)}%`,
      icon: Building,
      interpretation: data.exchangeFingerprint.kycExposure > 0.5 ? "High KYC exposure through exchanges" : "Low exchange exposure",
      inverted: true,
    },
  ];

  const getStatusIcon = (value: number, inverted?: boolean) => {
    const score = inverted ? 100 - value : value;
    if (score >= 70) return <CheckCircle className="text-success" size={16} />;
    if (score >= 40) return <AlertCircle className="text-warning" size={16} />;
    return <XCircle className="text-critical" size={16} />;
  };

  const getProgressColor = (value: number, inverted?: boolean) => {
    const score = inverted ? 100 - value : value;
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
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
        <Network className="text-primary" size={24} />
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
                <metric.icon className="text-primary" size={20} />
                <span className="font-medium text-sm">{metric.name}</span>
              </div>
              {getStatusIcon(metric.value, metric.inverted)}
            </div>

            <div className="text-3xl font-bold mb-3">{metric.displayValue}</div>

            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                className={`h-full ${getProgressColor(metric.value, metric.inverted)}`}
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

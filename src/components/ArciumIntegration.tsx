import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Check, ExternalLink, Cpu, Shield, Eye, EyeOff } from "lucide-react";
import { PrivacyData } from "@/types/privacy";

interface ArciumIntegrationProps {
  data: PrivacyData;
}

function calculateArciumProjection(data: PrivacyData) {
  const currentScore = data.advancedPrivacyScore;

  // Arcium MPC-specific improvements
  const temporalPrivacyImprovement = Math.abs(data.temporalAnalysis.autocorrelation) > 0.3 ? 20 : 10;
  const computePrivacyImprovement = 25;
  const defiPrivacyImprovement = data.exchangeFingerprint.exchangeInteractionDetected ? 15 : 5;

  const totalImprovement = (temporalPrivacyImprovement + computePrivacyImprovement + defiPrivacyImprovement) * 0.5;
  const projectedScore = Math.min(currentScore + totalImprovement, 95);

  return {
    currentScore,
    projectedScore,
    improvement: projectedScore - currentScore,
    features: [
      {
        icon: "EyeOff",
        title: "Confidential DeFi",
        description: "Execute swaps and trades without revealing amounts or strategies",
        improvement: "+25%",
      },
      {
        icon: "Cpu",
        title: "MPC Computation",
        description: "Process encrypted data across distributed nodes",
        improvement: "+20%",
      },
      {
        icon: "Shield",
        title: "Hidden Timing",
        description: "Mask transaction patterns and timing signatures",
        improvement: "+15%",
      },
    ],
    useCases: [
      "Dark pools for large trades without slippage",
      "Private lending with hidden collateral ratios",
      "Confidential voting and governance",
      "MEV-resistant order execution",
      "Private portfolio management",
    ],
  };
}

export function ArciumIntegration({ data }: ArciumIntegrationProps) {
  const projection = useMemo(() => calculateArciumProjection(data), [data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-critical";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header with Arcium branding */}
        <div className="bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Lock className="text-purple-400" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Arcium Integration
                <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Hackathon Sponsor
                </span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Multi-Party Computation for truly confidential transactions
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* What is MPC */}
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Cpu size={16} className="text-purple-400" />
              What is Multi-Party Computation?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MPC allows multiple parties to jointly compute functions over their inputs while keeping those inputs private.
              With Arcium, your transaction data is split across nodes - no single party ever sees the complete picture,
              yet the computation is still verifiable and correct.
            </p>
          </div>

          {/* Score Comparison */}
          <div className="flex items-center justify-center gap-4 md:gap-8 p-6 rounded-xl bg-muted/20 border border-border/30">
            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Current</p>
              <motion.p
                className={`text-4xl md:text-5xl font-bold ${getScoreColor(projection.currentScore)}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {projection.currentScore}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <ArrowRight className="text-purple-400" size={24} />
              <span className="text-xs text-success font-bold mt-1">
                +{projection.improvement.toFixed(0)}
              </span>
            </motion.div>

            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">With Arcium</p>
              <motion.p
                className="text-4xl md:text-5xl font-bold text-purple-400"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {projection.projectedScore.toFixed(0)}
              </motion.p>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Privacy Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projection.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      {feature.icon === "EyeOff" && <EyeOff size={16} className="text-purple-400" />}
                      {feature.icon === "Cpu" && <Cpu size={16} className="text-purple-400" />}
                      {feature.icon === "Shield" && <Shield size={16} className="text-purple-400" />}
                    </div>
                    <span className="text-xs font-bold text-success">{feature.improvement}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Use Cases Enabled</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {projection.useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.6 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Check size={14} className="text-purple-400 shrink-0" />
                  <span className="text-muted-foreground">{useCase}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <motion.a
            href="https://arcium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:from-purple-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock size={20} />
            Explore Arcium MPC
            <ExternalLink size={16} />
          </motion.a>

          <p className="text-xs text-muted-foreground text-center">
            Arcium is a hackathon sponsor offering $10,000 for End-to-End Private DeFi.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

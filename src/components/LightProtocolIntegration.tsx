import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Check, ExternalLink, Zap, TrendingUp } from "lucide-react";
import { PrivacyData } from "@/types/privacy";
import { calculateLightProtocolProjection } from "@/lib/privacyProjections";

interface LightProtocolIntegrationProps {
  data: PrivacyData;
}

export function LightProtocolIntegration({ data }: LightProtocolIntegrationProps) {
  const projection = useMemo(() => calculateLightProtocolProjection(data), [data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-critical";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header with Light Protocol branding */}
        <div className="bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent p-6 border-b border-cyan-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <Shield className="text-cyan-400" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Light Protocol Integration
                </h2>
                <p className="text-muted-foreground text-sm">
                  ZK shielding can dramatically improve your privacy score
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Comparison Mini */}
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
              <ArrowRight className="text-primary" size={24} />
              <span className="text-xs text-success font-bold mt-1">
                +{projection.improvement.toFixed(0)}
              </span>
            </motion.div>

            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Projected</p>
              <motion.p
                className="text-4xl md:text-5xl font-bold text-success"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {projection.projectedScore.toFixed(0)}
              </motion.p>
            </div>
          </div>

          {/* Metrics Improvement */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Projected Metric Improvements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projection.metrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="p-3 rounded-lg bg-muted/20 border border-border/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{metric.name}</span>
                    <span className="text-xs text-success font-bold">
                      +{metric.improvement.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-muted-foreground/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.current}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                      />
                    </div>
                    <ArrowRight size={12} className="text-muted-foreground" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-success"
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.projected}%` }}
                        transition={{ delay: index * 0.1 + 0.7, duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{metric.current.toFixed(0)}%</span>
                    <span className="text-success">{metric.projected.toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Key Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {projection.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.6 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <Check size={16} className="text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How to Shield */}
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <h3 className="text-sm font-semibold mb-3">How to Shield Your Assets</h3>
            <div className="space-y-2">
              {projection.shieldingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.8 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              href="https://lightprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield size={20} />
              Explore Light Protocol
              <ExternalLink size={16} />
            </motion.a>
            <motion.a
              href="https://www.zkcompression.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-cyan-500/30 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn About ZK Compression
              <ExternalLink size={16} />
            </motion.a>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Light Protocol enables ZK shielded transactions on Solana. Start shielding to improve your privacy score.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

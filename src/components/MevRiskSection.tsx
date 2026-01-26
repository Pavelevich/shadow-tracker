import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Warning,
  TrendUp,
  Clock,
  Target,
  ArrowSquareOut,
  CaretRight,
  Lightning,
} from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";
import {
  calculateMevRisk,
  getMevRiskColor,
  getMevRiskDescription,
  MevRiskAnalysis,
} from "@/lib/mevAnalysis";

interface MevRiskSectionProps {
  data: PrivacyData;
}

export function MevRiskSection({ data }: MevRiskSectionProps) {
  const mevAnalysis = useMemo(() => calculateMevRisk(data), [data]);

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <Warning className="text-red-500" size={28} weight="bold" />;
      case "HIGH":
        return <Warning className="text-amber-500" size={28} weight="bold" />;
      case "MEDIUM":
        return <Shield className="text-yellow-500" size={28} weight="bold" />;
      default:
        return <Shield className="text-green-500" size={28} weight="bold" />;
    }
  };

  const riskColor = getMevRiskColor(mevAnalysis.riskLevel);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{
            background: `linear-gradient(to right, ${riskColor}20, transparent)`,
            borderColor: `${riskColor}30`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 border"
              style={{
                backgroundColor: `${riskColor}20`,
                borderColor: `${riskColor}30`,
              }}
            >
              {getRiskIcon(mevAnalysis.riskLevel)}
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                MEV Risk Analysis
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5">
                  NEW
                </span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Vulnerability to sandwich attacks and front-running
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Risk Score Display */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {/* Score Circle */}
            <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] flex-shrink-0">
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full transform -rotate-90"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={riskColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{
                    strokeDashoffset: 440 - (440 * mevAnalysis.riskScore) / 100,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-2xl sm:text-3xl md:text-4xl font-bold"
                  style={{ color: riskColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {mevAnalysis.riskScore}
                </motion.span>
                <span className="text-[10px] md:text-xs text-muted-foreground">RISK SCORE</span>
              </div>
            </div>

            {/* Risk Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-3 py-1 text-sm font-bold"
                    style={{
                      backgroundColor: `${riskColor}20`,
                      color: riskColor,
                    }}
                  >
                    {mevAnalysis.riskLevel} RISK
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getMevRiskDescription(mevAnalysis.riskLevel)}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendUp size={14} className="text-muted-foreground" weight="bold" />
                    <span className="text-xs text-muted-foreground">Est. Exposure</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: riskColor }}>
                    ${mevAnalysis.stats.estimatedExposureUsd.toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightning size={14} className="text-muted-foreground" weight="bold" />
                    <span className="text-xs text-muted-foreground">High-Risk Swaps</span>
                  </div>
                  <p className="text-lg font-bold">
                    {mevAnalysis.stats.highRiskSwapPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vulnerability Factors */}
          {mevAnalysis.vulnerabilityFactors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Target size={16} weight="bold" />
                Vulnerability Factors
              </h3>
              <div className="space-y-2">
                {mevAnalysis.vulnerabilityFactors.slice(0, 4).map((factor, i) => (
                  <motion.div
                    key={factor.factor}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-center justify-between p-3 bg-muted/10 border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2"
                        style={{
                          backgroundColor:
                            factor.severity === "HIGH"
                              ? "#ef4444"
                              : factor.severity === "MEDIUM"
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{factor.factor}</p>
                        <p className="text-xs text-muted-foreground">
                          {factor.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color:
                          factor.severity === "HIGH"
                            ? "#ef4444"
                            : factor.severity === "MEDIUM"
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    >
                      +{factor.points}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* What is MEV? */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Warning size={16} className="text-amber-400" weight="bold" />
              What are Sandwich Attacks?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MEV bots monitor pending transactions and "sandwich" your swap by placing
              a buy order before yours (front-run) and a sell order after (back-run).
              This extracts value from your trade. In 2025, over{" "}
              <span className="text-amber-400 font-semibold">$500M</span> was extracted
              from Solana users through sandwich attacks.
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Shield size={16} weight="bold" />
              Protection Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mevAnalysis.recommendations.slice(0, 4).map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="p-3 bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor:
                              rec.priority === "HIGH"
                                ? "#ef444430"
                                : rec.priority === "MEDIUM"
                                ? "#f59e0b30"
                                : "#22c55e30",
                            color:
                              rec.priority === "HIGH"
                                ? "#ef4444"
                                : rec.priority === "MEDIUM"
                                ? "#f59e0b"
                                : "#22c55e",
                          }}
                        >
                          {rec.priority}
                        </span>
                        {rec.tool && (
                          <span className="text-[10px] text-muted-foreground">
                            via {rec.tool}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{rec.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.impact}
                      </p>
                    </div>
                    {rec.url && (
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-muted/30 hover:bg-primary/20 transition-colors shrink-0"
                      >
                        <ArrowSquareOut size={14} className="text-muted-foreground" weight="bold" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.a
            href="https://jito.wtf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield size={20} weight="bold" />
            Protect with Jito Bundles
            <CaretRight size={16} weight="bold" />
          </motion.a>

          <p className="text-xs text-muted-foreground text-center">
            MEV protection keeps your transactions private from sandwich bots
          </p>
        </div>
      </div>
    </motion.section>
  );
}

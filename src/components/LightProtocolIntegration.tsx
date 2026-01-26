import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Check, ArrowSquareOut, Lightning, TrendUp } from "@phosphor-icons/react";
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
              <div className="p-3 bg-cyan-500/20 border border-cyan-500/30">
                <Shield className="text-cyan-400" size={28} weight="duotone" />
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
          <div className="flex items-center justify-center gap-4 md:gap-8 p-6 bg-muted/20 border border-border/30">
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
              <TrendUp size={16} className="text-primary" weight="bold" />
              Projected Metric Improvements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projection.metrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="p-3 bg-muted/20 border border-border/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{metric.name}</span>
                    <span className="text-xs text-success font-bold">
                      +{metric.improvement.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-muted-foreground/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.current}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                      />
                    </div>
                    <ArrowRight size={12} className="text-muted-foreground" weight="bold" />
                    <div className="flex-1 h-2 bg-muted overflow-hidden">
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
              <Lightning size={16} className="text-primary" weight="bold" />
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
                  <Check size={16} className="text-success shrink-0 mt-0.5" weight="bold" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SDK Code Example */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightning size={16} className="text-cyan-400" weight="bold" />
              Quick Start - Shield Your SOL
            </h3>
            <div className="bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-cyan-300">
{`import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";

// Connect to Light Protocol RPC
const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC);

// Create compressed token (private)
const { mint, transactionSignature } = await createMint(
  connection,
  payer,
  payer.publicKey,  // mint authority
  9                 // decimals
);

// Transfer privately (shielded)
await transfer(
  connection,
  payer,
  mint,
  amount,           // amount to transfer
  owner,            // current owner
  recipient         // destination (shielded)
);`}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Install: <code className="bg-black/30 px-2 py-0.5 rounded text-cyan-400">npm i @lightprotocol/stateless.js @lightprotocol/compressed-token</code>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              href="https://lightprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield size={20} weight="bold" />
              Explore Light Protocol
              <ArrowSquareOut size={16} weight="bold" />
            </motion.a>
            <motion.a
              href="https://www.zkcompression.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-muted/30 border border-cyan-500/30 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn About ZK Compression
              <ArrowSquareOut size={16} weight="bold" />
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

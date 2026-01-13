import { useMemo } from "react";
import { motion } from "framer-motion";
import { Database, Zap, Code, Activity, Shield, ExternalLink, Check, Server } from "lucide-react";
import { PrivacyData } from "@/types/privacy";

interface HeliusIntegrationProps {
  data: PrivacyData;
}

export function HeliusIntegration({ data }: HeliusIntegrationProps) {
  const heliusFeatures = useMemo(() => [
    {
      icon: Database,
      title: "Enhanced Transactions API",
      description: "Parsed transaction data with token transfers, program interactions, and account changes",
      dataPoint: `${data.transactionCount} transactions analyzed`,
    },
    {
      icon: Activity,
      title: "Real-time Data",
      description: "Live blockchain data with sub-second latency for accurate privacy scoring",
      dataPoint: "< 500ms response time",
    },
    {
      icon: Code,
      title: "Parsed Instructions",
      description: "Decoded program instructions reveal interaction patterns and counterparties",
      dataPoint: `${data.graph.uniqueCounterparties} counterparties identified`,
    },
    {
      icon: Server,
      title: "Reliable Infrastructure",
      description: "99.9% uptime RPC infrastructure ensures consistent analysis availability",
      dataPoint: "Enterprise-grade reliability",
    },
  ], [data]);

  const metricsFromHelius = [
    "Transaction timing patterns (temporal analysis)",
    "Token transfer amounts and frequencies",
    "Program interaction fingerprints",
    "Counterparty graph construction",
    "Exchange deposit/withdrawal detection",
    "Dust transaction identification",
    "Round number amount analysis",
    "Cross-program invocation tracking",
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header with Helius branding */}
        <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent p-6 border-b border-orange-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
                <svg width="28" height="28" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="128" cy="128" r="128" fill="#E84142"/>
                  <path d="M128 64L176 160H80L128 64Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Powered by Helius
                </h2>
                <p className="text-muted-foreground text-sm">
                  100% of privacy analysis data sourced from Helius Enhanced API
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Why Helius */}
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Zap size={16} className="text-orange-400" />
              Why Helius is Essential
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Without Helius, there is no SolPrivacy. Standard RPC nodes only provide raw transaction data.
              Helius Enhanced Transactions API provides <span className="text-orange-400 font-medium">parsed, enriched data</span> that
              enables our privacy scoring algorithms to identify patterns, detect attacks, and calculate
              information-theoretic metrics in real-time.
            </p>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Helius Capabilities Used</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heliusFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0">
                      <feature.icon size={16} className="text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                      <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                        {feature.dataPoint}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Metrics Derived from Helius */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Privacy Metrics from Helius Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {metricsFromHelius.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Check size={14} className="text-orange-400 shrink-0" />
                  <span className="text-muted-foreground">{metric}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* API Endpoint */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Code size={16} className="text-muted-foreground" />
              Primary API Endpoint
            </h3>
            <code className="text-xs font-mono text-orange-400 bg-black/30 px-3 py-2 rounded-lg block overflow-x-auto">
              GET https://api.helius.xyz/v0/addresses/{"{address}"}/transactions?api-key={"{key}"}
            </code>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              href="https://dev.helius.xyz/dashboard/app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap size={20} />
              Get Free API Key
              <ExternalLink size={16} />
            </motion.a>
            <motion.a
              href="https://docs.helius.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-orange-500/30 text-orange-400 font-semibold hover:bg-orange-500/10 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Read Documentation
              <ExternalLink size={16} />
            </motion.a>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            SolPrivacy is built 100% on <span className="text-orange-400 font-semibold">Helius infrastructure</span> for reliable, real-time blockchain data.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

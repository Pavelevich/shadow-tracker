import { motion } from "framer-motion";
import { Eye, Terminal, Shield, Clock, Users } from "@phosphor-icons/react";
import { PrivacyData, AttackScenario } from "@/types/privacy";

interface AttackSimulationProps {
  data: PrivacyData;
}

export function AttackSimulation({ data }: AttackSimulationProps) {
  const { attackSimulation, graph } = data;

  const getRiskColor = (probability: number) => {
    if (probability >= 0.7) return "bg-critical";
    if (probability >= 0.4) return "bg-warning";
    return "bg-success";
  };

  const getRiskBadge = (probability: number) => {
    if (probability >= 0.7) return { text: "CRITICAL", class: "bg-critical/20 text-critical border-critical/30" };
    if (probability >= 0.4) return { text: "HIGH", class: "bg-warning/20 text-warning border-warning/30" };
    if (probability >= 0.2) return { text: "MEDIUM", class: "bg-warning/20 text-warning/80 border-warning/30" };
    return { text: "LOW", class: "bg-success/20 text-success border-success/30" };
  };

  const scenarios = attackSimulation.scenarios.slice(0, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="py-8"
    >
      <div className="terminal-bg glass-card-strong overflow-hidden">
        {/* Terminal header */}
        <div className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 p-4 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-critical/80" />
            <div className="w-3 h-3 bg-warning/80" />
            <div className="w-3 h-3 bg-success/80" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Terminal size={16} weight="bold" />
            <span className="font-mono text-sm">attack_simulator.exe</span>
          </div>
        </div>

        {/* Header content */}
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-critical/10 border border-critical/20">
              <Eye className="text-critical" size={24} weight="bold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">What Attackers See</h2>
              <p className="text-muted-foreground">Simulated attack vectors against your wallet</p>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-muted/30 border border-border/30">
              <div className="flex items-center gap-3">
                <Clock className="text-warning" size={20} weight="bold" />
                <span className="text-muted-foreground text-sm">Time to De-anonymize</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-warning">
                {attackSimulation.estimatedTimeToDeAnon}
              </p>
            </div>
            <div className="p-4 bg-muted/30 border border-border/30">
              <div className="flex items-center gap-3">
                <Eye className="text-critical" size={20} weight="bold" />
                <span className="text-muted-foreground text-sm">De-anonymization Probability</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-critical">
                {(attackSimulation.deAnonymizationProbability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Attack scenarios */}
        <div className="p-6">
          <h3 className="font-mono text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">$</span> scanning attack vectors...
          </h3>

          <div className="space-y-4">
            {scenarios.map((scenario, index) => {
              const risk = getRiskBadge(scenario.probability);
              return (
                <motion.div
                  key={scenario.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="p-4 bg-muted/20 border border-border/30"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium border ${risk.class}`}>
                          {risk.text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-foreground">
                      {(scenario.probability * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-muted overflow-hidden mb-3">
                    <motion.div
                      className={`h-full ${getRiskColor(scenario.probability)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${scenario.probability * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.6, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {/* Mitigation */}
                  <div className="flex items-start gap-2 text-sm">
                    <Shield className="text-success shrink-0 mt-0.5" size={14} weight="bold" />
                    <span className="text-success/90">{scenario.mitigation}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detected clusters */}
        {graph.detectedClusters.length > 0 && (
          <div className="p-6 border-t border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-warning" size={20} weight="bold" />
              <h3 className="font-semibold text-warning">Linked Wallets Detected</h3>
            </div>
            <div className="space-y-3">
              {graph.detectedClusters.map((cluster, index) => (
                <div key={index} className="p-3 bg-warning/10 border border-warning/20">
                  <p className="text-sm text-muted-foreground mb-2">{cluster.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {cluster.wallets.slice(0, 3).map((wallet) => (
                      <span key={wallet} className="font-mono text-xs bg-muted px-2 py-1">
                        {wallet.slice(0, 8)}...{wallet.slice(-4)}
                      </span>
                    ))}
                    {cluster.wallets.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{cluster.wallets.length - 3} more
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-warning mt-2">
                    Confidence: {(cluster.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

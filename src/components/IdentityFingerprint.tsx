import { motion } from "framer-motion";
import { Fingerprint, Warning, Users, TrendUp } from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";

interface IdentityFingerprintProps {
  data: PrivacyData;
}

export function IdentityFingerprint({ data }: IdentityFingerprintProps) {
  const { kAnonymity, graph } = data;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "text-critical";
      case "HIGH": return "text-critical";
      case "MEDIUM": return "text-warning";
      default: return "text-success";
    }
  };

  const getUniquenessColor = (uniqueness: number) => {
    if (uniqueness >= 0.8) return "bg-critical";
    if (uniqueness >= 0.5) return "bg-warning";
    return "bg-success";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Fingerprint className="text-primary" size={24} weight="bold" />
        Identity Fingerprint
      </h2>

      <div className="glass-card p-6">
        {/* Warning banner */}
        <div className="bg-warning/10 border border-warning/20 p-4 mb-6 flex items-start gap-3">
          <Warning className="text-warning shrink-0 mt-0.5" size={20} weight="bold" />
          <div>
            <p className="text-sm text-warning font-medium">What makes you identifiable?</p>
            <p className="text-xs text-muted-foreground mt-1">
              These quasi-identifiers can be combined to narrow down your identity, even without knowing your address directly.
            </p>
          </div>
        </div>

        {/* K-Anonymity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-primary" size={18} weight="bold" />
              <span className="text-muted-foreground text-sm">Anonymity Set</span>
            </div>
            <p className="text-3xl font-bold">k={kAnonymity.kValue}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {kAnonymity.kValue} similar wallets
            </p>
          </div>

          <div className="p-4 bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendUp className="text-primary" size={18} weight="bold" />
              <span className="text-muted-foreground text-sm">Anonymity Score</span>
            </div>
            <p className="text-3xl font-bold">{kAnonymity.kAnonymityScore.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Overall anonymity level
            </p>
          </div>

          <div className="p-4 bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3 mb-2">
              <Warning className={getRiskColor(kAnonymity.reIdentificationRisk)} size={18} weight="bold" />
              <span className="text-muted-foreground text-sm">Re-ID Risk</span>
            </div>
            <p className={`text-3xl font-bold ${getRiskColor(kAnonymity.reIdentificationRisk)}`}>
              {kAnonymity.reIdentificationRisk}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Risk of being identified
            </p>
          </div>
        </div>

        {/* Quasi-Identifiers */}
        {kAnonymity.quasiIdentifiers && kAnonymity.quasiIdentifiers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Your Unique Traits
            </h3>
            <div className="space-y-3">
              {kAnonymity.quasiIdentifiers.map((qi, index) => (
                <motion.div
                  key={qi.identifier}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="p-4 bg-muted/20 border border-border/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{qi.identifier}</span>
                    <span className={`text-sm font-mono ${qi.uniqueness > 0.7 ? 'text-critical' : qi.uniqueness > 0.4 ? 'text-warning' : 'text-success'}`}>
                      {(qi.uniqueness * 100).toFixed(0)}% unique
                    </span>
                  </div>
                  <div className="h-2 bg-muted overflow-hidden mb-2">
                    <motion.div
                      className={getUniquenessColor(qi.uniqueness)}
                      initial={{ width: 0 }}
                      animate={{ width: `${qi.uniqueness * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.6, duration: 0.8 }}
                      style={{ height: '100%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{qi.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Interpretation */}
        {kAnonymity.interpretation && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">Analysis: </span>
              {kAnonymity.interpretation}
            </p>
          </div>
        )}

        {/* Graph Stats */}
        {graph.degree > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/20">
              <p className="text-2xl font-bold">{graph.degree}</p>
              <p className="text-xs text-muted-foreground">Unique Contacts</p>
            </div>
            {graph.clusteringCoefficient !== undefined && (
              <div className="text-center p-3 bg-muted/20">
                <p className="text-2xl font-bold">{(graph.clusteringCoefficient * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Clustering</p>
              </div>
            )}
            <div className="text-center p-3 bg-muted/20">
              <p className="text-2xl font-bold">{graph.graphPrivacyScore}%</p>
              <p className="text-xs text-muted-foreground">Graph Privacy</p>
            </div>
            <div className="text-center p-3 bg-muted/20">
              <p className="text-2xl font-bold">{graph.detectedClusters.length}</p>
              <p className="text-xs text-muted-foreground">Linked Clusters</p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

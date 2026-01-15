import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrivacyData } from "@/types/privacy";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

interface ExportPDFProps {
  data: PrivacyData;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0f172a",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#14f195",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#14f195",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  walletSection: {
    marginBottom: 25,
  },
  walletLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 11,
    color: "#e2e8f0",
    fontFamily: "Courier",
  },
  scoreSection: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 20,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLeft: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreRight: {
    alignItems: "flex-end",
  },
  grade: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  riskLevel: {
    fontSize: 12,
    padding: "4 10",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 15,
    marginTop: 10,
  },
  attackGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  attackCard: {
    backgroundColor: "#1e293b",
    borderRadius: 6,
    padding: 12,
    width: "48%",
    marginBottom: 8,
  },
  attackName: {
    fontSize: 10,
    color: "#e2e8f0",
    marginBottom: 6,
  },
  attackProb: {
    fontSize: 18,
    fontWeight: "bold",
  },
  attackBar: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    marginTop: 6,
  },
  attackBarFill: {
    height: 4,
    borderRadius: 2,
  },
  attackExplanation: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 4,
    lineHeight: 1.3,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  metricCard: {
    backgroundColor: "#1e293b",
    borderRadius: 6,
    padding: 12,
    width: "31%",
  },
  metricLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  recommendation: {
    backgroundColor: "#1e293b",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recPriority: {
    fontSize: 8,
    fontWeight: "bold",
    padding: "2 6",
    borderRadius: 3,
    marginRight: 10,
  },
  recText: {
    fontSize: 10,
    color: "#e2e8f0",
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#64748b",
  },
  footerLink: {
    fontSize: 8,
    color: "#14f195",
  },
});

// Attack explanations for PDF
const ATTACK_EXPLANATIONS: Record<string, string> = {
  "Dust Tracking Attack": "Attackers send tiny amounts (dust) to trace your wallet activity and link your addresses together.",
  "Amount Fingerprinting": "Unique transaction amounts can be used to identify you across different wallets and platforms.",
  "Graph Topology Attack": "Analysis of your transaction network patterns to identify your main wallet and related addresses.",
  "Exchange KYC Correlation": "Your CEX deposits/withdrawals can be linked to your identity through exchange KYC records.",
  "Temporal Fingerprinting": "Your transaction timing patterns can reveal your timezone and daily habits.",
  "Quasi-Identifier Correlation": "Combining multiple weak identifiers to uniquely identify you with high confidence.",
};

// Helper functions
const getScoreColor = (score: number): string => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#14f195";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "HIGH": return "#ef4444";
    case "MEDIUM": return "#f59e0b";
    default: return "#22c55e";
  }
};

const getRiskBgColor = (risk: string): string => {
  switch (risk) {
    case "CRITICAL": return "#7f1d1d";
    case "HIGH": return "#78350f";
    case "MEDIUM": return "#713f12";
    case "LOW": return "#14532d";
    default: return "#1e293b";
  }
};

// PDF Document Component
const PrivacyReportPDF = ({ data }: { data: PrivacyData }) => {
  const scoreColor = getScoreColor(data.advancedPrivacyScore);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      {/* PAGE 1: Score & Attack Simulation */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SOLPRIVACY</Text>
          <Text style={styles.subtitle}>Wallet Privacy Analysis Report</Text>
        </View>

        {/* Wallet Address */}
        <View style={styles.walletSection}>
          <Text style={styles.walletLabel}>WALLET ADDRESS</Text>
          <Text style={styles.walletAddress}>{data.address}</Text>
        </View>

        {/* Privacy Solution CTA */}
        <View style={{ marginBottom: 20, padding: 15, backgroundColor: "#1e293b", borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#a855f7" }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: "#a855f7", marginBottom: 6 }}>Improve Your Privacy</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", marginBottom: 8 }}>
            Use encrypt.trade for truly private swaps and transfers on Solana. Break on-chain links completely.
          </Text>
          <Text style={{ fontSize: 10, color: "#a855f7" }}>https://encrypt.trade</Text>
        </View>

        {/* Privacy Score */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>PRIVACY SCORE</Text>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {data.advancedPrivacyScore}
            </Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={[styles.grade, { color: scoreColor }]}>
              Grade {data.grade}
            </Text>
            <Text
              style={[
                styles.riskLevel,
                {
                  backgroundColor: getRiskBgColor(data.riskLevel),
                  color: scoreColor,
                },
              ]}
            >
              {data.riskLevel} RISK
            </Text>
          </View>
        </View>

        {/* Attack Simulation */}
        <Text style={styles.sectionTitle}>Attack Simulation Results</Text>
        <View style={styles.attackGrid}>
          {data.attackSimulation.scenarios.slice(0, 6).map((attack, i) => {
            const prob = attack.probability * 100;
            const color = prob >= 70 ? "#ef4444" : prob >= 40 ? "#f59e0b" : "#22c55e";
            const explanation = ATTACK_EXPLANATIONS[attack.name] || "";
            return (
              <View key={i} style={styles.attackCard}>
                <Text style={styles.attackName}>{attack.name}</Text>
                <Text style={[styles.attackProb, { color }]}>{prob.toFixed(0)}%</Text>
                <View style={styles.attackBar}>
                  <View
                    style={[
                      styles.attackBarFill,
                      { width: `${prob}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                {explanation && (
                  <Text style={styles.attackExplanation}>{explanation}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Page 1 Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Page 1 of 3</Text>
          <Text style={styles.footerLink}>https://solprivacy.xyz</Text>
        </View>
      </Page>

      {/* PAGE 2: Metrics & Recommendations */}
      <Page size="A4" style={styles.page}>
        {/* Mini Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.logo, { fontSize: 18 }]}>SOLPRIVACY</Text>
          <Text style={[styles.walletAddress, { fontSize: 9 }]}>{data.address}</Text>
        </View>

        {/* Key Metrics */}
        <Text style={styles.sectionTitle}>Key Privacy Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TOTAL ENTROPY</Text>
            <Text style={styles.metricValue}>{data.entropy.totalEntropy.toFixed(3)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>K-ANONYMITY</Text>
            <Text style={styles.metricValue}>{data.kAnonymity.kValue}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>GRAPH PRIVACY</Text>
            <Text style={styles.metricValue}>{data.graph?.graphPrivacyScore || 0}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>EXCHANGE EXPOSURE</Text>
            <Text style={styles.metricValue}>{(data.exchangeFingerprint.kycExposure * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DUST VULNERABILITY</Text>
            <Text style={styles.metricValue}>{(data.dustAttack.dustVulnerability * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>NETWORK VISIBILITY</Text>
            <Text style={styles.metricValue}>{((data.networkCentrality?.networkVisibility || 0) * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>CLUSTERING RISK</Text>
            <Text style={styles.metricValue}>{((data.advancedClustering?.clusteringVulnerability || 0) * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DIFFERENTIAL PRIVACY</Text>
            <Text style={styles.metricValue}>ε={data.differentialPrivacy?.epsilon?.toFixed(1) || "N/A"}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>MIXER DETECTION</Text>
            <Text style={styles.metricValue}>{((data.mixerDetection?.mixerUsageProbability || 0) * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TIMEZONE</Text>
            <Text style={styles.metricValue}>{data.temporalAnalysis.estimatedTimezone}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TZ CONFIDENCE</Text>
            <Text style={styles.metricValue}>{(data.temporalAnalysis.timezoneConfidence * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DUST RECEIVED</Text>
            <Text style={styles.metricValue}>{data.dustAttack.dustTransactionsReceived}</Text>
          </View>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {data.recommendations.slice(0, 5).map((rec, i) => (
          <View key={i} style={styles.recommendation}>
            <Text
              style={[
                styles.recPriority,
                {
                  backgroundColor: getPriorityColor(rec.priority) + "30",
                  color: getPriorityColor(rec.priority),
                },
              ]}
            >
              {rec.priority}
            </Text>
            <Text style={styles.recText}>{rec.action}</Text>
          </View>
        ))}

        {/* Page 2 Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Page 2 of 3</Text>
          <Text style={styles.footerLink}>https://solprivacy.xyz</Text>
        </View>
      </Page>

      {/* PAGE 3: Attack Explanations & Glossary */}
      <Page size="A4" style={styles.page}>
        {/* Mini Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.logo, { fontSize: 18 }]}>SOLPRIVACY</Text>
          <Text style={{ fontSize: 10, color: "#94a3b8" }}>Privacy Threats Glossary</Text>
        </View>

        {/* Attack Explanations */}
        <Text style={styles.sectionTitle}>Understanding Privacy Threats</Text>

        <View style={{ marginBottom: 12, padding: 12, backgroundColor: "#1e293b", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#ef4444" }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#ef4444", marginBottom: 4 }}>Dust Tracking Attack</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>
            Attackers send tiny amounts of tokens ("dust") to your wallet to trace your activity. When you move these tokens, they can link your addresses together and track your transaction flow. Never interact with unexpected small deposits.
          </Text>
        </View>

        <View style={{ marginBottom: 12, padding: 12, backgroundColor: "#1e293b", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#f59e0b" }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#f59e0b", marginBottom: 4 }}>Amount Fingerprinting</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>
            Unique transaction amounts (like 1.23456789 SOL) act as fingerprints that can identify you across different wallets. Use rounded amounts or common values to blend in with other users.
          </Text>
        </View>

        <View style={{ marginBottom: 12, padding: 12, backgroundColor: "#1e293b", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#a855f7" }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#a855f7", marginBottom: 4 }}>Graph Topology Attack</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>
            Analysis of your transaction network patterns reveals connections between addresses. Tools like Chainalysis and Arkham Intelligence use graph analysis to identify wallet clusters and link them to real identities.
          </Text>
        </View>

        <View style={{ marginBottom: 12, padding: 12, backgroundColor: "#1e293b", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#3b82f6" }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#3b82f6", marginBottom: 4 }}>Exchange KYC Correlation</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>
            Centralized exchanges (CEXs) require identity verification. Any deposits or withdrawals create a link between your wallet and your real identity. This data can be shared with authorities or leaked in breaches.
          </Text>
        </View>

        <View style={{ marginBottom: 12, padding: 12, backgroundColor: "#1e293b", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#14f195" }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#14f195", marginBottom: 4 }}>Temporal Fingerprinting</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>
            Your transaction times reveal your timezone and daily routine. Consistent patterns (like trading at 9 AM EST) can narrow down your location and identity. Randomize your transaction timing.
          </Text>
        </View>

        <View style={{ marginBottom: 12, padding: 12, backgroundColor: "#1e293b", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#ec4899" }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#ec4899", marginBottom: 4 }}>Quasi-Identifier Correlation</Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>
            Combining multiple weak identifiers (timezone + transaction amounts + counterparties + timing) creates a unique fingerprint. Even if no single data point identifies you, the combination often does.
          </Text>
        </View>

        {/* How to protect yourself */}
        <View style={{ marginTop: 10, padding: 15, backgroundColor: "#14532d", borderRadius: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#22c55e", marginBottom: 6 }}>How to Protect Yourself</Text>
          <Text style={{ fontSize: 9, color: "#86efac", lineHeight: 1.5 }}>
            • Use privacy tools like encrypt.trade for private swaps{"\n"}
            • Never interact with dust/unknown tokens{"\n"}
            • Use DEXs instead of CEXs when possible{"\n"}
            • Randomize transaction times and amounts{"\n"}
            • Use separate wallets for different purposes
          </Text>
        </View>

        {/* Page 3 Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {date} • Page 3 of 3</Text>
          <Text style={styles.footerLink}>https://solprivacy.xyz</Text>
        </View>
      </Page>
    </Document>
  );
};

export function ExportPDF({ data }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const blob = await pdf(<PrivacyReportPDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `solprivacy-report-${data.address.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center mb-6"
    >
      <Button
        onClick={exportToPDF}
        disabled={isExporting}
        variant="outline"
        className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
      >
        {isExporting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Generating PDF...
          </>
        ) : exported ? (
          <>
            <Check className="text-success" size={16} />
            Downloaded!
          </>
        ) : (
          <>
            <FileDown size={16} />
            Export Report (PDF)
          </>
        )}
      </Button>
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Search, Loader2, Trophy, AlertTriangle, Shield, Activity, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComparisonData {
  wallet1: {
    address: string;
    score: number;
    grade: string;
    riskLevel: string;
    entropy: number;
    kAnonymity: number;
    exchangeExposure: number;
    dustVulnerability: number;
  };
  wallet2: {
    address: string;
    score: number;
    grade: string;
    riskLevel: string;
    entropy: number;
    kAnonymity: number;
    exchangeExposure: number;
    dustVulnerability: number;
  };
}

export function WalletComparison() {
  const [wallet1, setWallet1] = useState("");
  const [wallet2, setWallet2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "https://solprivacy.xyz";

  const handleCompare = async () => {
    if (!wallet1.trim() || !wallet2.trim()) {
      setError("Please enter both wallet addresses");
      return;
    }

    if (wallet1.trim() === wallet2.trim()) {
      setError("Cannot compare a wallet with itself");
      return;
    }

    setIsLoading(true);
    setError(null);
    setComparison(null);

    try {
      // Fetch both wallets in parallel
      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/api/v3/analyze/${wallet1.trim()}`),
        fetch(`${API_URL}/api/v3/analyze/${wallet2.trim()}`)
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      if (!data1.success || !data2.success) {
        throw new Error("Failed to analyze one or both wallets");
      }

      setComparison({
        wallet1: {
          address: wallet1.trim(),
          score: data1.data.advancedPrivacyScore,
          grade: data1.data.grade,
          riskLevel: data1.data.riskLevel,
          entropy: data1.data.entropy.totalEntropy,
          kAnonymity: data1.data.kAnonymity.kValue,
          exchangeExposure: data1.data.exchangeFingerprint.kycExposure,
          dustVulnerability: data1.data.dustAttack.dustVulnerability,
        },
        wallet2: {
          address: wallet2.trim(),
          score: data2.data.advancedPrivacyScore,
          grade: data2.data.grade,
          riskLevel: data2.data.riskLevel,
          entropy: data2.data.entropy.totalEntropy,
          kAnonymity: data2.data.kAnonymity.kValue,
          exchangeExposure: data2.data.exchangeFingerprint.kycExposure,
          dustVulnerability: data2.data.dustAttack.dustVulnerability,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-critical";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/20 border-success/30";
    if (score >= 60) return "bg-primary/20 border-primary/30";
    if (score >= 40) return "bg-warning/20 border-warning/30";
    return "bg-critical/20 border-critical/30";
  };

  const getWinner = () => {
    if (!comparison) return null;
    if (comparison.wallet1.score > comparison.wallet2.score) return "wallet1";
    if (comparison.wallet2.score > comparison.wallet1.score) return "wallet2";
    return "tie";
  };

  const MetricBar = ({ label, value1, value2, icon: Icon, inverse = false }: {
    label: string;
    value1: number;
    value2: number;
    icon: React.ElementType;
    inverse?: boolean;
  }) => {
    const better1 = inverse ? value1 < value2 : value1 > value2;
    const better2 = inverse ? value2 < value1 : value2 > value1;

    return (
      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <span className={`text-lg font-bold ${better1 ? "text-success" : better2 ? "text-critical" : ""}`}>
              {typeof value1 === "number" ? (value1 > 1 ? value1.toFixed(0) : (value1 * 100).toFixed(0) + "%") : value1}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">vs</div>
          <div className="flex-1 text-center">
            <span className={`text-lg font-bold ${better2 ? "text-success" : better1 ? "text-critical" : ""}`}>
              {typeof value2 === "number" ? (value2 > 1 ? value2.toFixed(0) : (value2 * 100).toFixed(0) + "%") : value2}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <ArrowLeftRight className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Wallet Comparison</h2>
              <p className="text-muted-foreground text-sm">
                Compare privacy scores between two Solana wallets
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Wallet 1</label>
              <Input
                placeholder="Enter first wallet address..."
                value={wallet1}
                onChange={(e) => setWallet1(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Wallet 2</label>
              <Input
                placeholder="Enter second wallet address..."
                value={wallet2}
                onChange={(e) => setWallet2(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Compare Button */}
          <Button
            onClick={handleCompare}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Analyzing wallets...
              </>
            ) : (
              <>
                <Search className="mr-2" size={16} />
                Compare Wallets
              </>
            )}
          </Button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg bg-critical/10 border border-critical/30 flex items-center gap-3"
              >
                <AlertTriangle className="text-critical" size={20} />
                <span className="text-sm text-critical">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {comparison && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Winner Banner */}
                {getWinner() !== "tie" && (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center justify-center gap-3">
                    <Trophy className="text-success" size={20} />
                    <span className="text-success font-semibold">
                      {getWinner() === "wallet1" ? "Wallet 1" : "Wallet 2"} is more private by{" "}
                      {Math.abs(comparison.wallet1.score - comparison.wallet2.score)} points
                    </span>
                  </div>
                )}

                {/* Score Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-xl border ${getScoreBg(comparison.wallet1.score)} text-center`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Wallet 1</p>
                    <p className="font-mono text-xs text-muted-foreground mb-3">
                      {comparison.wallet1.address.slice(0, 8)}...
                    </p>
                    <p className={`text-5xl font-bold ${getScoreColor(comparison.wallet1.score)}`}>
                      {comparison.wallet1.score}
                    </p>
                    <p className="text-lg font-semibold mt-2">{comparison.wallet1.grade}</p>
                    <p className="text-xs text-muted-foreground">{comparison.wallet1.riskLevel}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-xl border ${getScoreBg(comparison.wallet2.score)} text-center`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Wallet 2</p>
                    <p className="font-mono text-xs text-muted-foreground mb-3">
                      {comparison.wallet2.address.slice(0, 8)}...
                    </p>
                    <p className={`text-5xl font-bold ${getScoreColor(comparison.wallet2.score)}`}>
                      {comparison.wallet2.score}
                    </p>
                    <p className="text-lg font-semibold mt-2">{comparison.wallet2.grade}</p>
                    <p className="text-xs text-muted-foreground">{comparison.wallet2.riskLevel}</p>
                  </motion.div>
                </div>

                {/* Detailed Metrics */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">Metric Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricBar
                      label="Entropy"
                      value1={comparison.wallet1.entropy}
                      value2={comparison.wallet2.entropy}
                      icon={Activity}
                    />
                    <MetricBar
                      label="K-Anonymity"
                      value1={comparison.wallet1.kAnonymity}
                      value2={comparison.wallet2.kAnonymity}
                      icon={Users}
                    />
                    <MetricBar
                      label="Exchange Exposure"
                      value1={comparison.wallet1.exchangeExposure}
                      value2={comparison.wallet2.exchangeExposure}
                      icon={Shield}
                      inverse
                    />
                    <MetricBar
                      label="Dust Vulnerability"
                      value1={comparison.wallet1.dustVulnerability}
                      value2={comparison.wallet2.dustVulnerability}
                      icon={Clock}
                      inverse
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

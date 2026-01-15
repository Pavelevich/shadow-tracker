import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  ExternalLink,
  AlertTriangle,
  Building2,
  Database,
  Globe,
  Fingerprint,
  TrendingUp,
  Loader2,
  Shield,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { PrivacyData, SurveillanceData, SurveillanceRisk, DeFiPosition } from "@/types/privacy";
import { getSurveillanceData } from "@/lib/jupiterPortfolio";
import { Button } from "@/components/ui/button";

interface FinancialSurveillanceProps {
  data: PrivacyData;
}

const RISK_COLORS: Record<SurveillanceRisk["severity"], string> = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

const SOURCE_ICONS: Record<string, typeof Eye> = {
  "Blockchain Analytics": Eye,
  "Exchange KYC Records": Building2,
  "DeFi Protocol Analytics": TrendingUp,
  "Arkham Intelligence": Fingerprint,
  "Permanent Blockchain Record": Database,
};

export function FinancialSurveillance({ data }: FinancialSurveillanceProps) {
  const [surveillanceData, setSurveillanceData] = useState<SurveillanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getSurveillanceData(
          data.address,
          data.exchangeFingerprint.exchangeInteractionDetected,
          data.exchangeFingerprint.kycExposure
        );
        setSurveillanceData(result);
      } catch (err) {
        setError("Failed to fetch surveillance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [data.address, data.exchangeFingerprint]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="text-muted-foreground">Analyzing surveillance exposure...</span>
        </div>
      </motion.div>
    );
  }

  if (error || !surveillanceData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Header */}
      <div className="glass-card overflow-hidden border-2 border-red-500/30">
        <div className="bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent p-6 border-b border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
              <Eye className="text-red-400" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Financial Surveillance Exposure
                <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                  Educational
                </span>
              </h2>
              <p className="text-muted-foreground text-sm">
                What adversaries can learn about you from public blockchain data
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Surveillance Risks */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Who Is Watching Your Wallet
            </h3>
            <div className="space-y-3">
              {surveillanceData.surveillanceRisks.map((risk, index) => {
                const Icon = SOURCE_ICONS[risk.source] || Globe;
                return (
                  <motion.div
                    key={risk.source}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/10 border border-border/30 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg shrink-0"
                        style={{ backgroundColor: `${RISK_COLORS[risk.severity]}20` }}
                      >
                        <Icon size={18} style={{ color: RISK_COLORS[risk.severity] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{risk.source}</h4>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                            style={{
                              backgroundColor: `${RISK_COLORS[risk.severity]}20`,
                              color: RISK_COLORS[risk.severity],
                            }}
                          >
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {risk.dataExposed.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-0.5 rounded text-[9px] bg-red-500/10 text-red-400 border border-red-500/20"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Arkham Link */}
          <motion.a
            href={surveillanceData.arkhamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/30 hover:border-orange-500/50 transition-colors group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Fingerprint size={20} className="text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-orange-400">View on Arkham Intelligence</h4>
                <p className="text-xs text-muted-foreground">
                  See what labels and entities are associated with your wallet
                </p>
              </div>
            </div>
            <ExternalLink size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </div>

      {/* Financial Activity Section - Always show */}
      <div className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent p-4 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Financial Activity Exposed</h3>
                <p className="text-xs text-muted-foreground">
                  Your trading activity is visible on-chain
                </p>
              </div>
            </div>
            {surveillanceData.totalDeFiValue > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">DeFi Value</p>
                <p className="font-bold text-blue-400">
                  ${surveillanceData.totalDeFiValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Exchange Interactions */}
          {data.exchangeFingerprint.detectedExchanges.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Building2 size={12} />
                Detected Exchange Interactions
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {data.exchangeFingerprint.detectedExchanges.map((exchange, index) => (
                  <motion.div
                    key={exchange.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-2.5 rounded-lg bg-muted/20 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{exchange.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        exchange.type === "CEX"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        {exchange.type}
                      </span>
                    </div>
                    {(exchange.deposits || exchange.withdrawals) && (
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        {exchange.deposits && <span>↓ {exchange.deposits} deposits</span>}
                        {exchange.withdrawals && <span>↑ {exchange.withdrawals} withdrawals</span>}
                      </div>
                    )}
                    {exchange.kycRequired && (
                      <span className="text-[9px] text-red-400">KYC Required</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Exchange Interactions Message */}
          {data.exchangeFingerprint.detectedExchanges.length === 0 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">No CEX interactions detected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This wallet hasn't interacted with known centralized exchanges, reducing KYC exposure risk.
              </p>
            </div>
          )}

          {/* DeFi Positions */}
          {surveillanceData.defiPositions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Wallet size={12} />
                Active DeFi Positions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {surveillanceData.defiPositions.slice(0, 4).map((position, index) => (
                  <DeFiPositionCard key={index} position={position} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* What Analytics Companies Track - Educational */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Database size={12} />
              What Surveillance Companies Track
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Every swap & trade</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Token balances</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">NFT ownership</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">LP positions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Staking activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Lending positions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Bridge transactions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Wallet connections</span>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <motion.a
              href={`https://jup.ag/portfolio/${data.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors text-blue-400 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
            >
              View on Jupiter
              <ExternalLink size={14} />
            </motion.a>
            <motion.a
              href={`https://step.finance/portfolio?wallet=${data.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors text-purple-400 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
            >
              View on Step Finance
              <ExternalLink size={14} />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Protocol Usage */}
      {surveillanceData.protocolsUsed.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent p-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Globe size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Protocol Fingerprint</h3>
                <p className="text-xs text-muted-foreground">
                  Your unique pattern of protocol usage can identify you
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {surveillanceData.protocolsUsed.map((protocol, index) => (
                <motion.div
                  key={protocol.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-2 rounded-lg bg-muted/20 border border-border/30 flex items-center gap-2"
                >
                  <span className="text-sm font-medium">{protocol.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    {protocol.category}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Solution CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/30"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 shrink-0">
            <Shield size={20} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-300 mb-1">Break Free from Surveillance</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The only way to escape this surveillance is to start fresh with a truly private wallet.
              Regular DEXs and bridges don't break the on-chain link - your history follows you.
            </p>
            <Button
              asChild
              className="bg-purple-500 hover:bg-purple-400 text-white"
            >
              <a
                href="https://encrypt.trade"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Start Fresh with encrypt.trade
                <ChevronRight size={16} />
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeFiPositionCard({ position, index }: { position: DeFiPosition; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-lg bg-muted/10 border border-border/20"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-400">{position.protocol}</span>
        <span className="text-xs text-muted-foreground">{position.type}</span>
      </div>
      <p className="font-bold text-sm">
        ${position.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {position.tokens.slice(0, 3).map((token) => (
          <span key={token} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30">
            {token}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { AlertTriangle, Building, Shield, TrendingDown, ArrowUpRight, ArrowDownRight, Percent, Users, Link2 } from "lucide-react";
import { PrivacyData } from "@/types/privacy";

interface DetailedAlertsProps {
  data: PrivacyData;
}

export function DetailedAlerts({ data }: DetailedAlertsProps) {
  const { dustAttack, exchangeFingerprint } = data;

  const getRiskGradient = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "from-critical/20 via-critical/10 to-transparent";
      case "HIGH": return "from-warning/20 via-warning/10 to-transparent";
      case "MEDIUM": return "from-warning/10 via-warning/5 to-transparent";
      default: return "from-success/10 via-success/5 to-transparent";
    }
  };

  const getRiskBorder = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "border-critical/40";
      case "HIGH": return "border-warning/40";
      case "MEDIUM": return "border-warning/30";
      default: return "border-success/30";
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "bg-critical text-white";
      case "HIGH": return "bg-warning text-black";
      case "MEDIUM": return "bg-warning/80 text-black";
      default: return "bg-success text-white";
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <AlertTriangle className="text-warning" size={24} />
        Detailed Alerts
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dust Attack Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className={`glass-card overflow-hidden ${getRiskBorder(dustAttack.linkingRisk)}`}
        >
          {/* Header with gradient */}
          <div className={`p-5 bg-gradient-to-r ${getRiskGradient(dustAttack.linkingRisk)} border-b border-border/30`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${dustAttack.dustAttackDetected ? 'bg-critical/20 border border-critical/30' : 'bg-success/20 border border-success/30'}`}>
                  <Shield className={dustAttack.dustAttackDetected ? 'text-critical' : 'text-success'} size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dust Attack Detection</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${dustAttack.dustAttackDetected ? 'bg-critical/20 text-critical' : 'bg-success/20 text-success'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dustAttack.dustAttackDetected ? 'bg-critical animate-pulse' : 'bg-success'}`} />
                      {dustAttack.dustAttackDetected ? 'Detected' : 'Not Detected'}
                    </span>
                  </div>
                </div>
              </div>
              {dustAttack.dustAttackDetected && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getRiskBadge(dustAttack.linkingRisk)}`}>
                  {dustAttack.linkingRisk}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {dustAttack.dustAttackDetected ? (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={14} className="text-critical" />
                      <span className="text-xs text-muted-foreground font-medium">Dust Transactions</span>
                    </div>
                    <p className="text-2xl font-bold font-mono">{dustAttack.dustTransactionsReceived}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-warning" />
                      <span className="text-xs text-muted-foreground font-medium">Unique Senders</span>
                    </div>
                    <p className="text-2xl font-bold font-mono">{dustAttack.uniqueDustSenders.length}</p>
                  </div>
                </div>

                {/* Vulnerability Score Bar */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Percent size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Vulnerability Score</span>
                    </div>
                    <span className={`text-xl font-bold font-mono ${dustAttack.dustVulnerability > 0.7 ? 'text-critical' : dustAttack.dustVulnerability > 0.4 ? 'text-warning' : 'text-success'}`}>
                      {(dustAttack.dustVulnerability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dustAttack.dustVulnerability * 100}%` }}
                      transition={{ duration: 1, delay: 1 }}
                      className={`h-full rounded-full ${dustAttack.dustVulnerability > 0.7 ? 'bg-critical' : dustAttack.dustVulnerability > 0.4 ? 'bg-warning' : 'bg-success'}`}
                    />
                  </div>
                </div>

                {/* Linking Risk */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-critical/5 border border-critical/20">
                  <div className="flex items-center gap-2">
                    <Link2 size={14} className="text-critical" />
                    <span className="text-sm font-medium">Wallet Linking Risk</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getRiskBadge(dustAttack.linkingRisk)}`}>
                    {dustAttack.linkingRisk}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 border border-success/20 mb-4">
                  <Shield className="text-success" size={32} />
                </div>
                <p className="text-muted-foreground">
                  No dust attack transactions detected. Your wallet appears clean from this attack vector.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Exchange Exposure Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className={`glass-card overflow-hidden ${exchangeFingerprint.kycExposure > 0.5 || exchangeFingerprint.traceabilityRisk === 'CRITICAL' ? 'border-warning/40' : 'border-success/30'}`}
        >
          {/* Header with gradient */}
          <div className={`p-5 bg-gradient-to-r ${exchangeFingerprint.kycExposure > 0.5 ? 'from-warning/20 via-warning/10 to-transparent' : 'from-success/10 via-success/5 to-transparent'} border-b border-border/30`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${exchangeFingerprint.kycExposure > 0.5 ? 'bg-warning/20 border border-warning/30' : 'bg-success/20 border border-success/30'}`}>
                  <Building className={exchangeFingerprint.kycExposure > 0.5 ? 'text-warning' : 'text-success'} size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Exchange/KYC Exposure</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${exchangeFingerprint.exchangeInteractionDetected ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${exchangeFingerprint.exchangeInteractionDetected ? 'bg-warning' : 'bg-success'}`} />
                      {exchangeFingerprint.exchangeInteractionDetected ? 'Interactions Detected' : 'No Interactions'}
                    </span>
                  </div>
                </div>
              </div>
              {exchangeFingerprint.traceabilityRisk && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getRiskBadge(exchangeFingerprint.traceabilityRisk)}`}>
                  {exchangeFingerprint.traceabilityRisk}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="space-y-4">
              {/* KYC Exposure Bar */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">KYC Exposure Level</span>
                  </div>
                  <span className={`text-xl font-bold font-mono ${exchangeFingerprint.kycExposure > 0.7 ? 'text-critical' : exchangeFingerprint.kycExposure > 0.4 ? 'text-warning' : 'text-success'}`}>
                    {(exchangeFingerprint.kycExposure * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exchangeFingerprint.kycExposure * 100}%` }}
                    transition={{ duration: 1, delay: 1.1 }}
                    className={`h-full rounded-full ${exchangeFingerprint.kycExposure > 0.7 ? 'bg-critical' : exchangeFingerprint.kycExposure > 0.4 ? 'bg-warning' : 'bg-success'}`}
                  />
                </div>
              </div>

              {/* Deposits & Withdrawals */}
              {(exchangeFingerprint.exchangeDeposits !== undefined || exchangeFingerprint.exchangeWithdrawals !== undefined) && (
                <div className="grid grid-cols-2 gap-3">
                  {exchangeFingerprint.exchangeDeposits !== undefined && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight size={14} className="text-warning" />
                        <span className="text-xs text-muted-foreground font-medium">Deposits</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">{exchangeFingerprint.exchangeDeposits}</p>
                    </div>
                  )}
                  {exchangeFingerprint.exchangeWithdrawals !== undefined && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownRight size={14} className="text-success" />
                        <span className="text-xs text-muted-foreground font-medium">Withdrawals</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">{exchangeFingerprint.exchangeWithdrawals}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Detected Exchanges */}
              {exchangeFingerprint.detectedExchanges.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Detected Exchanges</p>
                  <div className="flex flex-wrap gap-2">
                    {exchangeFingerprint.detectedExchanges.map((exchange, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 1.2 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          exchange.type === 'CEX'
                            ? 'bg-warning/20 text-warning border border-warning/30'
                            : 'bg-primary/20 text-primary border border-primary/30'
                        }`}
                      >
                        <Building size={12} />
                        {exchange.name}
                        <span className="text-xs opacity-70">({exchange.type})</span>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* No interactions message */}
              {!exchangeFingerprint.exchangeInteractionDetected && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    No centralized exchange interactions detected. Your KYC exposure is minimal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

import { motion } from "framer-motion";
import { AlertTriangle, Building, Shield } from "lucide-react";
import { PrivacyData } from "@/types/privacy";

interface DetailedAlertsProps {
  data: PrivacyData;
}

export function DetailedAlerts({ data }: DetailedAlertsProps) {
  const { dustAttack, exchangeFingerprint } = data;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "border-critical/50 bg-critical/10";
      case "HIGH": return "border-warning/50 bg-warning/10";
      case "MEDIUM": return "border-warning/30 bg-warning/5";
      default: return "border-success/30 bg-success/5";
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dust Attack Card */}
        <div className={`glass-card p-6 ${getRiskColor(dustAttack.linkingRisk)}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${dustAttack.dustAttackDetected ? 'bg-critical/20' : 'bg-success/20'}`}>
              <Shield className={dustAttack.dustAttackDetected ? 'text-critical' : 'text-success'} size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Dust Attack Detection</h3>
              <span className={`text-sm ${dustAttack.dustAttackDetected ? 'text-critical' : 'text-success'}`}>
                {dustAttack.dustAttackDetected ? 'Detected' : 'Not Detected'}
              </span>
            </div>
          </div>

          {dustAttack.dustAttackDetected && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Dust Transactions</span>
                <span className="font-mono font-bold">{dustAttack.dustTransactionsReceived}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Unique Senders</span>
                <span className="font-mono font-bold">{dustAttack.uniqueDustSenders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Vulnerability Score</span>
                <span className={`font-mono font-bold ${dustAttack.dustVulnerability > 0.5 ? 'text-critical' : 'text-warning'}`}>
                  {(dustAttack.dustVulnerability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Linking Risk</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  dustAttack.linkingRisk === 'CRITICAL' ? 'bg-critical/20 text-critical' :
                  dustAttack.linkingRisk === 'HIGH' ? 'bg-warning/20 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {dustAttack.linkingRisk}
                </span>
              </div>
            </div>
          )}

          {!dustAttack.dustAttackDetected && (
            <p className="text-sm text-muted-foreground">
              No dust attack transactions detected. Your wallet appears clean from this attack vector.
            </p>
          )}
        </div>

        {/* Exchange Exposure Card */}
        <div className={`glass-card p-6 ${exchangeFingerprint.kycExposure > 0.5 ? 'border-warning/50 bg-warning/10' : 'border-success/30 bg-success/5'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${exchangeFingerprint.kycExposure > 0.5 ? 'bg-warning/20' : 'bg-success/20'}`}>
              <Building className={exchangeFingerprint.kycExposure > 0.5 ? 'text-warning' : 'text-success'} size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Exchange/KYC Exposure</h3>
              <span className={`text-sm ${exchangeFingerprint.exchangeInteractionDetected ? 'text-warning' : 'text-success'}`}>
                {exchangeFingerprint.exchangeInteractionDetected ? 'Interactions Detected' : 'No Interactions'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">KYC Exposure</span>
              <span className={`font-mono font-bold ${exchangeFingerprint.kycExposure > 0.5 ? 'text-warning' : 'text-success'}`}>
                {(exchangeFingerprint.kycExposure * 100).toFixed(0)}%
              </span>
            </div>

            {exchangeFingerprint.exchangeDeposits !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Deposits</span>
                <span className="font-mono font-bold">{exchangeFingerprint.exchangeDeposits}</span>
              </div>
            )}

            {exchangeFingerprint.exchangeWithdrawals !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Withdrawals</span>
                <span className="font-mono font-bold">{exchangeFingerprint.exchangeWithdrawals}</span>
              </div>
            )}

            {exchangeFingerprint.traceabilityRisk && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Traceability Risk</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  exchangeFingerprint.traceabilityRisk === 'CRITICAL' ? 'bg-critical/20 text-critical' :
                  exchangeFingerprint.traceabilityRisk === 'HIGH' ? 'bg-warning/20 text-warning' :
                  'bg-success/20 text-success'
                }`}>
                  {exchangeFingerprint.traceabilityRisk}
                </span>
              </div>
            )}

            {exchangeFingerprint.detectedExchanges.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Detected Exchanges</span>
                <div className="flex flex-wrap gap-2">
                  {exchangeFingerprint.detectedExchanges.map((exchange, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        exchange.type === 'CEX' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {exchange.name} ({exchange.type})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!exchangeFingerprint.exchangeInteractionDetected && (
              <p className="text-sm text-muted-foreground">
                No centralized exchange interactions detected. Your KYC exposure is minimal.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

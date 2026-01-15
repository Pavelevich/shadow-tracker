import { motion } from "framer-motion";
import { Eye, AlertTriangle, Shield, ExternalLink, Sparkles, X, Check, Lock, Zap } from "lucide-react";

export function EncryptTradeSection() {
  const surveillanceFacts = [
    {
      icon: Eye,
      title: "Chain Analysis Companies",
      description: "Chainalysis, Elliptic, and TRM Labs track every transaction on public blockchains",
    },
    {
      icon: AlertTriangle,
      title: "Exchange Reporting",
      description: "CEXs share your transaction data with governments via subpoenas and regulations",
    },
    {
      icon: Shield,
      title: "Dust Attack Tracking",
      description: "Attackers send tiny amounts to trace your wallet activity and link addresses",
    },
  ];

  const comparisonItems = [
    { feature: "Breaks on-chain link", encryptTrade: true, dex: false },
    { feature: "Hides transaction amounts", encryptTrade: true, dex: false },
    { feature: "Private recipient address", encryptTrade: true, dex: false },
    { feature: "No traceable history", encryptTrade: true, dex: false },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="py-4"
    >
      <div className="glass-card overflow-hidden border-2 border-purple-500/50">
        {/* Header - More Prominent */}
        <div className="bg-gradient-to-r from-purple-500/30 via-purple-500/20 to-purple-600/10 p-6 border-b border-purple-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/30 border border-purple-500/50 shadow-lg shadow-purple-500/20">
                <Sparkles className="text-purple-300" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  True Privacy Solution
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-500/40 animate-pulse">
                    Recommended
                  </span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  The only way to truly break on-chain transaction links
                </p>
              </div>
            </div>
            <motion.a
              href="https://encrypt.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Lock size={16} className="text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">encrypt.trade</span>
              <ExternalLink size={14} className="text-purple-400" />
            </motion.a>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Differentiator - NEW */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 shrink-0">
                <Zap size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-300 mb-1">Why DEXs Aren't Enough</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Using Jupiter, Raydium, or other DEXs <span className="text-amber-400 font-medium">doesn't break the on-chain link</span>.
                  Your transaction history remains visible and traceable. Only <span className="text-purple-400 font-semibold">encrypt.trade</span> uses
                  encryption technology to truly break the connection between your wallets.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table - NEW */}
          <div className="rounded-xl border border-border/30 overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/20 p-3 text-xs font-semibold">
              <span className="text-muted-foreground">Feature</span>
              <span className="text-center text-purple-400">encrypt.trade</span>
              <span className="text-center text-muted-foreground">Regular DEXs</span>
            </div>
            {comparisonItems.map((item, index) => (
              <motion.div
                key={item.feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="grid grid-cols-3 p-3 border-t border-border/20 text-sm"
              >
                <span className="text-muted-foreground text-xs">{item.feature}</span>
                <div className="flex justify-center">
                  <div className="p-1 rounded-full bg-green-500/20">
                    <Check size={14} className="text-green-400" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="p-1 rounded-full bg-red-500/20">
                    <X size={14} className="text-red-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Surveillance Facts */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Why This Matters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {surveillanceFacts.map((fact, index) => (
                <motion.div
                  key={fact.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="p-3 rounded-xl bg-muted/10 border border-border/20 hover:border-purple-500/30 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit mb-2">
                    <fact.icon size={16} className="text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-xs mb-1">{fact.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{fact.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA - More Prominent */}
          <motion.a
            href="https://encrypt.trade"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full p-5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-lg hover:from-purple-400 hover:to-purple-500 transition-all shadow-xl shadow-purple-500/30"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock size={22} />
            Start Fresh with encrypt.trade
            <ExternalLink size={18} />
          </motion.a>

          <p className="text-xs text-muted-foreground text-center">
            <span className="text-purple-400 font-semibold">encrypt.trade</span> - The only way to truly break on-chain links and start with a clean wallet on Solana.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

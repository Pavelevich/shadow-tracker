import { motion } from "framer-motion";
import { Eye, AlertTriangle, Shield, ExternalLink, BookOpen } from "lucide-react";

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent p-6 border-b border-purple-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <BookOpen className="text-purple-400" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Why Privacy Matters
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Educational
                  </span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  Understanding wallet surveillance and how to protect yourself
                </p>
              </div>
            </div>
            <a
              href="https://encrypt.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
            >
              <span className="text-sm font-semibold text-purple-400">encrypt.trade</span>
              <ExternalLink size={14} className="text-purple-400" />
            </a>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Surveillance Facts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {surveillanceFacts.map((fact, index) => (
              <motion.div
                key={fact.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-purple-500/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit mb-3">
                  <fact.icon size={20} className="text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{fact.title}</h3>
                <p className="text-xs text-muted-foreground">{fact.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Key Message */}
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-purple-400 font-semibold">Your financial privacy is not guaranteed.</span>{" "}
              Every transaction you make on Solana is permanently recorded and can be analyzed to reveal
              your identity, net worth, trading patterns, and geographic location. SolPrivacy helps you
              understand exactly what adversaries can learn about you—and how to protect yourself.
            </p>
          </div>

          {/* CTA */}
          <motion.a
            href="https://encrypt.trade"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:from-purple-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield size={20} />
            Learn About Private DeFi on Solana
            <ExternalLink size={16} />
          </motion.a>

          <p className="text-xs text-muted-foreground text-center">
            <span className="text-purple-400 font-semibold">encrypt.trade</span> offers private swaps and transfers on Solana using encryption technology.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

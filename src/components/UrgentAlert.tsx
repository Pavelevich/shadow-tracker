import { motion } from "framer-motion";
import { Warning, Rocket, Shield, LinkBreak } from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";

interface UrgentAlertProps {
  data: PrivacyData;
}

const quickActions = [
  {
    title: "Start Fresh",
    description: "Create a new wallet with a clean slate",
    icon: Rocket,
    url: "https://jup.ag",
    color: "from-success/20 to-success/5",
    borderColor: "border-success/30",
    iconColor: "text-success",
  },
  {
    title: "Privacy Tools",
    description: "Use privacy-preserving protocols",
    icon: Shield,
    url: "https://lightprotocol.com",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
    iconColor: "text-primary",
  },
  {
    title: "Break the Link",
    description: "Swap through DEX to obfuscate",
    icon: LinkBreak,
    url: "https://raydium.io",
    color: "from-warning/20 to-warning/5",
    borderColor: "border-warning/30",
    iconColor: "text-warning",
  },
];

export function UrgentAlert({ data }: UrgentAlertProps) {
  const shouldShow = data.advancedPrivacyScore < 50 || data.dustAttack.dustAttackDetected;

  if (!shouldShow) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Alert header */}
        <div className="bg-gradient-to-r from-critical/20 via-warning/10 to-critical/20 border-b border-critical/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-critical/20 border border-critical/30">
              <Warning className="text-critical animate-pulse" size={28} weight="bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-critical">Urgent Action Required</h2>
              <p className="text-muted-foreground mt-1">
                Your wallet privacy is at risk. Take immediate action to protect your identity.
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.title}
                href={action.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={`group p-5 bg-gradient-to-br ${action.color} border ${action.borderColor} hover:scale-[1.02] transition-all duration-300`}
              >
                <action.icon className={`${action.iconColor} mb-3`} size={24} weight="bold" />
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

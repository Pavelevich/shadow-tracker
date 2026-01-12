import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";
import { PrivacyData } from "@/types/privacy";

interface MethodologyProps {
  data: PrivacyData;
}

export function Methodology({ data }: MethodologyProps) {
  const { methodology } = data;

  if (!methodology || methodology.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <BookOpen className="text-primary" size={24} />
        Scientific Methodology
      </h2>

      <div className="glass-card p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Our privacy analysis is based on peer-reviewed academic research in information theory,
          differential privacy, and blockchain forensics:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {methodology.map((ref, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 1.3 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
            >
              <ExternalLink className="text-primary shrink-0 mt-0.5" size={14} />
              <p className="text-xs text-muted-foreground leading-relaxed">{ref}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-medium">Note:</span> This analysis uses
            state-of-the-art techniques from academia and industry leaders like Chainalysis
            and Elliptic to simulate how adversaries could potentially identify your wallet.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

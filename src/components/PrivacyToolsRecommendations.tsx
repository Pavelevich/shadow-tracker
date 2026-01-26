import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Shield,
  Lock,
  Shuffle,
  ArrowsLeftRight,
  Drop,
  ArrowSquareOut,
  Warning,
  CheckCircle,
  TrendUp
} from "@phosphor-icons/react";
import { PrivacyData, ToolRecommendation } from "@/types/privacy";
import { getToolRecommendations } from "@/lib/privacyProjections";

interface PrivacyToolsRecommendationsProps {
  data: PrivacyData;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number; weight?: string }>> = {
  Shield,
  Lock,
  Shuffle,
  ArrowRightLeft: ArrowsLeftRight,
  Droplets: Drop,
};

export function PrivacyToolsRecommendations({ data }: PrivacyToolsRecommendationsProps) {
  const recommendations = useMemo(() => getToolRecommendations(data), [data]);

  if (recommendations.length === 0) return null;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-critical/20 text-critical border-critical/30";
      case "MEDIUM":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-success/20 text-success border-success/30";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Warning size={12} weight="bold" />;
      case "MEDIUM":
        return <Warning size={12} weight="bold" />;
      default:
        return <CheckCircle size={12} weight="bold" />;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
        <Wrench className="text-primary" size={24} weight="bold" />
        Recommended Privacy Tools
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Based on your analysis, these tools can significantly improve your privacy
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {recommendations.map((rec, index) => {
          const IconComponent = iconMap[rec.tool.icon] || Shield;

          return (
            <motion.div
              key={rec.tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              {/* Gradient header - fixed height */}
              <div className={`p-4 bg-gradient-to-r ${rec.tool.gradient} border-b ${rec.tool.borderColor}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/80 ${rec.tool.borderColor} border shadow-lg shrink-0`}>
                      <IconComponent className="text-primary" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base leading-tight">{rec.tool.name}</h3>
                      <span className="text-[10px] text-muted-foreground capitalize font-medium">
                        {rec.tool.category}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getPriorityStyle(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
              </div>

              {/* Content - flex-grow to fill space */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {rec.tool.description}
                </p>

                {/* Why recommended */}
                <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Why recommended</p>
                  <p className="text-xs font-medium leading-snug line-clamp-2">{rec.reason}</p>
                </div>

                {/* Issue detected */}
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <div className="p-0.5 bg-warning/20 shrink-0">
                    <Warning size={10} className="text-warning" weight="bold" />
                  </div>
                  <span className="text-muted-foreground truncate">{rec.relevantIssue}</span>
                </div>

                {/* Spacer to push bottom content down */}
                <div className="flex-1 min-h-2" />

                {/* Projected improvement */}
                <div className="mt-3 flex items-center justify-between p-2.5 bg-success/5 border border-success/20">
                  <div className="flex items-center gap-1.5">
                    <TrendUp size={12} className="text-success" weight="bold" />
                    <span className="text-[10px] text-muted-foreground">Improvement</span>
                  </div>
                  <span className="text-sm font-bold text-success">+{rec.projectedImprovement} pts</span>
                </div>

                {/* CTA Button - always at bottom */}
                <motion.a
                  href={rec.tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full p-2.5 bg-primary/10 border border-primary/30 text-primary font-semibold text-xs hover:bg-primary/20 hover:border-primary/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Use {rec.tool.name}
                  <ArrowSquareOut size={12} weight="bold" />
                </motion.a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground mt-6 text-center opacity-70">
        Projected improvements are estimates based on typical usage patterns. Actual results may vary.
      </p>
    </motion.section>
  );
}

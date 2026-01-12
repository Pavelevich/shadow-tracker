import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Shield,
  Lock,
  Shuffle,
  ArrowRightLeft,
  Droplets,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { PrivacyData, ToolRecommendation } from "@/types/privacy";
import { getToolRecommendations } from "@/lib/privacyProjections";

interface PrivacyToolsRecommendationsProps {
  data: PrivacyData;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Shield,
  Lock,
  Shuffle,
  ArrowRightLeft,
  Droplets,
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
        return <AlertCircle size={12} />;
      case "MEDIUM":
        return <AlertCircle size={12} />;
      default:
        return <CheckCircle size={12} />;
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
        <Wrench className="text-primary" size={24} />
        Recommended Privacy Tools
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Based on your analysis, these tools can significantly improve your privacy
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => {
          const IconComponent = iconMap[rec.tool.icon] || Shield;

          return (
            <motion.div
              key={rec.tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
            >
              {/* Gradient header */}
              <div className={`p-4 bg-gradient-to-r ${rec.tool.gradient} border-b ${rec.tool.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-background/80 ${rec.tool.borderColor} border shadow-lg`}>
                      <IconComponent className="text-primary" size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{rec.tool.name}</h3>
                      <span className="text-xs text-muted-foreground capitalize font-medium">
                        {rec.tool.category}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getPriorityStyle(rec.priority)}`}>
                    {getPriorityIcon(rec.priority)}
                    {rec.priority}
                  </span>
                </div>
              </div>

              {/* Content - flex-grow to fill space */}
              <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rec.tool.description}
                </p>

                {/* Why recommended */}
                <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Why recommended</p>
                  <p className="text-sm font-medium leading-snug">{rec.reason}</p>
                </div>

                {/* Issue detected */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <div className="p-1 rounded bg-warning/20">
                    <AlertCircle size={10} className="text-warning" />
                  </div>
                  <span className="text-muted-foreground">{rec.relevantIssue}</span>
                </div>

                {/* Spacer to push bottom content down */}
                <div className="flex-grow min-h-4" />

                {/* Projected improvement */}
                <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-success" />
                    <span className="text-xs text-muted-foreground">Projected improvement</span>
                  </div>
                  <span className="text-lg font-bold text-success">+{rec.projectedImprovement} pts</span>
                </div>

                {/* CTA Button - always at bottom */}
                <motion.a
                  href={rec.tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 hover:border-primary/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Use {rec.tool.name}
                  <ExternalLink size={14} />
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

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
  CheckCircle
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
        return <AlertCircle size={14} />;
      case "MEDIUM":
        return <AlertCircle size={14} />;
      default:
        return <CheckCircle size={14} />;
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
              className={`glass-card overflow-hidden hover:scale-[1.02] transition-transform`}
            >
              {/* Gradient header */}
              <div className={`p-4 bg-gradient-to-r ${rec.tool.gradient} border-b ${rec.tool.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${rec.tool.borderColor} border`}>
                      <IconComponent className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rec.tool.name}</h3>
                      <span className="text-xs text-muted-foreground capitalize">
                        {rec.tool.category}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getPriorityStyle(rec.priority)}`}>
                    {getPriorityIcon(rec.priority)}
                    {rec.priority}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {rec.tool.description}
                </p>

                {/* Why recommended */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Why recommended:</p>
                  <p className="text-sm font-medium">{rec.reason}</p>
                </div>

                {/* Issue detected */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle size={12} className="text-warning" />
                  <span>{rec.relevantIssue}</span>
                </div>

                {/* Projected improvement */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Projected improvement</span>
                  <span className="text-sm font-bold text-success">+{rec.projectedImprovement} pts</span>
                </div>

                {/* CTA Button */}
                <motion.a
                  href={rec.tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
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
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Projected improvements are estimates based on typical usage patterns. Actual results may vary.
      </p>
    </motion.section>
  );
}

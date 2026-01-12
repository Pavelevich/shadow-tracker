import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { PrivacyData, Recommendation } from "@/types/privacy";

interface RecommendationsProps {
  data: PrivacyData;
}

export function Recommendations({ data }: RecommendationsProps) {
  const { recommendations } = data;

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priority[a.priority] - priority[b.priority];
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-critical/20 text-critical border-critical/30";
      case "MEDIUM":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <AlertCircle size={16} className="text-critical" />;
      case "MEDIUM":
        return <AlertCircle size={16} className="text-warning" />;
      default:
        return <CheckCircle size={16} className="text-success" />;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Lightbulb className="text-primary" size={24} />
        Recommendations
      </h2>

      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-border/30">
          {sortedRecommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 1.1 }}
              className="p-5 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityStyle(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1">{rec.action}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight size={14} className="text-primary" />
                    <span>{rec.impact}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

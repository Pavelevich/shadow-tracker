import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendUp, ArrowRight, Sparkle } from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";
import { calculatePrivacyProjection } from "@/lib/privacyProjections";
import { Switch } from "@/components/ui/switch";

interface PrivacyScoreComparisonProps {
  data: PrivacyData;
}

function ScoreGauge({
  score,
  label,
  isActive,
  isProjected = false,
}: {
  score: number;
  label: string;
  isActive: boolean;
  isProjected?: boolean;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const duration = 1000;
    const startTime = Date.now();
    const startScore = animatedScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(startScore + (score - startScore) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [score, isActive]);

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = () => {
    if (animatedScore >= 80) return isProjected ? "hsl(var(--success))" : "hsl(var(--success))";
    if (animatedScore >= 50) return "hsl(var(--warning))";
    return "hsl(var(--critical))";
  };

  const getTextColor = () => {
    if (animatedScore >= 80) return "text-success";
    if (animatedScore >= 50) return "text-warning";
    return "text-critical";
  };

  return (
    <motion.div
      className={`flex flex-col items-center transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-40"
      }`}
      animate={{ scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-[120px] sm:w-[140px] md:w-[160px] aspect-square flex-shrink-0">
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full transform -rotate-90"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={isProjected ? "hsl(var(--success))" : getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isProjected ? "text-success" : getTextColor()}`}
            key={animatedScore}
          >
            {animatedScore}
          </motion.span>
          <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function PrivacyScoreComparison({ data }: PrivacyScoreComparisonProps) {
  const [showProjected, setShowProjected] = useState(false);
  const projection = useMemo(() => calculatePrivacyProjection(data), [data]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="py-8"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-3">
        <TrendUp className="text-primary" size={24} weight="bold" />
        Privacy Improvement Potential
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        See how your privacy score could improve by using recommended tools
      </p>

      <div className="glass-card p-6 md:p-8">
        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span
            className={`text-sm font-medium transition-colors ${
              !showProjected ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Current Score
          </span>
          <Switch
            checked={showProjected}
            onCheckedChange={setShowProjected}
            className="data-[state=checked]:bg-success"
          />
          <span
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              showProjected ? "text-success" : "text-muted-foreground"
            }`}
          >
            <Sparkle size={14} weight="fill" />
            Projected Score
          </span>
        </div>

        {/* Dual Gauge Display */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-8">
          <ScoreGauge
            score={projection.currentScore}
            label="Current"
            isActive={!showProjected}
          />

          <motion.div
            className="flex flex-row sm:flex-col items-center gap-2"
            animate={{ opacity: showProjected ? 1 : 0.5 }}
          >
            <ArrowRight className="text-primary rotate-90 sm:rotate-0" size={24} weight="bold" />
            <motion.span
              className="text-base sm:text-lg font-bold text-success"
              animate={{ scale: showProjected ? 1.1 : 1 }}
            >
              +{projection.improvement.toFixed(0)}
            </motion.span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">points</span>
          </motion.div>

          <ScoreGauge
            score={projection.projectedScore}
            label="Projected"
            isActive={showProjected}
            isProjected
          />
        </div>

        {/* Metric Improvements (visible when projected is selected) */}
        <AnimatePresence mode="wait">
          {showProjected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-border/30">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">
                  Projected Improvements by Metric
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                  {projection.metrics.map((metric, index) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <p className="text-xs text-muted-foreground mb-1">{metric.name}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {metric.current.toFixed(0)}
                        </span>
                        <ArrowRight size={12} className="text-success" weight="bold" />
                        <span className="text-xs sm:text-sm font-bold text-success">
                          {metric.projected.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-success mt-1">+{metric.improvement}%</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to action hint */}
        <motion.p
          className="text-center text-sm text-muted-foreground mt-6"
          animate={{ opacity: showProjected ? 1 : 0.6 }}
        >
          {showProjected
            ? "Scroll down to see recommended tools to achieve this improvement"
            : "Toggle to see your potential privacy improvement"}
        </motion.p>
      </div>
    </motion.section>
  );
}

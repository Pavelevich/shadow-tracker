import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PrivacyData } from "@/types/privacy";

interface PrivacyScoreProps {
  data: PrivacyData;
}

export function PrivacyScore({ data }: PrivacyScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { advancedPrivacyScore, grade, riskLevel } = data;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * advancedPrivacyScore));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [advancedPrivacyScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    if (score >= 30) return "text-warning";
    return "text-critical";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-success to-success/50";
    if (score >= 50) return "from-warning to-warning/50";
    if (score >= 30) return "from-warning to-critical/50";
    return "from-critical to-critical/50";
  };

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-success/20 text-success border-success/30";
      case "MEDIUM":
        return "bg-warning/20 text-warning border-warning/30";
      case "HIGH":
        return "bg-critical/20 text-critical border-critical/30";
      case "CRITICAL":
        return "bg-critical/30 text-critical border-critical/50 animate-pulse-glow";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getGradeColor = (g: string) => {
    if (g === "A") return "text-success";
    if (g === "B") return "text-success/80";
    if (g === "C") return "text-warning";
    if (g === "D") return "text-warning/80";
    return "text-critical";
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Score Gauge */}
          <div className="relative">
            <svg width="280" height="280" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              {/* Animated score circle */}
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${getScoreGradient(advancedPrivacyScore).split(' ')[0].replace('from-', '')}`} style={{ stopColor: advancedPrivacyScore >= 80 ? 'hsl(var(--success))' : advancedPrivacyScore >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--critical))' }} />
                  <stop offset="100%" style={{ stopColor: advancedPrivacyScore >= 80 ? 'hsl(var(--success) / 0.5)' : advancedPrivacyScore >= 50 ? 'hsl(var(--warning) / 0.5)' : 'hsl(var(--critical) / 0.5)' }} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={`text-6xl font-bold ${getScoreColor(advancedPrivacyScore)}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {animatedScore}
              </motion.span>
              <span className="text-muted-foreground text-sm uppercase tracking-wider mt-1">
                Privacy Score
              </span>
            </div>
          </div>

          {/* Grade and Risk Level */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <div>
              <span className="text-muted-foreground text-sm uppercase tracking-wider block mb-2">
                Grade
              </span>
              <motion.span
                className={`text-8xl font-black ${getGradeColor(grade)}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                {grade}
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <span className="text-muted-foreground text-sm uppercase tracking-wider block mb-2">
                Risk Level
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-lg border font-semibold text-lg ${getRiskBadgeStyle(riskLevel)}`}
              >
                {riskLevel}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

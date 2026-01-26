import { motion } from "framer-motion";
import { Clock, Globe, Pulse, Warning } from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";

interface TemporalFingerprintProps {
  data: PrivacyData;
}

export function TemporalFingerprint({ data }: TemporalFingerprintProps) {
  const { temporalAnalysis } = data;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-critical";
    if (confidence >= 0.5) return "text-warning";
    return "text-success";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="py-8"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Clock className="text-primary" size={24} weight="bold" />
        Temporal Fingerprint
      </h2>

      <div className="glass-card p-6">
        {/* Warning banner */}
        <div className="bg-warning/10 border border-warning/20 p-4 mb-6 flex items-start gap-3">
          <Warning className="text-warning shrink-0 mt-0.5" size={20} weight="bold" />
          <div>
            <p className="text-sm text-warning font-medium">Timing patterns can reveal your identity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Attackers can use transaction timing to determine your timezone, work schedule, and behavioral patterns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Timezone */}
          <div className="p-4 bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="text-primary" size={20} weight="bold" />
              <span className="text-muted-foreground text-sm">Estimated Timezone</span>
            </div>
            <p className="text-2xl font-bold">{temporalAnalysis.estimatedTimezone}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <span className={`text-sm font-medium ${getConfidenceColor(temporalAnalysis.timezoneConfidence)}`}>
                {(temporalAnalysis.timezoneConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Autocorrelation */}
          <div className="p-4 bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3 mb-3">
              <Pulse className="text-primary" size={20} weight="bold" />
              <span className="text-muted-foreground text-sm">Pattern Regularity</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.abs(temporalAnalysis.autocorrelation) < 0.3 ? "Random" :
               Math.abs(temporalAnalysis.autocorrelation) < 0.6 ? "Moderate" : "Predictable"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Correlation:</span>
              <span className={`text-sm font-mono ${
                Math.abs(temporalAnalysis.autocorrelation) > 0.5 ? "text-warning" : "text-success"
              }`}>
                {temporalAnalysis.autocorrelation.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Activity Patterns */}
          <div className="p-4 bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-primary" size={20} weight="bold" />
              <span className="text-muted-foreground text-sm">Detected Patterns</span>
            </div>
            <div className="space-y-2">
              {temporalAnalysis.detectedPeriods.length > 0 ? (
                temporalAnalysis.detectedPeriods.map((period, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{period.period}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted overflow-hidden">
                        <div
                          className={`h-full ${getConfidenceColor(period.confidence).replace('text-', 'bg-')}`}
                          style={{ width: `${period.confidence * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${getConfidenceColor(period.confidence)}`}>
                        {(period.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-success">No regular patterns detected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

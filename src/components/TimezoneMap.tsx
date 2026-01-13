import { motion } from "framer-motion";
import { Globe, AlertTriangle, Clock } from "lucide-react";
import { PrivacyData } from "@/types/privacy";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

interface TimezoneMapProps {
  data: PrivacyData;
}

// Timezone to longitude range (for highlighting the band)
const timezoneToLongitude: Record<string, { center: number; label: string }> = {
  "UTC-12": { center: -180, label: "UTC-12" },
  "UTC-11": { center: -165, label: "UTC-11" },
  "UTC-10": { center: -150, label: "UTC-10" },
  "UTC-9": { center: -135, label: "UTC-9" },
  "UTC-8": { center: -120, label: "UTC-8" },
  "UTC-7": { center: -105, label: "UTC-7" },
  "UTC-6": { center: -90, label: "UTC-6" },
  "UTC-5": { center: -75, label: "UTC-5" },
  "UTC-4": { center: -60, label: "UTC-4" },
  "UTC-3": { center: -45, label: "UTC-3" },
  "UTC-2": { center: -30, label: "UTC-2" },
  "UTC-1": { center: -15, label: "UTC-1" },
  "UTC+0": { center: 0, label: "UTC+0" },
  "UTC+1": { center: 15, label: "UTC+1" },
  "UTC+2": { center: 30, label: "UTC+2" },
  "UTC+3": { center: 45, label: "UTC+3" },
  "UTC+4": { center: 60, label: "UTC+4" },
  "UTC+5": { center: 75, label: "UTC+5" },
  "UTC+5:30": { center: 82.5, label: "UTC+5:30" },
  "UTC+6": { center: 90, label: "UTC+6" },
  "UTC+7": { center: 105, label: "UTC+7" },
  "UTC+8": { center: 120, label: "UTC+8" },
  "UTC+9": { center: 135, label: "UTC+9" },
  "UTC+10": { center: 150, label: "UTC+10" },
  "UTC+11": { center: 165, label: "UTC+11" },
  "UTC+12": { center: 180, label: "UTC+12" },
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function TimezoneMap({ data }: TimezoneMapProps) {
  const { temporalAnalysis } = data;
  const timezone = temporalAnalysis.estimatedTimezone;
  const confidence = temporalAnalysis.timezoneConfidence;

  const tzData = timezoneToLongitude[timezone] || { center: 0, label: timezone };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return "#ef4444";
    if (confidence >= 0.5) return "#f59e0b";
    return "#22c55e";
  };

  const getRiskLevel = () => {
    if (confidence >= 0.8) return "CRITICAL";
    if (confidence >= 0.5) return "HIGH";
    return "LOW";
  };

  // Calculate the timezone band boundaries (each zone is 15 degrees wide)
  const bandStart = tzData.center - 7.5;
  const bandEnd = tzData.center + 7.5;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="py-8"
    >
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-6 border-b border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Globe className="text-amber-400" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Geographic Fingerprint</h2>
              <p className="text-muted-foreground text-sm">
                Your transaction timing reveals your probable timezone
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-amber-400 font-medium">Timezone Detection Risk: {getRiskLevel()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adversaries can analyze your transaction timestamps to determine your timezone with{" "}
                <span className="font-semibold text-amber-400">{(confidence * 100).toFixed(0)}% confidence</span>.
              </p>
            </div>
          </div>

          {/* World Map with Timezone Band */}
          <div className="relative bg-slate-900/50 rounded-xl border border-border/30 overflow-hidden">
            <svg width="100%" viewBox="0 0 800 400" style={{ display: 'block' }}>
              {/* Timezone band highlight */}
              <defs>
                <linearGradient id="bandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={getConfidenceColor()} stopOpacity="0" />
                  <stop offset="30%" stopColor={getConfidenceColor()} stopOpacity="0.3" />
                  <stop offset="50%" stopColor={getConfidenceColor()} stopOpacity="0.4" />
                  <stop offset="70%" stopColor={getConfidenceColor()} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={getConfidenceColor()} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Highlighted timezone band */}
              <rect
                x={((bandStart + 180) / 360) * 800}
                y="0"
                width={(15 / 360) * 800}
                height="400"
                fill="url(#bandGradient)"
              />

              {/* Animated pulse lines at band edges */}
              <motion.line
                x1={((tzData.center + 180) / 360) * 800}
                y1="0"
                x2={((tzData.center + 180) / 360) * 800}
                y2="400"
                stroke={getConfidenceColor()}
                strokeWidth="2"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>

            {/* Map overlay */}
            <div className="absolute inset-0">
              <ComposableMap
                projection="geoEquirectangular"
                projectionConfig={{
                  scale: 130,
                  center: [0, 20],
                }}
                style={{ width: "100%", height: "100%" }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1e293b"
                        stroke="#334155"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
              </ComposableMap>
            </div>

            {/* Timezone label */}
            <div
              className="absolute top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3 border-2"
              style={{
                left: `${((tzData.center + 180) / 360) * 100}%`,
                transform: 'translate(-50%, -50%)',
                borderColor: getConfidenceColor()
              }}
            >
              <p className="text-2xl font-bold text-center" style={{ color: getConfidenceColor() }}>
                {timezone}
              </p>
            </div>

            {/* Confidence badge */}
            <div
              className="absolute top-4 right-4 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: `${getConfidenceColor()}20`,
                borderColor: `${getConfidenceColor()}50`
              }}
            >
              <p className="text-xs text-muted-foreground">Detection Confidence</p>
              <p className="text-xl font-bold" style={{ color: getConfidenceColor() }}>
                {(confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Detected Timezone</span>
              </div>
              <p className="text-2xl font-bold">{timezone}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on transaction timing patterns
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Risk Level</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: getConfidenceColor() }}>
                {getRiskLevel()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {confidence >= 0.7 ? "Timezone highly exposed" : confidence >= 0.4 ? "Moderate exposure" : "Low exposure"}
              </p>
            </div>
          </div>

          {/* Mitigation Tips */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-sm font-semibold mb-2">How to Hide Your Timezone</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Schedule transactions at random times using automated tools</li>
              <li>• Use Light Protocol to batch and delay transactions</li>
              <li>• Vary your transaction times across different hours</li>
              <li>• Consider using Arcium for confidential transaction timing</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

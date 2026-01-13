import { motion } from "framer-motion";
import { Globe, MapPin, AlertTriangle, Clock } from "lucide-react";
import { PrivacyData } from "@/types/privacy";

interface TimezoneMapProps {
  data: PrivacyData;
}

// Timezone to approximate longitude mapping
const timezoneToPosition: Record<string, { x: number; y: number; region: string }> = {
  "UTC-12": { x: 5, y: 50, region: "Baker Island" },
  "UTC-11": { x: 8, y: 50, region: "American Samoa" },
  "UTC-10": { x: 12, y: 45, region: "Hawaii" },
  "UTC-9": { x: 15, y: 40, region: "Alaska" },
  "UTC-8": { x: 18, y: 42, region: "US Pacific (LA, SF)" },
  "UTC-7": { x: 21, y: 42, region: "US Mountain (Denver)" },
  "UTC-6": { x: 24, y: 45, region: "US Central (Chicago)" },
  "UTC-5": { x: 27, y: 45, region: "US Eastern (NYC)" },
  "UTC-4": { x: 30, y: 50, region: "Atlantic (Puerto Rico)" },
  "UTC-3": { x: 35, y: 60, region: "South America (Brazil)" },
  "UTC-2": { x: 40, y: 55, region: "Mid-Atlantic" },
  "UTC-1": { x: 45, y: 50, region: "Azores" },
  "UTC+0": { x: 50, y: 48, region: "UK, Portugal" },
  "UTC+1": { x: 52, y: 47, region: "Central Europe (Paris)" },
  "UTC+2": { x: 55, y: 45, region: "Eastern Europe (Kiev)" },
  "UTC+3": { x: 58, y: 43, region: "Moscow, Dubai" },
  "UTC+4": { x: 62, y: 45, region: "UAE, Azerbaijan" },
  "UTC+5": { x: 66, y: 48, region: "Pakistan, Uzbekistan" },
  "UTC+5:30": { x: 68, y: 52, region: "India" },
  "UTC+6": { x: 70, y: 50, region: "Bangladesh" },
  "UTC+7": { x: 74, y: 52, region: "Thailand, Vietnam" },
  "UTC+8": { x: 78, y: 48, region: "China, Singapore" },
  "UTC+9": { x: 82, y: 42, region: "Japan, Korea" },
  "UTC+10": { x: 86, y: 55, region: "Australia East" },
  "UTC+11": { x: 90, y: 58, region: "Solomon Islands" },
  "UTC+12": { x: 94, y: 55, region: "New Zealand" },
};

export function TimezoneMap({ data }: TimezoneMapProps) {
  const { temporalAnalysis } = data;
  const timezone = temporalAnalysis.estimatedTimezone;
  const confidence = temporalAnalysis.timezoneConfidence;

  // Find position for the detected timezone
  const position = timezoneToPosition[timezone] || { x: 50, y: 50, region: "Unknown" };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return { ring: "rgba(239, 68, 68, 0.6)", pulse: "rgba(239, 68, 68, 0.3)" };
    if (confidence >= 0.5) return { ring: "rgba(245, 158, 11, 0.6)", pulse: "rgba(245, 158, 11, 0.3)" };
    return { ring: "rgba(34, 197, 94, 0.6)", pulse: "rgba(34, 197, 94, 0.3)" };
  };

  const colors = getConfidenceColor();

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
                Your transaction timing reveals your probable location
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-amber-400 font-medium">Location Privacy Risk</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adversaries can analyze your transaction timestamps to determine your timezone with{" "}
                <span className="font-semibold text-amber-400">{(confidence * 100).toFixed(0)}% confidence</span>.
                This reveals your geographic region.
              </p>
            </div>
          </div>

          {/* World Map SVG */}
          <div className="relative bg-muted/20 rounded-xl border border-border/30 overflow-hidden">
            <svg
              viewBox="0 0 100 60"
              className="w-full h-auto"
              style={{ minHeight: "200px" }}
            >
              {/* Simplified world map outline */}
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                </linearGradient>
              </defs>

              {/* Background grid */}
              {[...Array(10)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 10 + 5}
                  y1="0"
                  x2={i * 10 + 5}
                  y2="60"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.2"
                />
              ))}
              {[...Array(6)].map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 10 + 5}
                  x2="100"
                  y2={i * 10 + 5}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.2"
                />
              ))}

              {/* Simplified continents */}
              {/* North America */}
              <path
                d="M10,20 Q15,15 25,18 L28,25 Q30,35 25,40 L15,42 Q8,35 10,20"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
              />
              {/* South America */}
              <path
                d="M25,42 Q30,45 32,55 L28,58 Q22,55 20,48 L25,42"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
              />
              {/* Europe */}
              <path
                d="M45,20 Q55,18 58,25 L55,32 Q48,35 45,28 L45,20"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
              />
              {/* Africa */}
              <path
                d="M48,35 Q55,32 60,38 L58,52 Q52,58 48,50 L48,35"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
              />
              {/* Asia */}
              <path
                d="M58,18 Q75,15 88,22 L90,35 Q85,45 75,42 L65,38 Q58,30 58,18"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
              />
              {/* Australia */}
              <path
                d="M80,48 Q88,45 92,52 L90,58 Q82,58 80,52 L80,48"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
              />

              {/* Animated pulse at detected location */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="8"
                fill="none"
                stroke={colors.pulse}
                strokeWidth="0.5"
                initial={{ r: 2, opacity: 1 }}
                animate={{ r: 8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="5"
                fill="none"
                stroke={colors.pulse}
                strokeWidth="0.5"
                initial={{ r: 2, opacity: 1 }}
                animate={{ r: 5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />

              {/* Location marker */}
              <circle
                cx={position.x}
                cy={position.y}
                r="2"
                fill={colors.ring}
                stroke="white"
                strokeWidth="0.3"
              />
            </svg>

            {/* Location label overlay */}
            <div
              className="absolute bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs border border-amber-500/30"
              style={{
                left: `${Math.min(Math.max(position.x, 15), 85)}%`,
                top: `${Math.min(position.y + 8, 80)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-amber-400" />
                <span className="text-amber-400 font-semibold">{timezone}</span>
              </div>
              <p className="text-muted-foreground mt-0.5">{position.region}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Detected Timezone</span>
              </div>
              <p className="text-xl font-bold">{timezone}</p>
              <p className="text-xs text-muted-foreground">{position.region}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Detection Confidence</span>
              </div>
              <p className={`text-xl font-bold ${confidence >= 0.7 ? "text-critical" : confidence >= 0.4 ? "text-warning" : "text-success"}`}>
                {(confidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {confidence >= 0.7 ? "High risk" : confidence >= 0.4 ? "Medium risk" : "Low risk"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Privacy Impact</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {confidence >= 0.7
                  ? "Your location is highly exposed. Consider varying transaction times."
                  : confidence >= 0.4
                  ? "Moderate location exposure. Some timing patterns detected."
                  : "Good location privacy. Transaction times appear random."}
              </p>
            </div>
          </div>

          {/* Mitigation Tips */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-sm font-semibold mb-2">How to Hide Your Timezone</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Schedule transactions at random times using automated tools</li>
              <li>• Use privacy protocols like Light Protocol that batch transactions</li>
              <li>• Vary your transaction times across different hours of the day</li>
              <li>• Consider using Arcium for confidential transaction timing</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

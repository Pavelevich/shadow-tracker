import { motion } from "framer-motion";
import { Globe, MapPin, AlertTriangle, Clock } from "lucide-react";
import { PrivacyData } from "@/types/privacy";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

interface TimezoneMapProps {
  data: PrivacyData;
}

// Timezone to coordinates mapping (longitude, latitude)
const timezoneToCoords: Record<string, { coords: [number, number]; city: string; region: string }> = {
  "UTC-12": { coords: [-176.6, -1.0], city: "Baker Island", region: "Pacific" },
  "UTC-11": { coords: [-171.0, -14.3], city: "Pago Pago", region: "American Samoa" },
  "UTC-10": { coords: [-155.5, 19.9], city: "Honolulu", region: "Hawaii, USA" },
  "UTC-9": { coords: [-149.9, 61.2], city: "Anchorage", region: "Alaska, USA" },
  "UTC-8": { coords: [-118.2, 34.1], city: "Los Angeles", region: "US Pacific" },
  "UTC-7": { coords: [-104.9, 39.7], city: "Denver", region: "US Mountain" },
  "UTC-6": { coords: [-87.6, 41.9], city: "Chicago", region: "US Central" },
  "UTC-5": { coords: [-74.0, 40.7], city: "New York", region: "US Eastern" },
  "UTC-4": { coords: [-66.1, 18.5], city: "San Juan", region: "Puerto Rico" },
  "UTC-3": { coords: [-43.2, -22.9], city: "Rio de Janeiro", region: "Brazil" },
  "UTC-2": { coords: [-30.0, -20.0], city: "Mid-Atlantic", region: "Atlantic Ocean" },
  "UTC-1": { coords: [-25.7, 37.7], city: "Azores", region: "Portugal" },
  "UTC+0": { coords: [-0.1, 51.5], city: "London", region: "United Kingdom" },
  "UTC+1": { coords: [2.3, 48.9], city: "Paris", region: "France" },
  "UTC+2": { coords: [30.5, 50.5], city: "Kyiv", region: "Ukraine" },
  "UTC+3": { coords: [37.6, 55.8], city: "Moscow", region: "Russia" },
  "UTC+4": { coords: [55.3, 25.3], city: "Dubai", region: "UAE" },
  "UTC+5": { coords: [67.0, 24.9], city: "Karachi", region: "Pakistan" },
  "UTC+5:30": { coords: [77.2, 28.6], city: "New Delhi", region: "India" },
  "UTC+6": { coords: [90.4, 23.8], city: "Dhaka", region: "Bangladesh" },
  "UTC+7": { coords: [100.5, 13.8], city: "Bangkok", region: "Thailand" },
  "UTC+8": { coords: [121.5, 31.2], city: "Shanghai", region: "China" },
  "UTC+9": { coords: [139.7, 35.7], city: "Tokyo", region: "Japan" },
  "UTC+10": { coords: [151.2, -33.9], city: "Sydney", region: "Australia" },
  "UTC+11": { coords: [160.0, -9.4], city: "Honiara", region: "Solomon Islands" },
  "UTC+12": { coords: [174.8, -41.3], city: "Wellington", region: "New Zealand" },
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function TimezoneMap({ data }: TimezoneMapProps) {
  const { temporalAnalysis } = data;
  const timezone = temporalAnalysis.estimatedTimezone;
  const confidence = temporalAnalysis.timezoneConfidence;

  // Find coordinates for the detected timezone
  const location = timezoneToCoords[timezone] || {
    coords: [0, 0] as [number, number],
    city: "Unknown",
    region: "Unknown"
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return "#ef4444"; // red
    if (confidence >= 0.5) return "#f59e0b"; // amber
    return "#22c55e"; // green
  };

  const getRiskLevel = () => {
    if (confidence >= 0.8) return "CRITICAL";
    if (confidence >= 0.5) return "HIGH";
    return "LOW";
  };

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
              <p className="text-sm text-amber-400 font-medium">Location Privacy Risk: {getRiskLevel()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adversaries can analyze your transaction timestamps to determine your timezone with{" "}
                <span className="font-semibold text-amber-400">{(confidence * 100).toFixed(0)}% confidence</span>.
              </p>
            </div>
          </div>

          {/* World Map */}
          <div className="relative bg-slate-900/50 rounded-xl border border-border/30 overflow-hidden">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
                center: [0, 30],
              }}
              style={{ width: "100%", height: "auto" }}
            >
              <ZoomableGroup>
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
                          hover: { fill: "#334155", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* Animated marker at detected location */}
                <Marker coordinates={location.coords}>
                  {/* Pulse rings */}
                  <motion.circle
                    r={20}
                    fill="none"
                    stroke={getConfidenceColor()}
                    strokeWidth={1}
                    initial={{ r: 5, opacity: 1 }}
                    animate={{ r: 25, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.circle
                    r={15}
                    fill="none"
                    stroke={getConfidenceColor()}
                    strokeWidth={1}
                    initial={{ r: 5, opacity: 1 }}
                    animate={{ r: 20, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                  />
                  {/* Center dot */}
                  <circle r={6} fill={getConfidenceColor()} />
                  <circle r={3} fill="white" />
                </Marker>
              </ZoomableGroup>
            </ComposableMap>

            {/* Location label */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-amber-400" />
                <span className="text-amber-400 font-bold">{timezone}</span>
              </div>
              <p className="text-white text-sm font-medium">{location.city}</p>
              <p className="text-muted-foreground text-xs">{location.region}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Detected Timezone</span>
              </div>
              <p className="text-xl font-bold">{timezone}</p>
              <p className="text-xs text-muted-foreground">{location.city}, {location.region}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Coordinates</span>
              </div>
              <p className="text-lg font-mono">
                {location.coords[1].toFixed(1)}°{location.coords[1] >= 0 ? "N" : "S"},{" "}
                {Math.abs(location.coords[0]).toFixed(1)}°{location.coords[0] >= 0 ? "E" : "W"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-400" size={16} />
                <span className="text-xs text-muted-foreground">Risk Level</span>
              </div>
              <p className="text-xl font-bold" style={{ color: getConfidenceColor() }}>
                {getRiskLevel()}
              </p>
              <p className="text-xs text-muted-foreground">
                {confidence >= 0.7 ? "Location highly exposed" : confidence >= 0.4 ? "Moderate exposure" : "Low exposure"}
              </p>
            </div>
          </div>

          {/* Mitigation Tips */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-sm font-semibold mb-2">How to Hide Your Location</h3>
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

import { motion } from "framer-motion";
import { Globe, Clock, Warning } from "@phosphor-icons/react";
import { PrivacyData } from "@/types/privacy";

interface TimezoneMapProps {
  data: PrivacyData;
}

export function TimezoneMap({ data }: TimezoneMapProps) {
  const { temporalAnalysis } = data;
  const timezone = temporalAnalysis.estimatedTimezone;
  const confidence = temporalAnalysis.timezoneConfidence;

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return "#DC2626"; // Red
    if (confidence >= 0.5) return "#D97706"; // Amber
    return "#059669"; // Green
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
      <div className="bg-[#141414] border border-[#2A2A2A]">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-[#D9770620]">
              <Globe className="text-[#D97706]" size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white">GEOGRAPHIC FINGERPRINT</h2>
              <p className="text-[#8A8A8A] text-sm">
                Transaction timing reveals your probable timezone
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Alert */}
          <div className="bg-[#D9770610] border border-[#D9770630] p-4 flex items-start gap-3">
            <Warning className="text-[#D97706] shrink-0 mt-0.5" size={20} weight="bold" />
            <div>
              <p className="text-sm text-[#D97706] font-semibold tracking-wide">
                TIMEZONE DETECTION RISK: {getRiskLevel()}
              </p>
              <p className="text-xs text-[#8A8A8A] mt-1">
                Adversaries can analyze your transaction timestamps to determine your timezone with{" "}
                <span className="font-semibold text-[#D97706]">{(confidence * 100).toFixed(0)}% confidence</span>.
              </p>
            </div>
          </div>

          {/* Timezone Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Timezone Card */}
            <div className="md:col-span-2 p-6 bg-[#0A0A0A] border-2" style={{ borderColor: getConfidenceColor() }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-[#8A8A8A]" size={16} weight="bold" />
                <span className="text-xs text-[#8A8A8A] tracking-wide">DETECTED TIMEZONE</span>
              </div>
              <p className="text-5xl font-extrabold tracking-tight text-white mb-2">{timezone}</p>
              <p className="text-sm text-[#5A5A5A]">
                Based on transaction timing patterns analysis
              </p>
            </div>

            {/* Confidence & Risk */}
            <div className="space-y-4">
              <div className="p-4 bg-[#0A0A0A] border border-[#2A2A2A]">
                <span className="text-xs text-[#5A5A5A] tracking-wide">CONFIDENCE</span>
                <p className="text-3xl font-bold mt-1" style={{ color: getConfidenceColor() }}>
                  {(confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-4 bg-[#0A0A0A] border border-[#2A2A2A]">
                <span className="text-xs text-[#5A5A5A] tracking-wide">RISK LEVEL</span>
                <p className="text-xl font-bold mt-1" style={{ color: getConfidenceColor() }}>
                  {getRiskLevel()}
                </p>
              </div>
            </div>
          </div>

          {/* Mitigation Tips */}
          <div className="p-4 bg-[#0A0A0A] border border-[#2A2A2A]">
            <h3 className="text-xs font-semibold tracking-wide text-[#8A8A8A] mb-3">HOW TO HIDE YOUR TIMEZONE</h3>
            <ul className="text-sm text-[#5A5A5A] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#D97706]">—</span>
                Schedule transactions at random times using automated tools
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97706]">—</span>
                Use Light Protocol to batch and delay transactions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97706]">—</span>
                Vary your transaction times across different hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97706]">—</span>
                Consider using Arcium for confidential transaction timing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { HeroSection } from "@/components/HeroSection";
import { PrivacyScore } from "@/components/PrivacyScore";
import { UrgentAlert } from "@/components/UrgentAlert";
import { AttackSimulation } from "@/components/AttackSimulation";
import { MetricsGrid } from "@/components/MetricsGrid";
import { TemporalFingerprint } from "@/components/TemporalFingerprint";
import { DetailedAlerts } from "@/components/DetailedAlerts";
import { Recommendations } from "@/components/Recommendations";
import { IdentityFingerprint } from "@/components/IdentityFingerprint";
import { Methodology } from "@/components/Methodology";
import { Footer } from "@/components/Footer";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { usePrivacyAnalysis } from "@/hooks/usePrivacyAnalysis";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const Index = () => {
  const { data, isLoading, error, analyze, reset } = usePrivacyAnalysis();

  const handleNewAnalysis = () => {
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header when results are shown */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <Logo size="sm" />
              <Button
                variant="outline"
                onClick={handleNewAnalysis}
                className="gap-2"
              >
                <ArrowLeft size={16} />
                New Analysis
              </Button>
            </motion.div>
          )}

          {/* Hero Section - only show if no data */}
          {!data && !isLoading && (
            <HeroSection onAnalyze={analyze} isLoading={isLoading} />
          )}

          {/* Error state */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <div className="glass-card p-6 border-critical/30 bg-critical/5">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-critical" size={24} />
                    <div>
                      <h3 className="font-semibold text-critical">Analysis Failed</h3>
                      <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <Logo size="lg" />
              </motion.div>
              <p className="text-muted-foreground mb-4">Analyzing wallet privacy...</p>
              <LoadingSkeleton />
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {data && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Wallet address display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <span className="text-muted-foreground text-sm">Analyzing wallet</span>
                  <p className="font-mono text-lg text-primary mt-1">
                    {data.data.address.slice(0, 12)}...{data.data.address.slice(-8)}
                  </p>
                  {data.cached && (
                    <span className="inline-block mt-2 text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      Cached result
                    </span>
                  )}
                </motion.div>

                <PrivacyScore data={data.data} />
                <UrgentAlert data={data.data} />
                <AttackSimulation data={data.data} />
                <IdentityFingerprint data={data.data} />
                <MetricsGrid data={data.data} />
                <TemporalFingerprint data={data.data} />
                <DetailedAlerts data={data.data} />
                <Recommendations data={data.data} />
                <Methodology data={data.data} />
              </motion.div>
            )}
          </AnimatePresence>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;

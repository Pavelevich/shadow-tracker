import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { NavBar } from "@/components/NavBar";
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
import { PrivacyScoreComparison } from "@/components/PrivacyScoreComparison";
import { PrivacyToolsRecommendations } from "@/components/PrivacyToolsRecommendations";
import { LightProtocolIntegration } from "@/components/LightProtocolIntegration";
import { ArciumIntegration } from "@/components/ArciumIntegration";
import { HeliusIntegration } from "@/components/HeliusIntegration";
import { EncryptTradeSection } from "@/components/EncryptTradeSection";
import { WalletComparison } from "@/components/WalletComparison";
import { TimezoneMap } from "@/components/TimezoneMap";
import { ExportPDF } from "@/components/ExportPDF";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Footer } from "@/components/Footer";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { usePrivacyAnalysis } from "@/hooks/usePrivacyAnalysis";
import {
  AlertCircle,
  ArrowLeft,
  Shield,
  Zap,
  BarChart3,
  Link as LinkIcon,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { wallet } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, analyze, reset } = usePrivacyAnalysis();

  // Auto-analyze if wallet is in URL
  useEffect(() => {
    if (wallet && !data && !isLoading) {
      analyze(wallet);
    }
  }, [wallet]);

  const handleNewAnalysis = () => {
    reset();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnalyze = (address: string) => {
    navigate(`/analyze/${address}`);
    analyze(address);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <GridBackground />
      <NavBar />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          {/* Hero Section - only show if no data and no wallet param */}
          {!data && !isLoading && !wallet && (
            <HeroSection onAnalyze={handleAnalyze} isLoading={isLoading} />
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
                  <Button
                    variant="outline"
                    onClick={handleNewAnalysis}
                    className="mt-4 gap-2"
                  >
                    <ArrowLeft size={16} />
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center mb-8 max-w-2xl mx-auto">
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
                className="space-y-6"
              >
                {/* Wallet address display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
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

                {/* Export & New Analysis */}
                <div className="flex justify-center gap-3">
                  <ExportPDF data={data.data} />
                  <Button variant="outline" onClick={handleNewAnalysis} className="gap-2">
                    <ArrowLeft size={16} />
                    New Analysis
                  </Button>
                </div>

                {/* SECTION 1: Summary (Always visible) */}
                <PrivacyScore data={data.data} />
                <UrgentAlert data={data.data} />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => navigate(`/mev/${data.data.address}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-amber-400" />
                      <span className="font-semibold">Check MEV Risk</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      Analyze vulnerability to sandwich attacks
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => navigate(`/dust/${data.data.address}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-red-400" />
                      <span className="font-semibold">Clean Dust Tokens</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      Remove trackers & recover SOL
                    </span>
                  </Button>
                </div>

                {/* SECTION 2: Quick Actions */}
                <CollapsibleSection
                  title="Improve Your Privacy"
                  icon={<Shield size={18} />}
                  defaultOpen={true}
                  badge="Recommended"
                  badgeColor="#14f195"
                >
                  <div className="space-y-4">
                    <EncryptTradeSection />
                    <PrivacyScoreComparison data={data.data} />
                    <PrivacyToolsRecommendations data={data.data} />
                  </div>
                </CollapsibleSection>

                {/* SECTION 3: Detailed Analysis */}
                <CollapsibleSection
                  title="Detailed Analysis"
                  icon={<BarChart3 size={18} />}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <AttackSimulation data={data.data} />
                    <IdentityFingerprint data={data.data} />
                    <MetricsGrid data={data.data} />
                    <TemporalFingerprint data={data.data} />
                    <TimezoneMap data={data.data} />
                    <DetailedAlerts data={data.data} />
                  </div>
                </CollapsibleSection>

                {/* SECTION 4: Integrations */}
                <CollapsibleSection
                  title="Protocol Integrations"
                  icon={<LinkIcon size={18} />}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <LightProtocolIntegration data={data.data} />
                    <HeliusIntegration data={data.data} />
                    <ArciumIntegration data={data.data} />
                  </div>
                </CollapsibleSection>

                {/* SECTION 5: More */}
                <CollapsibleSection
                  title="More Tools & Info"
                  icon={<BookOpen size={18} />}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <WalletComparison />
                    <Recommendations data={data.data} />
                    <Methodology data={data.data} />
                  </div>
                </CollapsibleSection>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;

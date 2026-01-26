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
import { FinancialSurveillance } from "@/components/FinancialSurveillance";
import { Footer } from "@/components/Footer";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { usePrivacyAnalysis } from "@/hooks/usePrivacyAnalysis";
import {
  Warning,
  ArrowLeft,
  Shield,
  Lightning,
  ChartBar,
  Link as LinkIcon,
  Book,
  Eye,
  Broom,
} from "@phosphor-icons/react";
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
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
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
                    <Warning className="text-critical" size={24} weight="bold" />
                    <div>
                      <h3 className="font-semibold text-critical">Analysis Failed</h3>
                      <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNewAnalysis}
                    className="mt-4 gap-2 touch-feedback"
                  >
                    <ArrowLeft size={16} weight="bold" />
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
                className="max-w-4xl mx-auto w-full overflow-x-hidden"
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Privacy Analyzer</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                    Complete wallet privacy analysis
                  </p>
                </motion.div>

                {/* Wallet address display */}
                <div className="text-center mb-6">
                  <span className="text-muted-foreground text-sm">Analyzing</span>
                  <p className="font-mono text-primary">
                    {data.data.address.slice(0, 12)}...{data.data.address.slice(-8)}
                  </p>
                  {data.cached && (
                    <span className="inline-block mt-2 text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      Cached result
                    </span>
                  )}
                </div>

                {/* Export PDF */}
                <div className="flex justify-center mb-6">
                  <ExportPDF data={data.data} />
                </div>

                {/* Content */}
                <div className="space-y-4">

                {/* SECTION 1: Summary (Always visible) */}
                <PrivacyScore data={data.data} />
                <UrgentAlert data={data.data} />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2 touch-feedback"
                    onClick={() => navigate(`/mev/${data.data.address}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Lightning size={18} className="text-amber-400" weight="bold" />
                      <span className="font-semibold">Check MEV Risk</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      Analyze vulnerability to sandwich attacks
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2 touch-feedback"
                    onClick={() => navigate(`/dust/${data.data.address}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Broom size={18} className="text-red-400" weight="bold" />
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
                  icon={<Shield size={18} weight="bold" />}
                  defaultOpen={true}
                  badge="Recommended"
                  badgeColor="#10B981"
                >
                  <div className="space-y-4">
                    <EncryptTradeSection />
                    <PrivacyScoreComparison data={data.data} />
                    <PrivacyToolsRecommendations data={data.data} />
                  </div>
                </CollapsibleSection>

                {/* SECTION 2.5: Financial Surveillance */}
                <CollapsibleSection
                  title="Financial Surveillance"
                  icon={<Eye size={18} weight="bold" />}
                  defaultOpen={false}
                  badge="New"
                  badgeColor="#ef4444"
                >
                  <FinancialSurveillance data={data.data} />
                </CollapsibleSection>

                {/* SECTION 3: Detailed Analysis */}
                <CollapsibleSection
                  title="Detailed Analysis"
                  icon={<ChartBar size={18} weight="bold" />}
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
                  icon={<LinkIcon size={18} weight="bold" />}
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
                  icon={<Book size={18} weight="bold" />}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <WalletComparison />
                    <Recommendations data={data.data} />
                    <Methodology data={data.data} />
                  </div>
                </CollapsibleSection>
                </div>

                {/* Back button */}
                <div className="text-center mt-6 sm:mt-8 pb-4">
                  <Button
                    variant="outline"
                    onClick={handleNewAnalysis}
                    className="gap-2 touch-feedback"
                  >
                    <ArrowLeft size={16} weight="bold" />
                    Analyze Another Wallet
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Index;

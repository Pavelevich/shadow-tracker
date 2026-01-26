import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MagnifyingGlass, ArrowLeft, Warning } from "@phosphor-icons/react";
import { GridBackground } from "@/components/GridBackground";
import { NavBar } from "@/components/NavBar";
import { MevRiskSection } from "@/components/MevRiskSection";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const API_BASE = "https://solprivacy.xyz/api/v3";

export default function MevShield() {
  const { wallet } = useParams();
  const navigate = useNavigate();
  const [walletInput, setWalletInput] = useState(wallet || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (wallet) {
      fetchAnalysis(wallet);
    } else {
      // Reset state when no wallet (user clicked "Analyze Another")
      setData(null);
      setError(null);
      setWalletInput("");
    }
  }, [wallet]);

  const fetchAnalysis = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/analyze/${address}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (walletInput.trim()) {
      navigate(`/mev/${walletInput.trim()}`);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <GridBackground />
      <NavBar />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">MEV Shield</h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto px-4">
              Analyze vulnerability to sandwich attacks
            </p>
          </motion.div>

          {/* Wallet Input (if no wallet in URL) */}
          {!wallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto w-full mb-6"
            >
              <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlass
                      size={16}
                      weight="bold"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="text"
                      placeholder="Enter wallet address..."
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                      className="pl-9 h-10 font-mono text-xs"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    className="h-11 sm:h-10 px-6 sm:px-4 bg-amber-500 hover:bg-amber-600 text-sm touch-feedback"
                  >
                    Analyze
                  </Button>
                </div>
                {/* Example wallets */}
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-[#5A5A5A]">Try:</span>
                  {[
                    { addr: "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg", label: "Toly" },
                    { addr: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK", label: "Whale" },
                  ].map((item) => (
                    <button
                      key={item.addr}
                      onClick={() => navigate(`/mev/${item.addr}`)}
                      className="text-xs font-mono px-3 py-1.5 bg-[#1A1A1A] text-[#8A8A8A] hover:text-white transition-colors touch-feedback"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="max-w-2xl mx-auto w-full">
              <LoadingSkeleton />
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto w-full mb-8"
            >
              <div className="glass-card p-6 border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <Warning className="text-red-500" size={24} weight="bold" />
                  <div>
                    <h3 className="font-semibold text-red-500">Analysis Failed</h3>
                    <p className="text-muted-foreground text-sm">{error}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/mev")}
                  className="mt-4 gap-2 touch-feedback"
                >
                  <ArrowLeft size={16} weight="bold" />
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {data && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto w-full"
            >
              {/* Wallet address */}
              <div className="text-center mb-6">
                <span className="text-muted-foreground text-sm">Analyzing</span>
                <p className="font-mono text-primary">
                  {wallet?.slice(0, 12)}...{wallet?.slice(-8)}
                </p>
              </div>

              {/* MEV Analysis */}
              <MevRiskSection data={data} />

              {/* Back button */}
              <div className="text-center mt-6 sm:mt-8 pb-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/mev")}
                  className="gap-2 touch-feedback"
                >
                  <ArrowLeft size={16} weight="bold" />
                  Analyze Another Wallet
                </Button>
              </div>
            </motion.div>
          )}

          {/* Education Section (when no results) */}
          {!wallet && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto w-full mt-4"
            >
              <div className="glass-card p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Warning className="text-amber-400" size={16} weight="bold" />
                  What are Sandwich Attacks?
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="bg-muted/20 rounded-lg p-3 font-mono text-[11px]">
                    <p className="text-red-400">1. Bot BUYS (front-run)</p>
                    <p className="text-amber-400">2. YOUR swap (higher price)</p>
                    <p className="text-green-400">3. Bot SELLS (profit)</p>
                  </div>
                  <p>
                    <span className="text-amber-400 font-bold">$500M+</span> extracted from Solana users in 2025.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex-1" />
        </div>
        <Footer />
      </div>
    </div>
  );
}

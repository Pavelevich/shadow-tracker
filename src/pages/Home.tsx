import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Trash2, Search, ArrowRight } from "lucide-react";
import { GridBackground } from "@/components/GridBackground";
import { Logo } from "@/components/Logo";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";

type ToolType = "analyze" | "mev" | "dust";

const TOOLS = [
  {
    id: "analyze" as ToolType,
    icon: Shield,
    title: "Privacy Analyzer",
    description: "Complete wallet privacy analysis. Get your privacy score, identify vulnerabilities, and receive actionable recommendations.",
    color: "#14f195",
    route: "/analyze",
  },
  {
    id: "mev" as ToolType,
    icon: Zap,
    title: "MEV Shield",
    description: "Check your vulnerability to sandwich attacks. Analyze your swap patterns and get protection recommendations.",
    color: "#f59e0b",
    route: "/mev",
  },
  {
    id: "dust" as ToolType,
    icon: Trash2,
    title: "Dust Cleaner",
    description: "Remove tracking tokens and recover locked SOL. Identify spam tokens that may be used to track your activity.",
    color: "#ef4444",
    route: "/dust",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<ToolType>("analyze");
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) return;

    setIsValidating(true);

    // Basic Solana address validation
    const isValid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress.trim());

    if (!isValid) {
      setIsValidating(false);
      return;
    }

    const tool = TOOLS.find((t) => t.id === selectedTool);
    if (tool) {
      navigate(`${tool.route}/${walletAddress.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <GridBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-8"
          >
            <Logo size="lg" />
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Privacy tools for Solana wallets. Analyze your privacy score,
              protect against MEV attacks, and clean tracking tokens.
            </p>
          </motion.div>

          {/* Tool Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto w-full mb-8"
          >
            <p className="text-sm text-muted-foreground text-center mb-4">
              Select a tool
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TOOLS.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <ToolCard
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    color={tool.color}
                    isSelected={selectedTool === tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Wallet Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Enter Solana wallet address..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={!walletAddress.trim() || isValidating}
                  className="h-12 px-6 gap-2"
                  style={{
                    backgroundColor: TOOLS.find((t) => t.id === selectedTool)?.color,
                  }}
                >
                  {isValidating ? (
                    "Validating..."
                  ) : (
                    <>
                      Start Analysis
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>

              {/* Example wallets */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="text-xs text-muted-foreground">Try:</span>
                {[
                  "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg",
                  "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
                ].map((addr) => (
                  <button
                    key={addr}
                    onClick={() => setWalletAddress(addr)}
                    className="text-xs font-mono text-primary hover:underline"
                  >
                    {addr.slice(0, 8)}...
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="text-2xl font-bold text-primary">$500M+</span>
                <p>Lost to MEV attacks in 2025</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-primary">100+</span>
                <p>Sandwich victims per hour</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-primary">0.002 SOL</span>
                <p>Recoverable per dust token</p>
              </div>
            </div>
          </motion.div>

          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-xs text-muted-foreground"
          >
            Powered by{" "}
            <a
              href="https://helius.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Helius
            </a>
            {" • "}
            <a
              href="https://lightprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Light Protocol
            </a>
            {" • "}
            <a
              href="https://arcium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Arcium
            </a>
          </motion.div>

          <div className="flex-1" />
          <Footer />
        </div>
      </div>
    </div>
  );
}

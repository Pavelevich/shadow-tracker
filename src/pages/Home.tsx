import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Trash2,
  Search,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Github,
  ExternalLink,
  Lock,
  Eye,
  TrendingDown,
} from "lucide-react";
import { GridBackground } from "@/components/GridBackground";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";

type ToolType = "analyze" | "mev" | "dust";

const TOOLS = [
  {
    id: "analyze" as ToolType,
    icon: Shield,
    title: "Privacy Analyzer",
    shortDesc: "Full privacy audit",
    description: "Complete wallet privacy analysis with actionable recommendations.",
    color: "#14f195",
    route: "/analyze",
    stats: "15+ metrics",
  },
  {
    id: "mev" as ToolType,
    icon: Zap,
    title: "MEV Shield",
    shortDesc: "Sandwich protection",
    description: "Check vulnerability to sandwich attacks and frontrunning.",
    color: "#f59e0b",
    route: "/mev",
    stats: "$500M+ lost",
  },
  {
    id: "dust" as ToolType,
    icon: Trash2,
    title: "Dust Cleaner",
    shortDesc: "Remove trackers",
    description: "Identify spam tokens and recover locked SOL rent.",
    color: "#ef4444",
    route: "/dust",
    stats: "~0.002 SOL/token",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<ToolType>("analyze");
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) return;

    setIsValidating(true);
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

  const copyCliCommand = () => {
    navigator.clipboard.writeText("npm install -g solprivacy-cli");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedToolData = TOOLS.find((t) => t.id === selectedTool);

  return (
    <div className="min-h-screen relative flex flex-col">
      <GridBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 pt-4"
          >
            <Logo size="lg" />
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
              Know what the blockchain knows about you.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Tool Selection - Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-2"
            >
              <p className="text-xs text-muted-foreground mb-2 px-1">Select Tool</p>
              {TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;
                return (
                  <motion.button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                      isSelected
                        ? "border-opacity-100 bg-opacity-10"
                        : "border-border/30 hover:border-opacity-50 bg-muted/5"
                    }`}
                    style={{
                      borderColor: isSelected ? tool.color : undefined,
                      backgroundColor: isSelected ? `${tool.color}10` : undefined,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <Icon size={20} style={{ color: tool.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{tool.title}</h3>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tool.color }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tool.shortDesc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Wallet Input & Info - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Selected Tool Info */}
              <div
                className="glass-card p-4 border-l-4"
                style={{ borderLeftColor: selectedToolData?.color }}
              >
                <div className="flex items-start gap-3">
                  {selectedToolData && (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${selectedToolData.color}20` }}
                    >
                      <selectedToolData.icon
                        size={24}
                        style={{ color: selectedToolData.color }}
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-lg">{selectedToolData?.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedToolData?.description}
                    </p>
                    <span
                      className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${selectedToolData?.color}20`,
                        color: selectedToolData?.color,
                      }}
                    >
                      {selectedToolData?.stats}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Input */}
              <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="text"
                      placeholder="Enter Solana wallet address..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-9 h-11 font-mono text-xs"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!walletAddress.trim() || isValidating}
                    className="h-11 px-5 gap-2 font-semibold"
                    style={{
                      backgroundColor: selectedToolData?.color,
                    }}
                  >
                    {isValidating ? (
                      "..."
                    ) : (
                      <>
                        Analyze
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>

                {/* Example wallets */}
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-muted-foreground">Try:</span>
                  {[
                    { addr: "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg", label: "Toly" },
                    { addr: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK", label: "Whale" },
                  ].map((item) => (
                    <button
                      key={item.addr}
                      onClick={() => setWalletAddress(item.addr)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Eye, label: "Privacy Risks", value: "15+", desc: "Metrics analyzed" },
                  { icon: TrendingDown, label: "MEV Losses", value: "$500M+", desc: "In 2025" },
                  { icon: Lock, label: "Dust Recovery", value: "0.002", desc: "SOL per token" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-3 rounded-xl bg-muted/10 border border-border/20 text-center"
                  >
                    <stat.icon size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-sm font-bold text-primary">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground">{stat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CLI Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-5xl mx-auto w-full mb-8"
          >
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Terminal size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">SolPrivacy CLI</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Command-line tools for advanced users
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Install Command */}
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-2">Install globally:</p>
                    <div className="relative">
                      <div className="bg-black/50 rounded-lg p-3 font-mono text-xs">
                        <span className="text-muted-foreground">$ </span>
                        <span className="text-green-400">npm install -g solprivacy-cli</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-7 w-7 p-0"
                        onClick={copyCliCommand}
                      >
                        {copied ? (
                          <Check size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Commands */}
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-2">Available commands:</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px]">
                        <code className="px-1.5 py-0.5 rounded bg-muted/30 text-primary font-mono">
                          dust scan
                        </code>
                        <span className="text-muted-foreground">Scan for closeable accounts</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <code className="px-1.5 py-0.5 rounded bg-muted/30 text-amber-400 font-mono">
                          dust clean
                        </code>
                        <span className="text-muted-foreground">Close accounts & recover SOL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits & Link */}
                <div className="mt-4 pt-4 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Lock size={10} className="text-green-400" />
                      Keys stay local
                    </span>
                    <span className="flex items-center gap-1">
                      <Github size={10} className="text-primary" />
                      Open source
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={10} className="text-amber-400" />
                      No wallet connect
                    </span>
                  </div>
                  <a
                    href="https://github.com/pchm-solprivacy/solprivacy-cli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Github size={14} />
                    View on GitHub
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[10px] text-muted-foreground mb-4"
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

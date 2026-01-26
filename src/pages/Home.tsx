import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Detective,
  ShieldWarning,
  Broom,
  MagnifyingGlass,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  GithubLogo,
  ArrowSquareOut,
  Lock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";

type ToolType = "analyze" | "mev" | "dust";

const TOOLS = [
  {
    id: "analyze" as ToolType,
    icon: Detective,
    title: "PRIVACY\nANALYZER",
    shortDesc: "Full privacy audit",
    description: "Complete wallet privacy analysis with actionable recommendations based on academic research.",
    color: "#7C3AED",
    bgColor: "rgba(124, 58, 237, 0.1)",
    route: "/analyze",
    stats: "15+ METRICS",
  },
  {
    id: "mev" as ToolType,
    icon: ShieldWarning,
    title: "MEV\nSHIELD",
    shortDesc: "Sandwich protection",
    description: "Check vulnerability to sandwich attacks, frontrunning, and other MEV extraction methods.",
    color: "#D97706",
    bgColor: "rgba(217, 119, 6, 0.1)",
    route: "/mev",
    stats: "$500M+ LOST",
  },
  {
    id: "dust" as ToolType,
    icon: Broom,
    title: "DUST\nCLEANER",
    shortDesc: "Remove trackers",
    description: "Identify spam tokens and recover locked SOL rent from dust attacks and airdrop spam.",
    color: "#DC2626",
    bgColor: "rgba(220, 38, 38, 0.1)",
    route: "/dust",
    stats: "~0.002 SOL/TOKEN",
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
    navigator.clipboard.writeText("npx solprivacy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col safe-top">
      {/* Header */}
      <header className="w-full px-4 sm:px-8 lg:px-20 h-12 sm:h-16 flex items-center justify-between border-b border-[#2A2A2A] shrink-0">
        <span className="text-xs font-bold tracking-[0.1em] text-white">SOLPRIVACY</span>
        <a
          href="https://www.npmjs.com/package/solprivacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold tracking-[0.1em] text-[#8A8A8A] hover:text-white transition-colors !min-h-0 !min-w-0"
        >
          CLI
        </a>
      </header>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-8 lg:px-20 py-4 sm:py-10 lg:py-14 flex flex-col items-center">
        {/* Tag - Hidden on small mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#2A2A2A] mb-6"
        >
          <div className="w-1.5 h-1.5 bg-[#10B981]" />
          <span className="text-[11px] font-medium tracking-[0.15em] text-[#8A8A8A]">
            PRIVACY ANALYSIS FOR SOLANA
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[22px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center leading-[1] sm:leading-[0.95] tracking-tight mb-2 sm:mb-4"
        >
          KNOW WHAT THE
          <br />
          BLOCKCHAIN KNOWS
          <br />
          ABOUT YOU
        </motion.h1>

        {/* Subline - Shorter on mobile */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-base text-[#8A8A8A] text-center max-w-xl leading-relaxed mb-4 sm:mb-8 px-2"
        >
          <span className="sm:hidden">Privacy analysis for Solana wallets</span>
          <span className="hidden sm:inline">Advanced privacy analysis using information theory, graph analysis,
          and blockchain forensics from academic research.</span>
        </motion.p>

        {/* Wallet Input - Mobile Stacked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 sm:gap-0"
        >
          <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 h-11 sm:h-14 bg-[#141414] border border-[#2A2A2A]">
            <MagnifyingGlass size={16} className="text-[#5A5A5A] shrink-0" weight="bold" />
            <Input
              type="text"
              placeholder="Enter wallet address..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm font-mono text-white placeholder:text-[#5A5A5A] focus-visible:ring-0 focus-visible:ring-offset-0 h-full px-0"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!walletAddress.trim() || isValidating}
            className="h-11 sm:h-14 px-5 sm:px-8 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.15em] flex items-center justify-center gap-2 touch-feedback"
          >
            {isValidating ? "..." : "ANALYZE"}
            <ArrowRight size={16} weight="bold" />
          </Button>
        </motion.div>

        {/* Example wallets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
        >
          <span className="text-[10px] sm:text-xs text-[#5A5A5A]">Try:</span>
          {[
            { addr: "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg", label: "Toly" },
            { addr: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK", label: "Whale" },
          ].map((item) => (
            <button
              key={item.addr}
              onClick={() => setWalletAddress(item.addr)}
              className="text-[10px] sm:text-xs font-mono px-2 sm:px-3 py-1 sm:py-1.5 bg-[#1A1A1A] text-[#8A8A8A] hover:text-white active:bg-[#2A2A2A] transition-colors touch-feedback"
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Tools Section */}
      <section className="w-full px-4 sm:px-8 lg:px-20 py-6 sm:py-10 lg:py-12 bg-[#141414]">
        {/* Section Header - Hidden on mobile for space */}
        <div className="hidden sm:block text-center mb-8">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#10B981]">
            PRIVACY TOOLS
          </span>
          <p className="text-sm text-[#8A8A8A] mt-2">
            Select a tool to analyze your wallet
          </p>
        </div>

        {/* Tools Grid - Compact vertical on mobile */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-4">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            return (
              <motion.button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`w-full p-3 sm:p-5 text-left transition-all duration-200 bg-[#0A0A0A] touch-feedback ${
                  isSelected
                    ? "border-2"
                    : "border border-[#2A2A2A] active:border-[#3A3A3A]"
                }`}
                style={{
                  borderColor: isSelected ? tool.color : undefined,
                }}
              >
                {/* Mobile: Compact horizontal layout */}
                <div className="sm:hidden flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: tool.bgColor }}
                  >
                    <Icon size={20} style={{ color: tool.color }} weight="bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">
                      {tool.title.replace("\n", " ")}
                    </h3>
                    <p className="text-[11px] text-[#8A8A8A]">{tool.shortDesc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 flex items-center justify-center shrink-0 ${
                      isSelected ? "" : "opacity-30"
                    }`}
                    style={{ backgroundColor: isSelected ? tool.bgColor : "#2A2A2A" }}
                  >
                    <Check
                      size={12}
                      style={{ color: isSelected ? tool.color : "#5A5A5A" }}
                      weight="bold"
                    />
                  </div>
                </div>

                {/* Desktop: Original vertical layout */}
                <div className="hidden sm:block">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: tool.bgColor }}
                    >
                      <Icon size={18} style={{ color: tool.color }} />
                    </div>
                    <span
                      className="text-[10px] font-semibold tracking-[0.1em]"
                      style={{ color: tool.color }}
                    >
                      {tool.stats}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-extrabold text-white leading-tight tracking-wide mb-2 whitespace-pre-line">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#8A8A8A] leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold tracking-[0.15em]"
                      style={{ color: isSelected ? tool.color : "#5A5A5A" }}
                    >
                      SELECT TOOL
                    </span>
                    <ArrowRight
                      size={12}
                      style={{ color: isSelected ? tool.color : "#5A5A5A" }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* CLI Section */}
      <section className="w-full px-4 sm:px-8 lg:px-20 py-10 sm:py-16 lg:py-24 bg-[#0A0A0A]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
          {/* Left */}
          <div className="flex-1">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-[#10B981] mb-3 sm:mb-4 block">
              COMMAND LINE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 sm:mb-4">
              SOLPRIVACY CLI
            </h2>
            <p className="text-sm sm:text-base text-[#8A8A8A] leading-relaxed max-w-md">
              Advanced privacy tools for power users. Run analyses locally, export reports, and integrate with your workflow.
            </p>
          </div>

          {/* Right - Commands */}
          <div className="w-full lg:w-96 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 px-4 sm:px-5 h-12 sm:h-14 bg-black border border-[#2A2A2A] overflow-x-auto scrollbar-hide">
              <span className="text-xs sm:text-sm font-mono text-[#5A5A5A]">$</span>
              <span className="text-xs sm:text-sm font-mono text-[#10B981] whitespace-nowrap">npm i -g solprivacy</span>
            </div>
            <div className="relative flex items-center gap-3 px-4 sm:px-5 h-12 sm:h-14 bg-black border border-[#2A2A2A]">
              <span className="text-xs sm:text-sm font-mono text-[#5A5A5A]">$</span>
              <span className="text-xs sm:text-sm font-mono text-primary">npx solprivacy</span>
              <button
                onClick={copyCliCommand}
                className="absolute right-3 sm:right-4 p-2 text-[#5A5A5A] hover:text-white active:text-[#10B981] transition-colors touch-feedback"
              >
                {copied ? <Check size={16} className="text-[#10B981]" weight="bold" /> : <Copy size={16} weight="bold" />}
              </button>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-wrap gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#5A5A5A]">
            <span className="flex items-center gap-2">
              <Lock size={14} className="text-[#10B981]" weight="bold" />
              Keys stay local
            </span>
            <span className="flex items-center gap-2">
              <GithubLogo size={14} className="text-primary" weight="bold" />
              Open source
            </span>
            <span className="flex items-center gap-2">
              <Terminal size={14} className="text-[#F59E0B]" weight="bold" />
              No wallet connect
            </span>
          </div>
          <a
            href="https://www.npmjs.com/package/solprivacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:underline touch-feedback"
          >
            <Terminal size={14} weight="bold" />
            View on npm
            <ArrowSquareOut size={12} weight="bold" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-8 lg:px-20 h-12 sm:h-20 flex items-center justify-between border-t border-[#2A2A2A] bg-[#141414] safe-bottom shrink-0">
        <div className="flex items-center gap-2 sm:gap-6">
          <span className="text-[10px] sm:text-sm font-bold tracking-[0.1em] text-white">SOLPRIVACY</span>
          <span className="text-[9px] sm:text-xs text-[#5A5A5A]">© 2026</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-8">
          {/* Hide partners on mobile, show on desktop */}
          <div className="hidden md:flex items-center gap-8">
            {["HELIUS", "LIGHT PROTOCOL", "ARCIUM"].map((partner) => (
              <span key={partner} className="text-[11px] font-medium tracking-[0.15em] text-[#5A5A5A]">
                {partner}
              </span>
            ))}
          </div>
          <a
            href="https://github.com/Pavelevich/solprivacy-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 touch-feedback"
          >
            <GithubLogo size={18} className="text-[#8A8A8A] hover:text-white transition-colors" weight="bold" />
          </a>
        </div>
      </footer>
    </div>
  );
}

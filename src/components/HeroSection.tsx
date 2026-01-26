import { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlass, CircleNotch, Shield, Eye, Warning, Lock, Terminal, Copy, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";

interface HeroSectionProps {
  onAnalyze: (address: string) => void;
  isLoading: boolean;
}

const EXAMPLE_WALLETS = [
  "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
];

const STATS = [
  { value: "100%", label: "of wallets leak data" },
  { value: "< 2min", label: "to de-anonymize" },
  { value: "94%", label: "timezone accuracy" },
];

export function HeroSection({ onAnalyze, isLoading }: HeroSectionProps) {
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npm install -g solprivacy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAnalyze(address.trim());
    }
  };

  const handleExampleClick = (wallet: string) => {
    setAddress(wallet);
    onAnalyze(wallet);
  };

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-critical/8 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-6xl font-black mb-4 leading-tight"
        >
          <span className="text-foreground">Your Wallet Is </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-critical via-warning to-critical animate-pulse">
            Exposed
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-2"
        >
          Chainalysis, Elliptic, and governments use these exact techniques to track you.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-primary font-semibold text-lg"
        >
          Now you can see what they see.
        </motion.p>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex items-center gap-3 px-4 py-2 bg-critical/10 border border-critical/30 mb-8"
      >
        <Warning className="text-critical" size={16} weight="bold" />
        <span className="text-sm text-critical font-medium">
          Your transactions reveal your identity, timezone, and net worth
        </span>
      </motion.div>

      {/* Search Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mb-4 relative z-10 px-2"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-critical/20 to-primary/30 blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 bg-card/90 backdrop-blur-xl border border-border/50">
            <div className="flex-1 relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} weight="bold" />
              <Input
                type="text"
                placeholder="Enter Solana wallet address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 sm:h-14 pl-12 pr-4 text-sm sm:text-base bg-transparent border-0 focus:ring-0 focus-visible:ring-0"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !address.trim()}
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-bold text-sm sm:text-base shadow-lg shadow-primary/25 touch-feedback"
            >
              {isLoading ? (
                <CircleNotch className="animate-spin" size={20} weight="bold" />
              ) : (
                <>
                  <Eye size={18} className="mr-2" weight="bold" />
                  Reveal Exposure
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.form>

      {/* CLI Pro Option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-6 px-2"
      >
        <span className="text-muted-foreground text-xs sm:text-sm">or use the CLI with AI agent:</span>
        <div className="flex items-center gap-2 px-3 py-2 bg-card/60 border border-success/30 hover:border-success/50 transition-colors">
          <Terminal size={14} className="text-success" weight="bold" />
          <code className="font-mono text-xs sm:text-sm text-success">npm i -g solprivacy</code>
          <button
            onClick={handleCopyCommand}
            className="p-1.5 hover:bg-success/10 transition-colors touch-feedback"
            title="Copy"
          >
            {copied ? (
              <Check size={12} className="text-success" weight="bold" />
            ) : (
              <Copy size={12} className="text-muted-foreground hover:text-success" weight="bold" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Example Wallets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        <span className="text-muted-foreground text-sm">Try high-risk examples:</span>
        {EXAMPLE_WALLETS.map((wallet, index) => (
          <button
            key={wallet}
            onClick={() => handleExampleClick(wallet)}
            disabled={isLoading}
            className="text-sm text-primary/80 hover:text-primary font-mono bg-card/50 px-3 py-2 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50 touch-feedback"
          >
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </button>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="grid grid-cols-3 gap-8 md:gap-16"
      >
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
            className="text-center group"
          >
            <p className="text-3xl md:text-4xl font-black text-gradient-primary transition-transform duration-300 group-hover:scale-110">
              {stat.value}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-12 flex flex-wrap justify-center items-center gap-4 text-muted-foreground text-sm"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-default">
          <Eye size={14} className="text-primary" weight="bold" />
          <span>See what adversaries see</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/30 hover:border-warning/40 hover:bg-warning/5 transition-all duration-300 cursor-default">
          <Warning size={14} className="text-warning" weight="bold" />
          <span>Attack simulation</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/30 hover:border-success/40 hover:bg-success/5 transition-all duration-300 cursor-default">
          <Lock size={14} className="text-success" weight="bold" />
          <span>Privacy recommendations</span>
        </div>
      </motion.div>

      {/* Powered by Helius + Hackathon Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-4"
      >
        {/* Powered by Helius */}
        <a
          href="https://helius.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors touch-feedback"
        >
          <svg width="16" height="16" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="128" cy="128" r="128" fill="#E84142"/>
            <path d="M128 64L176 160H80L128 64Z" fill="white"/>
          </svg>
          <span className="text-xs font-semibold text-orange-400">
            Powered by Helius
          </span>
        </a>

        {/* Hackathon Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Built for <span className="text-primary font-semibold">Solana Privacy Hackathon 2026</span>
          </span>
        </div>
      </motion.div>
    </section>
  );
}

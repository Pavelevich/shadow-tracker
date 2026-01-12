import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Shield } from "lucide-react";
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

export function HeroSection({ onAnalyze, isLoading }: HeroSectionProps) {
  const [address, setAddress] = useState("");

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
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
        >
          Know what the blockchain knows about you
        </motion.p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mb-6"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex gap-3">
            <div className="flex-1 relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Enter Solana wallet address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-14 pl-12 pr-4 text-base bg-card/80 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !address.trim()}
              className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold glow-primary"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={20} className="mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <span className="text-muted-foreground text-sm">Try examples:</span>
        {EXAMPLE_WALLETS.map((wallet, index) => (
          <button
            key={wallet}
            onClick={() => handleExampleClick(wallet)}
            disabled={isLoading}
            className="text-sm text-primary/80 hover:text-primary font-mono bg-card/50 px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/30 transition-all disabled:opacity-50"
          >
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 flex items-center gap-8 text-muted-foreground text-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Real-time analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Privacy-first</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span>Threat detection</span>
        </div>
      </motion.div>
    </section>
  );
}

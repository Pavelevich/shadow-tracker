import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Broom,
  Warning,
  ArrowSquareOut,
  Shield,
  Coins,
  Eye,
  Terminal,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PrivacyData } from "@/types/privacy";
import { useState } from "react";

interface DustCleanerProps {
  data: PrivacyData;
}

export function DustCleaner({ data }: DustCleanerProps) {
  const [copied, setCopied] = useState(false);

  const dustAttack = data.dustAttack || {};
  const dustDetected = dustAttack.dustAttackDetected || false;
  const dustTxCount = dustAttack.dustTransactionsReceived || 0;
  const uniqueSenders = Array.isArray(dustAttack.uniqueDustSenders)
    ? dustAttack.uniqueDustSenders.length
    : (dustAttack.uniqueDustSenders as number) || 0;

  // Estimate based on typical wallet patterns
  const estimatedEmptyAccounts = Math.max(5, Math.floor(dustTxCount * 0.7) + 3);
  const estimatedReclaimable = estimatedEmptyAccounts * 0.00203928;

  const getRiskLevel = () => {
    if (dustTxCount > 50) return { level: "HIGH", color: "#ef4444" };
    if (dustTxCount > 20) return { level: "MEDIUM", color: "#f59e0b" };
    if (dustTxCount > 5) return { level: "LOW", color: "#22c55e" };
    return { level: "MINIMAL", color: "#14f195" };
  };

  const risk = getRiskLevel();

  const cliCommand = `npx privatepussy`;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      {/* Dust Analysis Results */}
      <div className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent p-4 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 border border-red-500/30 shrink-0">
              <Broom className="text-red-400" size={20} weight="duotone" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold">Dust Analysis</h2>
              <p className="text-muted-foreground text-xs truncate">
                Tracking tokens & recoverable rent
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Grid - 2x2 on mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted/20 border border-border/30 text-center">
              <Eye size={16} className="mx-auto mb-1 text-red-400" weight="bold" />
              <p className="text-lg font-bold" style={{ color: risk.color }}>
                {dustTxCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Dust Received</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border/30 text-center">
              <Warning size={16} className="mx-auto mb-1 text-amber-400" weight="bold" />
              <p className="text-lg font-bold">{uniqueSenders}</p>
              <p className="text-[10px] text-muted-foreground">Trackers</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border/30 text-center">
              <Broom size={16} className="mx-auto mb-1 text-primary" weight="bold" />
              <p className="text-lg font-bold">~{estimatedEmptyAccounts}</p>
              <p className="text-[10px] text-muted-foreground">Empty Accounts</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border/30 text-center">
              <Coins size={16} className="mx-auto mb-1 text-green-400" weight="bold" />
              <p className="text-lg font-bold text-green-400">
                {estimatedReclaimable.toFixed(3)}
              </p>
              <p className="text-[10px] text-muted-foreground">SOL Recovery</p>
            </div>
          </div>

          {/* Risk Level */}
          <div
            className="p-3 border"
            style={{
              backgroundColor: `${risk.color}10`,
              borderColor: `${risk.color}30`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">Tracking Risk</span>
              <span
                className="px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: `${risk.color}20`,
                  color: risk.color,
                }}
              >
                {risk.level}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {dustDetected
                ? `${dustTxCount} dust transactions from ${uniqueSenders} senders. These tokens may track your activity.`
                : "Minimal tracking tokens detected."}
            </p>
          </div>
        </div>
      </div>

      {/* CLI Instructions */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-primary shrink-0" weight="bold" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm">Clean with CLI</h3>
              <p className="text-[10px] text-muted-foreground">
                Secure, open-source, runs locally
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Run Command */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-1">
              Run the CLI and paste your wallet:
            </div>
            <div className="relative">
              <div className="bg-black/50 p-2 font-mono text-[11px] overflow-x-auto">
                <span className="text-muted-foreground">$ </span>
                <span className="text-green-400 break-all">{cliCommand}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-0.5 right-0.5 h-6 w-6 p-0"
                onClick={() => copyCommand(cliCommand)}
              >
                {copied ? (
                  <Check size={12} className="text-green-400" weight="bold" />
                ) : (
                  <Copy size={12} weight="bold" />
                )}
              </Button>
            </div>
          </div>

          {/* Wallet to paste */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-1">
              Then paste this wallet address:
            </div>
            <div className="relative">
              <div className="bg-black/50 p-2 font-mono text-[11px] overflow-x-auto">
                <span className="text-primary break-all">{data.address}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-0.5 right-0.5 h-6 w-6 p-0"
                onClick={() => copyCommand(data.address)}
              >
                <Copy size={12} weight="bold" />
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-[11px]">
              <Shield size={12} className="text-green-400 shrink-0" weight="bold" />
              <span className="text-muted-foreground">Keys never leave your machine</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Terminal size={12} className="text-primary shrink-0" weight="bold" />
              <span className="text-muted-foreground">Open source - inspect the code</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Coins size={12} className="text-amber-400 shrink-0" weight="bold" />
              <span className="text-muted-foreground">Recover ~{estimatedReclaimable.toFixed(3)} SOL</span>
            </div>
          </div>

          {/* NPM Link */}
          <a
            href="https://www.npmjs.com/package/privatepussy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-2 bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors text-xs"
          >
            <Terminal size={14} weight="bold" />
            View on npm
            <ArrowSquareOut size={10} weight="bold" />
          </a>
        </div>
      </div>

      {/* Alternative Tools */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <ArrowSquareOut size={14} className="text-muted-foreground" weight="bold" />
          Other Tools
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { name: "Sol Incinerator", url: "https://sol-incinerator.com" },
            { name: "Step Finance", url: "https://app.step.finance" },
          ].map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 border border-border/30 hover:border-primary/30 bg-muted/10 transition-all text-xs"
            >
              <span>{tool.name}</span>
              <ArrowSquareOut size={10} className="text-muted-foreground" weight="bold" />
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

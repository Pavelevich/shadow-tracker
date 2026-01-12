import { PrivacyTool } from "@/types/privacy";

export const PRIVACY_TOOLS: PrivacyTool[] = [
  {
    id: "light-protocol",
    name: "Light Protocol",
    url: "https://shield.lightprotocol.com/",
    description: "ZK compression for private shielded transactions. Break on-chain linkability with zero-knowledge proofs.",
    icon: "Shield",
    category: "shielding",
    improvesMetrics: ["entropy", "kAnonymity", "dustProtection", "graphPrivacy"],
    gradient: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "border-cyan-500/30",
  },
  {
    id: "arcium",
    name: "Arcium",
    url: "https://arcium.com/",
    description: "Multi-Party Computation for confidential DeFi. Execute smart contracts on encrypted data.",
    icon: "Lock",
    category: "mpc",
    improvesMetrics: ["entropy", "kAnonymity", "temporalPrivacy"],
    gradient: "from-purple-500/20 to-purple-500/5",
    borderColor: "border-purple-500/30",
  },
  {
    id: "privacy-cash",
    name: "Privacy Cash",
    url: "https://privacy.cash/",
    description: "Privacy-focused transaction mixing. Increase entropy and break transaction patterns.",
    icon: "Shuffle",
    category: "mixing",
    improvesMetrics: ["entropy", "mixerUsage", "temporalPrivacy", "graphPrivacy"],
    gradient: "from-indigo-500/20 to-indigo-500/5",
    borderColor: "border-indigo-500/30",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    url: "https://jup.ag/",
    description: "Decentralized exchange aggregator. Swap tokens without KYC to reduce exchange exposure.",
    icon: "ArrowRightLeft",
    category: "dex",
    improvesMetrics: ["exchangeExposure", "entropy"],
    gradient: "from-green-500/20 to-green-500/5",
    borderColor: "border-green-500/30",
  },
  {
    id: "raydium",
    name: "Raydium",
    url: "https://raydium.io/",
    description: "AMM and DEX for anonymous trading. Trade without centralized exchange KYC requirements.",
    icon: "Droplets",
    category: "dex",
    improvesMetrics: ["exchangeExposure", "graphPrivacy"],
    gradient: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/30",
  },
];

export function getToolById(id: string): PrivacyTool | undefined {
  return PRIVACY_TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: PrivacyTool["category"]): PrivacyTool[] {
  return PRIVACY_TOOLS.filter((tool) => tool.category === category);
}

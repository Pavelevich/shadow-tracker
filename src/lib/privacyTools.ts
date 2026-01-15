import { PrivacyTool } from "@/types/privacy";

export const PRIVACY_TOOLS: PrivacyTool[] = [
  {
    id: "encrypt-trade",
    name: "encrypt.trade",
    url: "https://encrypt.trade/",
    description: "True private swaps and transfers on Solana. Start fresh with a completely unlinked wallet using encrypted transactions.",
    icon: "Shield",
    category: "shielding",
    improvesMetrics: ["entropy", "kAnonymity", "dustProtection", "graphPrivacy", "exchangeExposure"],
    gradient: "from-purple-500/20 to-purple-500/5",
    borderColor: "border-purple-500/30",
  },
  {
    id: "light-protocol",
    name: "Light Protocol",
    url: "https://www.zkcompression.com/",
    description: "ZK Compression framework for cost-efficient private transactions. Reduce costs by 99% with zero-knowledge proofs.",
    icon: "Lock",
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
    icon: "Shuffle",
    category: "mpc",
    improvesMetrics: ["entropy", "kAnonymity", "temporalPrivacy"],
    gradient: "from-indigo-500/20 to-indigo-500/5",
    borderColor: "border-indigo-500/30",
  },
  {
    id: "dust-protocol",
    name: "Dust Protocol",
    url: "https://www.dustprotocol.com/",
    description: "Privacy-preserving protocol with ZK proofs and confidential transfers. Selective privacy for compliance.",
    icon: "Droplets",
    category: "shielding",
    improvesMetrics: ["entropy", "mixerUsage", "temporalPrivacy", "graphPrivacy"],
    gradient: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/30",
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
    icon: "ArrowRightLeft",
    category: "dex",
    improvesMetrics: ["exchangeExposure", "graphPrivacy"],
    gradient: "from-green-500/20 to-green-500/5",
    borderColor: "border-green-500/30",
  },
];

export function getToolById(id: string): PrivacyTool | undefined {
  return PRIVACY_TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: PrivacyTool["category"]): PrivacyTool[] {
  return PRIVACY_TOOLS.filter((tool) => tool.category === category);
}

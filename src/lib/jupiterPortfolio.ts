import { JupiterPortfolioResponse, DeFiPosition, SurveillanceData, ProtocolUsage, SurveillanceRisk } from "@/types/privacy";

const JUPITER_API_KEY = "a9b21c1e-8bb8-4132-970d-b144e5f70845";
const JUPITER_API_URL = "https://api.jup.ag/portfolio/v1";

/**
 * Fetch DeFi positions from Jupiter Portfolio API
 */
export async function fetchJupiterPortfolio(address: string): Promise<JupiterPortfolioResponse | null> {
  try {
    const response = await fetch(`${JUPITER_API_URL}/positions/${address}`, {
      headers: {
        "x-api-key": JUPITER_API_KEY,
      },
    });

    if (!response.ok) {
      console.error("Jupiter API error:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Jupiter portfolio:", error);
    return null;
  }
}

/**
 * Transform Jupiter positions to our DeFi position format
 */
export function transformJupiterPositions(data: JupiterPortfolioResponse): DeFiPosition[] {
  if (!data.elements || data.elements.length === 0) {
    return [];
  }

  return data.elements.map((element) => {
    // Extract token symbols from the element data
    const tokens: string[] = [];
    if (element.data && typeof element.data === "object") {
      // Try to extract token info from various possible structures
      const dataObj = element.data as Record<string, unknown>;
      if (dataObj.tokens && Array.isArray(dataObj.tokens)) {
        tokens.push(...(dataObj.tokens as string[]));
      }
      if (dataObj.tokenSymbol) {
        tokens.push(dataObj.tokenSymbol as string);
      }
      if (dataObj.baseToken && typeof dataObj.baseToken === "object") {
        const baseToken = dataObj.baseToken as Record<string, unknown>;
        if (baseToken.symbol) tokens.push(baseToken.symbol as string);
      }
      if (dataObj.quoteToken && typeof dataObj.quoteToken === "object") {
        const quoteToken = dataObj.quoteToken as Record<string, unknown>;
        if (quoteToken.symbol) tokens.push(quoteToken.symbol as string);
      }
    }

    return {
      protocol: element.platformId || "Jupiter",
      type: element.label || element.type,
      value: element.value || 0,
      tokens: tokens.length > 0 ? tokens : ["Unknown"],
    };
  });
}

/**
 * Calculate total DeFi value from positions
 */
export function calculateTotalDeFiValue(positions: DeFiPosition[]): number {
  return positions.reduce((total, pos) => total + pos.value, 0);
}

/**
 * Known Solana protocols for categorization
 */
const PROTOCOL_CATEGORIES: Record<string, ProtocolUsage["category"]> = {
  // DEXes
  "jupiter": "DEX",
  "raydium": "DEX",
  "orca": "DEX",
  "meteora": "DEX",
  "lifinity": "DEX",
  "phoenix": "DEX",
  "openbook": "DEX",
  // Lending
  "marginfi": "Lending",
  "solend": "Lending",
  "kamino": "Lending",
  "drift": "Lending",
  "mango": "Lending",
  // Staking
  "marinade": "Staking",
  "jito": "Staking",
  "sanctum": "Staking",
  "blaze": "Staking",
  // NFT
  "magiceden": "NFT",
  "tensor": "NFT",
  // Bridges
  "wormhole": "Bridge",
  "debridge": "Bridge",
  "allbridge": "Bridge",
};

/**
 * Known Solana program IDs mapped to protocol names
 * These are used to detect protocol usage from transaction history
 */
export const KNOWN_PROGRAM_IDS: Record<string, { name: string; category: ProtocolUsage["category"] }> = {
  // Jupiter
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": { name: "Jupiter v6", category: "DEX" },
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB": { name: "Jupiter v4", category: "DEX" },
  // Raydium
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": { name: "Raydium AMM", category: "DEX" },
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK": { name: "Raydium CLMM", category: "DEX" },
  // Orca
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": { name: "Orca Whirlpool", category: "DEX" },
  "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": { name: "Orca", category: "DEX" },
  // Meteora
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo": { name: "Meteora DLMM", category: "DEX" },
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB": { name: "Meteora Pools", category: "DEX" },
  // MarginFi
  "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA": { name: "MarginFi", category: "Lending" },
  // Kamino
  "KLend2g3cP87ber41GJq8E16Ti5Nv6vePpAQYNoxpSs": { name: "Kamino Lend", category: "Lending" },
  "6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc": { name: "Kamino", category: "Lending" },
  // Solend
  "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo": { name: "Solend", category: "Lending" },
  // Drift
  "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH": { name: "Drift", category: "Lending" },
  // Mango
  "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg": { name: "Mango v4", category: "Lending" },
  // Marinade
  "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD": { name: "Marinade", category: "Staking" },
  // Jito
  "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb": { name: "Jito Staking", category: "Staking" },
  // Sanctum
  "5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx": { name: "Sanctum", category: "Staking" },
  // Magic Eden
  "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K": { name: "Magic Eden v2", category: "NFT" },
  // Tensor
  "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN": { name: "Tensor", category: "NFT" },
  // Wormhole
  "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth": { name: "Wormhole", category: "Bridge" },
  // DeBridge
  "DEbrdGj3HsRsAzx6uH4MKyREKxVAfBydijLUF3ygsFfh": { name: "DeBridge", category: "Bridge" },
  // Pump.fun
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P": { name: "Pump.fun", category: "DEX" },
  // Phantom
  "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY": { name: "Phoenix", category: "DEX" },
};

/**
 * Extract protocol usage from positions
 */
export function extractProtocolUsage(positions: DeFiPosition[]): ProtocolUsage[] {
  const protocolMap = new Map<string, ProtocolUsage>();

  positions.forEach((pos) => {
    const protocolId = pos.protocol.toLowerCase();
    const existing = protocolMap.get(protocolId);

    if (existing) {
      existing.interactionCount += 1;
    } else {
      protocolMap.set(protocolId, {
        name: pos.protocol,
        category: PROTOCOL_CATEGORIES[protocolId] || "Other",
        interactionCount: 1,
      });
    }
  });

  return Array.from(protocolMap.values()).sort((a, b) => b.interactionCount - a.interactionCount);
}

/**
 * Generate surveillance risks based on protocol usage
 */
export function generateSurveillanceRisks(
  protocols: ProtocolUsage[],
  hasExchangeInteraction: boolean,
  kycExposure: number
): SurveillanceRisk[] {
  const risks: SurveillanceRisk[] = [];

  // Chainalysis/Elliptic tracking
  risks.push({
    source: "Blockchain Analytics",
    description: "Companies like Chainalysis, Elliptic, and TRM Labs track all public transactions",
    severity: "HIGH",
    dataExposed: ["All transaction history", "Counterparty addresses", "Transaction amounts", "Timing patterns"],
  });

  // Exchange KYC risk
  if (hasExchangeInteraction || kycExposure > 0.1) {
    risks.push({
      source: "Exchange KYC Records",
      description: "Your CEX interactions link your wallet to your real identity via KYC data",
      severity: kycExposure > 0.5 ? "CRITICAL" : kycExposure > 0.3 ? "HIGH" : "MEDIUM",
      dataExposed: ["Full name", "Government ID", "Address", "Transaction history"],
    });
  }

  // DeFi protocol tracking
  if (protocols.length > 0) {
    risks.push({
      source: "DeFi Protocol Analytics",
      description: `Your activity across ${protocols.length} protocols creates a unique behavioral fingerprint`,
      severity: protocols.length > 5 ? "HIGH" : "MEDIUM",
      dataExposed: ["Protocol usage patterns", "Position sizes", "Trading strategies", "Risk preferences"],
    });
  }

  // Arkham Intelligence
  risks.push({
    source: "Arkham Intelligence",
    description: "AI-powered entity attribution can link your wallet to known entities and behaviors",
    severity: "HIGH",
    dataExposed: ["Entity labels", "Cluster associations", "Historical patterns", "Net worth estimates"],
  });

  // On-chain data permanence
  risks.push({
    source: "Permanent Blockchain Record",
    description: "All your transactions are permanently recorded and can never be deleted",
    severity: "CRITICAL",
    dataExposed: ["Complete transaction history", "Token holdings", "NFT ownership", "Smart contract interactions"],
  });

  return risks;
}

/**
 * Generate complete surveillance data for a wallet
 */
export async function getSurveillanceData(
  address: string,
  hasExchangeInteraction: boolean,
  kycExposure: number
): Promise<SurveillanceData> {
  // Fetch Jupiter positions
  const jupiterData = await fetchJupiterPortfolio(address);

  let defiPositions: DeFiPosition[] = [];
  if (jupiterData) {
    defiPositions = transformJupiterPositions(jupiterData);
  }

  const protocols = extractProtocolUsage(defiPositions);
  const totalValue = calculateTotalDeFiValue(defiPositions);
  const risks = generateSurveillanceRisks(protocols, hasExchangeInteraction, kycExposure);

  return {
    arkhamUrl: `https://platform.arkhamintelligence.com/explorer/address/${address}`,
    protocolsUsed: protocols,
    surveillanceRisks: risks,
    defiPositions,
    totalDeFiValue: totalValue,
  };
}

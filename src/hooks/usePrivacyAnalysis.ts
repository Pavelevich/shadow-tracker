import { useState } from "react";
import { PrivacyAnalysisResponse } from "@/types/privacy";

const API_BASE = "https://solprivacy.xyz/api/v3";

export function usePrivacyAnalysis() {
  const [data, setData] = useState<PrivacyAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (walletAddress: string) => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/analyze/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result: PrivacyAnalysisResponse = await response.json();
      
      if (!result.success) {
        throw new Error("Analysis failed. Please check the wallet address.");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, isLoading, error, analyze, reset };
}

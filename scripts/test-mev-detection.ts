#!/usr/bin/env npx ts-node
/**
 * MEV/Sandwich Attack Detection Test Script
 *
 * Purpose: Test our hypothesis that we can detect sandwich attacks
 * by analyzing swap transactions and their surrounding context.
 *
 * Run: npx ts-node scripts/test-mev-detection.ts
 */

import axios from 'axios';

// Config
const HELIUS_API_KEY = '40067999-16c1-4b5a-95a3-fa46f6dcdc21';
const HELIUS_URL = `https://api.helius.xyz/v0`;

// Known sandwich bot addresses (from research)
const KNOWN_ATTACKERS = [
  'vpeNALD89BZ4KxNUFjdLmFXBCwtyqBDQ85ouNoax38b', // DeezNode - $13.4M extracted
  'Ai4zqY7gjyAPhtUsGnCfabM5oHcZLt3htjpSoUKvxkkt', // Unknown - $287M extracted
  '4vJfp62jEzcYFnQ11oBJDgj6ZFrdEwcBBpoadNTpEWys', // Unknown - 210K attacks/month
  'B91piBSfCBRs5rUxCMRdJEGv7tNEnFxweWcdQJHJoFpi', // B91 Sandwicher
];

// Known DEX program IDs
const DEX_PROGRAMS = {
  JUPITER: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  RAYDIUM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  RAYDIUM_AMM: 'routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS',
  ORCA: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  METEORA: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
};

interface EnhancedTransaction {
  signature: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  slot: number;
  timestamp: number;
  description: string;
  accountData?: any[];
  nativeTransfers?: any[];
  tokenTransfers?: any[];
  instructions?: any[];
}

interface SandwichCandidate {
  victimTx: string;
  victimWallet: string;
  slot: number;
  timestamp: number;
  potentialAttackerNearby: boolean;
  attackerAddress?: string;
  dex: string;
}

async function getEnhancedTransactions(signatures: string[]): Promise<EnhancedTransaction[]> {
  try {
    const response = await axios.post(
      `${HELIUS_URL}/transactions?api-key=${HELIUS_API_KEY}`,
      { transactions: signatures }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching enhanced transactions:', error);
    return [];
  }
}

async function getTransactionHistory(address: string, limit = 50): Promise<EnhancedTransaction[]> {
  try {
    const response = await axios.get(
      `${HELIUS_URL}/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

async function getRecentAttackerActivity(attackerAddress: string): Promise<EnhancedTransaction[]> {
  console.log(`\n📡 Fetching recent activity for attacker: ${attackerAddress.slice(0, 8)}...`);
  return getTransactionHistory(attackerAddress, 20);
}

function isSwapTransaction(tx: EnhancedTransaction): boolean {
  if (!tx) return false;
  if (tx.type === 'SWAP') return true;
  if (tx.source === 'JUPITER' || tx.source === 'RAYDIUM' || tx.source === 'ORCA') return true;
  if (tx.description?.toLowerCase().includes('swap')) return true;
  return false;
}

async function analyzeWalletForSandwiches(walletAddress: string): Promise<SandwichCandidate[]> {
  console.log(`\n🔍 Analyzing wallet: ${walletAddress}`);
  console.log('=' .repeat(60));

  // 1. Get wallet's recent transactions
  const transactions = await getTransactionHistory(walletAddress, 100);
  console.log(`📊 Found ${transactions.length} recent transactions`);

  // 2. Filter for swaps
  const swaps = transactions.filter(isSwapTransaction);
  console.log(`💱 Found ${swaps.length} swap transactions`);

  if (swaps.length === 0) {
    console.log('❌ No swaps found - cannot detect sandwich attacks');
    return [];
  }

  const candidates: SandwichCandidate[] = [];

  // 3. For each swap, check if known attackers were active in same slot
  for (const swap of swaps.slice(0, 10)) { // Limit to first 10 for testing
    console.log(`\n  Checking swap: ${swap.signature.slice(0, 16)}...`);
    console.log(`    Slot: ${swap.slot}`);
    console.log(`    Type: ${swap.type}`);
    console.log(`    Source: ${swap.source}`);
    console.log(`    Description: ${swap.description?.slice(0, 50) || 'N/A'}`);

    // Check if any known attacker is in the account data
    const accountAddresses = swap.accountData?.map((a: any) => a.account) || [];
    const matchedAttacker = KNOWN_ATTACKERS.find(attacker =>
      accountAddresses.includes(attacker) ||
      swap.description?.includes(attacker.slice(0, 8))
    );

    if (matchedAttacker) {
      console.log(`    ⚠️  POTENTIAL SANDWICH: Known attacker in tx accounts!`);
      candidates.push({
        victimTx: swap.signature,
        victimWallet: walletAddress,
        slot: swap.slot,
        timestamp: swap.timestamp,
        potentialAttackerNearby: true,
        attackerAddress: matchedAttacker,
        dex: swap.source || 'UNKNOWN',
      });
    }
  }

  return candidates;
}

async function analyzeKnownAttacker(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 ANALYZING KNOWN ATTACKER ACTIVITY');
  console.log('='.repeat(60));

  // Get recent activity from the main attacker
  const attackerTxs = await getRecentAttackerActivity(KNOWN_ATTACKERS[0]);

  if (attackerTxs.length === 0) {
    console.log('❌ Could not fetch attacker transactions');
    return;
  }

  console.log(`\n📊 Attacker recent transactions:`);
  for (const tx of attackerTxs.slice(0, 5)) {
    console.log(`\n  TX: ${tx.signature.slice(0, 20)}...`);
    console.log(`    Type: ${tx.type}`);
    console.log(`    Source: ${tx.source}`);
    console.log(`    Slot: ${tx.slot}`);
    console.log(`    Fee Payer: ${tx.feePayer?.slice(0, 20)}...`);

    // Look for victim wallets in the same transactions
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      console.log(`    Token transfers: ${tx.tokenTransfers.length}`);
      for (const transfer of tx.tokenTransfers.slice(0, 3)) {
        if (transfer.fromUserAccount !== tx.feePayer) {
          console.log(`      Potential victim: ${transfer.fromUserAccount?.slice(0, 20)}...`);
        }
      }
    }
  }
}

async function findVictimFromSlot(slot: number): Promise<void> {
  // This would require Helius Pro or Geyser plugin to get all txs in a slot
  console.log(`\n⚠️ Slot-level analysis requires Helius Pro subscription`);
  console.log(`   Slot ${slot} would need full block data`);
}

// Simple heuristic: Check if user got worse price than expected
function estimateSlippageLoss(tx: EnhancedTransaction): number {
  // This is a placeholder - real implementation would compare expected vs actual output
  if (tx.tokenTransfers && tx.tokenTransfers.length >= 2) {
    // Very rough heuristic: if fee is unusually high, might indicate attack
    if (tx.fee > 10000000) { // > 0.01 SOL
      return tx.fee / 1000000000; // Convert lamports to SOL
    }
  }
  return 0;
}

async function main() {
  console.log('🥪 MEV/SANDWICH ATTACK DETECTION TEST');
  console.log('=====================================\n');
  console.log('Testing hypothesis: Can we detect sandwich attacks?');
  console.log('Known attackers:', KNOWN_ATTACKERS.length);
  console.log('');

  // Test 1: Analyze a known attacker to understand patterns
  await analyzeKnownAttacker();

  // Test 2: Analyze a sample wallet (use one of the test wallets from our system)
  const testWallets = [
    'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK', // Example active trading wallet
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Raydium wallet
  ];

  console.log('\n\n' + '='.repeat(60));
  console.log('🎯 ANALYZING POTENTIAL VICTIM WALLETS');
  console.log('='.repeat(60));

  for (const wallet of testWallets) {
    try {
      const candidates = await analyzeWalletForSandwiches(wallet);
      if (candidates.length > 0) {
        console.log(`\n✅ Found ${candidates.length} potential sandwich attacks!`);
        for (const c of candidates) {
          console.log(`   - TX: ${c.victimTx.slice(0, 20)}...`);
          console.log(`     Attacker: ${c.attackerAddress?.slice(0, 20)}...`);
          console.log(`     DEX: ${c.dex}`);
        }
      } else {
        console.log(`\n✨ No sandwich attacks detected for this wallet`);
      }
    } catch (error) {
      console.log(`\n❌ Error analyzing wallet: ${error}`);
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📋 SUMMARY & NEXT STEPS');
  console.log('='.repeat(60));
  console.log(`
  Detection Method Feasibility:
  ✅ Can fetch wallet transaction history (Helius API)
  ✅ Can identify swap transactions
  ✅ Can check against known attacker list
  ⚠️  Cannot get full slot data without Helius Pro
  ⚠️  Need more victim wallet examples for testing

  Recommended Approach for MVP:
  1. Cross-reference user's swap txs with known attacker addresses
  2. Flag transactions where known attackers appear in accounts
  3. Calculate estimated loss based on slippage/fee analysis
  4. Show "Vulnerability Score" based on DEX usage patterns

  For Full Implementation:
  - Need Helius Pro for slot-level analysis
  - Or use Jito Bundle API to check bundled transactions
  `);
}

main().catch(console.error);

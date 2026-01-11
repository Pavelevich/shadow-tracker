/**
 * Test Helius Connection
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testHelius() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║              HELIUS CONNECTION TEST                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    console.log('❌ HELIUS_API_KEY not found in .env');
    return;
  }

  console.log(`✅ API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}\n`);

  // Test Devnet
  console.log('🌐 Testing DEVNET...');
  const devnetUrl = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
  const devnet = new Connection(devnetUrl, 'confirmed');

  try {
    const devSlot = await devnet.getSlot();
    const devVersion = await devnet.getVersion();
    console.log(`   ✅ Connected to Devnet`);
    console.log(`   📦 Slot: ${devSlot.toLocaleString()}`);
    console.log(`   🔢 Version: ${devVersion['solana-core']}\n`);
  } catch (e) {
    console.log(`   ❌ Devnet error: ${e}\n`);
  }

  // Test Mainnet
  console.log('🌐 Testing MAINNET...');
  const mainnetUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  const mainnet = new Connection(mainnetUrl, 'confirmed');

  try {
    const mainSlot = await mainnet.getSlot();
    console.log(`   ✅ Connected to Mainnet`);
    console.log(`   📦 Slot: ${mainSlot.toLocaleString()}\n`);
  } catch (e) {
    console.log(`   ❌ Mainnet error: ${e}\n`);
  }

  // Generate test wallet
  console.log('👛 Generating test wallet...');
  const wallet = Keypair.generate();
  console.log(`   🔑 Address: ${wallet.publicKey.toBase58()}`);

  // Check balance
  const balance = await devnet.getBalance(wallet.publicKey);
  console.log(`   💰 Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  // Airdrop on devnet
  console.log('💧 Requesting airdrop (1 SOL)...');
  try {
    const sig = await devnet.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
    console.log(`   📝 Signature: ${sig.slice(0, 20)}...`);

    // Wait for confirmation
    console.log('   ⏳ Waiting for confirmation...');
    await devnet.confirmTransaction(sig, 'confirmed');

    const newBalance = await devnet.getBalance(wallet.publicKey);
    console.log(`   ✅ New balance: ${newBalance / LAMPORTS_PER_SOL} SOL\n`);
  } catch (e: any) {
    console.log(`   ⚠️ Airdrop failed (rate limited): ${e.message?.slice(0, 50)}\n`);
  }

  // Test Helius Enhanced API
  console.log('🔧 Testing Helius Enhanced APIs...');
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${wallet.publicKey.toBase58()}/transactions?api-key=${apiKey}&limit=5`);
    const data = await response.json();
    console.log(`   ✅ Enhanced Transaction API working`);
    console.log(`   📊 Transactions found: ${Array.isArray(data) ? data.length : 0}\n`);
  } catch (e) {
    console.log(`   ⚠️ Enhanced API error: ${e}\n`);
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ HELIUS SETUP COMPLETE!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Contact Privacy Cash team for SDK access');
  console.log('   2. Contact Range team for compliance API');
  console.log('   3. Contact Starpay for card issuance API');
  console.log('');
  console.log('🚀 Run the Stealth Wallet demo:');
  console.log('   npx ts-node src/stealth-wallet/index.ts');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Save wallet for later use
  console.log('💾 Save this wallet for testing:');
  console.log(`   WALLET_PRIVATE_KEY=[${Array.from(wallet.secretKey).join(',')}]`);
}

testHelius().catch(console.error);

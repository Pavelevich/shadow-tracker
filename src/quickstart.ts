/**
 * QUICKSTART - Primer paso para el hackathon
 *
 * Este archivo te ayuda a verificar que todo está configurado
 * y muestra el flujo básico de Privacy Cash + Helius
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

// ===========================================
// PASO 1: Verificar configuración
// ===========================================

async function checkConfig() {
  console.log('\n🔧 VERIFICANDO CONFIGURACIÓN...\n');

  const checks = {
    HELIUS_API_KEY: !!process.env.HELIUS_API_KEY,
    HELIUS_RPC_URL: !!process.env.HELIUS_RPC_URL,
    WALLET_PRIVATE_KEY: !!process.env.WALLET_PRIVATE_KEY,
  };

  let allGood = true;
  for (const [key, value] of Object.entries(checks)) {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}`);
    if (!value) allGood = false;
  }

  if (!allGood) {
    console.log('\n⚠️  Configura las variables faltantes en .env\n');
    return false;
  }

  console.log('\n✅ Configuración completa!\n');
  return true;
}

// ===========================================
// PASO 2: Probar conexión a Helius
// ===========================================

async function testHeliusConnection() {
  console.log('🌐 PROBANDO CONEXIÓN A HELIUS...\n');

  const rpcUrl = process.env.HELIUS_RPC_URL ||
    `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  const connection = new Connection(rpcUrl, 'confirmed');

  try {
    const slot = await connection.getSlot();
    const version = await connection.getVersion();

    console.log(`  ✅ Conectado a Solana`);
    console.log(`  📦 Slot actual: ${slot}`);
    console.log(`  🔢 Versión: ${version['solana-core']}\n`);

    return connection;
  } catch (error) {
    console.log(`  ❌ Error de conexión: ${error}\n`);
    return null;
  }
}

// ===========================================
// PASO 3: Crear wallet de prueba
// ===========================================

async function setupTestWallet(connection: Connection) {
  console.log('👛 CONFIGURANDO WALLET DE PRUEBA...\n');

  let wallet: Keypair;

  if (process.env.WALLET_PRIVATE_KEY) {
    // Usar wallet existente
    const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
    wallet = Keypair.fromSecretKey(new Uint8Array(privateKey));
    console.log(`  📍 Usando wallet existente`);
  } else {
    // Generar nueva wallet
    wallet = Keypair.generate();
    console.log(`  🆕 Wallet generada (solo para testing)`);
    console.log(`  ⚠️  Guarda esta clave en .env para no perderla:`);
    console.log(`  WALLET_PRIVATE_KEY=[${Array.from(wallet.secretKey)}]`);
  }

  console.log(`  🔑 Dirección: ${wallet.publicKey.toBase58()}`);

  // Verificar balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`  💰 Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  if (balance === 0) {
    console.log('  💡 Para devnet, obtén SOL gratis:');
    console.log(`     https://faucet.solana.com/?address=${wallet.publicKey.toBase58()}\n`);
  }

  return wallet;
}

// ===========================================
// PASO 4: Simular flujo de Privacy Cash
// ===========================================

async function simulatePrivacyFlow(connection: Connection, wallet: Keypair) {
  console.log('🔒 SIMULANDO FLUJO DE PRIVACIDAD...\n');

  console.log('  Flujo típico de Privacy Cash:');
  console.log('  ─────────────────────────────────────');
  console.log('  1️⃣  DEPOSIT: SOL público → Pool privado');
  console.log('  2️⃣  TRANSFER: Transferencia privada (shielded)');
  console.log('  3️⃣  WITHDRAW: Pool privado → SOL público (nueva dirección)');
  console.log('  ─────────────────────────────────────\n');

  // Ejemplo de estructura de datos
  const depositExample = {
    publicWallet: wallet.publicKey.toBase58(),
    amount: 1.0, // SOL
    commitment: 'hash(nullifier, secret)', // Pedersen commitment
    nullifier: 'hash(secret)', // Para prevenir double-spend
  };

  console.log('  📝 Ejemplo de depósito:');
  console.log(JSON.stringify(depositExample, null, 4));
  console.log();

  // Cuando tengas el SDK:
  console.log('  📦 Con Privacy Cash SDK:');
  console.log(`
    import * as privacyCash from '@nicefet/privacy-cash-sdk';

    // Depositar (shield)
    await privacyCash.deposit(connection, wallet, 1 * LAMPORTS_PER_SOL);

    // Ver balance privado
    const balance = await privacyCash.getPrivateBalance(connection, wallet.publicKey);

    // Retirar a nueva dirección (unshield)
    await privacyCash.withdraw(connection, wallet, newAddress, 0.5 * LAMPORTS_PER_SOL);
  `);
}

// ===========================================
// PASO 5: Siguientes pasos
// ===========================================

function showNextSteps() {
  console.log('📋 PRÓXIMOS PASOS\n');
  console.log('  ─────────────────────────────────────────────────────');
  console.log('  1. Obtener API keys (Helius, Privacy Cash, etc.)');
  console.log('  2. Fondear wallet de devnet con el faucet');
  console.log('  3. Probar Privacy Cash SDK con depósito real');
  console.log('  4. Integrar Helius webhooks para monitoreo');
  console.log('  5. Agregar capa de compliance (Range)');
  console.log('  ─────────────────────────────────────────────────────\n');

  console.log('📚 DOCUMENTACIÓN:');
  console.log('  • docs/BOUNTIES.md - Todos los premios');
  console.log('  • docs/IMPLEMENTATION_GUIDES.md - Código por bounty');
  console.log('  • docs/MATHEMATICAL_FOUNDATIONS.md - Papers académicos');
  console.log('  • docs/CRYPTO_PRIMITIVES.md - Implementaciones crypto\n');

  console.log('🏆 BOUNTIES RECOMENDADOS PARA EMPEZAR:');
  console.log('  1. Privacy Cash ($15,000) - SDK más accesible');
  console.log('  2. Helius ($5,000) - Solo necesitas RPC');
  console.log('  3. Encrypt.trade ($1,000) - Solo contenido educativo\n');
}

// ===========================================
// MAIN
// ===========================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         SOLANA PRIVACY HACKATHON - QUICKSTART          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. Verificar config
  const configOk = await checkConfig();

  // 2. Probar conexión (incluso sin config completa, usamos devnet público)
  const rpcUrl = process.env.HELIUS_RPC_URL ||
    process.env.HELIUS_API_KEY ?
    `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` :
    'https://api.devnet.solana.com';

  const connection = new Connection(rpcUrl, 'confirmed');
  console.log('🌐 Usando RPC:', rpcUrl.includes('helius') ? 'Helius' : 'Solana Public');

  const slot = await connection.getSlot();
  console.log(`📦 Conectado - Slot: ${slot}\n`);

  // 3. Setup wallet
  const wallet = await setupTestWallet(connection);

  // 4. Simular flujo
  await simulatePrivacyFlow(connection, wallet);

  // 5. Mostrar próximos pasos
  showNextSteps();
}

main().catch(console.error);

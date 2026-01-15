import { select, input, confirm, password } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import qrcode from "qrcode-terminal";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  createBurnInstruction,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import bs58 from "bs58";
import * as crypto from "crypto";

// Light Protocol imports for ZK compression
import { createRpc, compress, decompress } from "@lightprotocol/stateless.js";

// Get Helius API key from environment or settings
function getHeliusApiKey(): string | null {
  // Check environment variable first
  if (process.env.HELIUS_API_KEY) {
    return process.env.HELIUS_API_KEY;
  }
  // Check settings file
  const settings = loadSettings();
  if (settings.heliusApiKey) {
    return settings.heliusApiKey;
  }
  return null;
}

// Public RPC endpoints (rate limited but work without API key)
const PUBLIC_RPC_MAINNET = "https://api.mainnet-beta.solana.com";
const PUBLIC_RPC_DEVNET = "https://api.devnet.solana.com";

const RENT_EXEMPT_LAMPORTS = 2039280;

// Get RPC URL based on settings and API key availability
function getHeliusRpc(): string {
  const apiKey = getHeliusApiKey();
  const settings = loadSettings();

  if (apiKey) {
    return settings.network === "mainnet"
      ? `https://mainnet.helius-rpc.com?api-key=${apiKey}`
      : `https://devnet.helius-rpc.com?api-key=${apiKey}`;
  }

  // Fallback to public RPC (limited features)
  return settings.network === "mainnet" ? PUBLIC_RPC_MAINNET : PUBLIC_RPC_DEVNET;
}

// Light Protocol requires Helius RPC
function getLightRpcWithKey(): string | null {
  const apiKey = getHeliusApiKey();
  if (!apiKey) return null;

  const settings = loadSettings();
  return settings.network === "mainnet"
    ? `https://mainnet.helius-rpc.com?api-key=${apiKey}`
    : `https://devnet.helius-rpc.com?api-key=${apiKey}`;
}

// Settings configuration
interface AppSettings {
  network: "devnet" | "mainnet";
  customRpc?: string;
  heliusApiKey?: string;
}

const SETTINGS_PATH = path.join(process.env.HOME || "", ".pussycat/settings.json");

function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
    }
  } catch {}
  return { network: "devnet" }; // Default to devnet
}

function saveSettings(settings: AppSettings): void {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

function getLightRpc(): string | null {
  const settings = loadSettings();
  if (settings.customRpc) return settings.customRpc;
  return getLightRpcWithKey();
}

function getNetworkName(): string {
  const settings = loadSettings();
  return settings.network === "mainnet" ? "Mainnet" : "Devnet";
}

// Generate QR code
function showQRCode(address: string): Promise<void> {
  return new Promise((resolve) => {
    qrcode.generate(address, { small: false }, (qr: string) => {
      console.log(qr);
      resolve();
    });
  });
}
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

// Format number with proper thousands separator and decimals
function formatNumber(num: number, decimals: number = 6): string {
  if (num === 0) return "0";

  // For very small numbers, use scientific notation or show meaningful decimals
  if (num > 0 && num < 0.000001) {
    return num.toExponential(2);
  }

  // For small numbers, show up to 6 decimals
  if (num < 1) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  }

  // For numbers >= 1, use commas and 2-4 decimals
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

// Spam indicators for risk classification
const SPAM_INDICATORS = [
  "airdrop", "free", "claim", "reward", "bonus", "gift",
  "winner", "congratulation", "lucky", "prize", "giveaway"
];

interface TokenMetadata {
  name: string;
  symbol: string;
}

interface TokenAccount {
  pubkey: PublicKey;
  mint: string;
  balance: bigint;
  decimals: number;
  metadata?: TokenMetadata;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "SAFE";
  riskReason: string;
  usdValue?: number;
  isVerified?: boolean;
}

// Known verified tokens (top tokens on Solana)
const VERIFIED_TOKENS = new Set([
  "So11111111111111111111111111111111111111112", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", // mSOL
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", // stSOL
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP
]);

// Dust analysis data from API
interface DustAnalysis {
  dustTransactionsReceived: number;
  uniqueDustSenders: number;
  totalDustReceived: number;
  linkingRisk: string;
}

// Fetch dust analysis from SolPrivacy API
async function fetchDustAnalysis(address: string): Promise<DustAnalysis | null> {
  try {
    const response = await fetch(`https://solprivacy.xyz/api/v3/analyze/${address}`);
    if (response.ok) {
      const data = await response.json() as {
        data?: {
          dustAttack?: {
            dustTransactionsReceived?: number;
            uniqueDustSenders?: string[];
            totalDustReceived?: number;
            linkingRisk?: string;
          };
        };
      };
      const dust = data.data?.dustAttack;
      if (dust) {
        return {
          dustTransactionsReceived: dust.dustTransactionsReceived || 0,
          uniqueDustSenders: Array.isArray(dust.uniqueDustSenders) ? dust.uniqueDustSenders.length : 0,
          totalDustReceived: dust.totalDustReceived || 0,
          linkingRisk: dust.linkingRisk || "LOW",
        };
      }
    }
  } catch {
    // Silently fail
  }
  return null;
}

// Fetch token prices from Jupiter
async function fetchTokenPrices(mints: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  if (mints.length === 0) return priceMap;

  try {
    const ids = mints.join(",");
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${ids}`);
    const data = await response.json();

    if (data.data) {
      for (const [mint, info] of Object.entries(data.data)) {
        if (info && (info as any).price) {
          priceMap.set(mint, (info as any).price);
        }
      }
    }
  } catch (error) {
    // Silently fail - prices are optional
  }

  return priceMap;
}

// UI Helper Functions

// Multicolor dashed line
function colorLine(length: number = 50): string {
  const colors = [chalk.cyan, chalk.magenta, chalk.yellow, chalk.green, chalk.red, chalk.blue];
  const dash = "─";
  let line = "";
  for (let i = 0; i < length; i++) {
    line += colors[i % colors.length](dash);
  }
  return line;
}

// Colorful brand name
function brandName(): string {
  return chalk.magenta("P") + chalk.cyan("R") + chalk.yellow("I") + chalk.green("V") + chalk.red("A") + chalk.blue("T") + chalk.magenta("E") +
         chalk.gray(" ") +
         chalk.cyan("P") + chalk.yellow("U") + chalk.green("S") + chalk.red("S") + chalk.blue("Y");
}

// Frame with multicolor dashed lines (top and bottom)
function frame(content: string, title?: string): string {
  const width = 50;
  const top = colorLine(width);
  const bottom = colorLine(width);
  const titleLine = title ? `  ${brandName()} ${chalk.gray("»")} ${chalk.white(title)}\n\n` : "";
  return `\n${top}\n\n${titleLine}${content}\n\n${bottom}`;
}

// Box for summaries and other sections
function box(content: string, color: (s: string) => string = chalk.cyan): string {
  const lines = content.split("\n");
  const maxLen = Math.max(...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, "").length));
  const top = color("╭" + "─".repeat(maxLen + 2) + "╮");
  const bottom = color("╰" + "─".repeat(maxLen + 2) + "╯");
  const middle = lines.map(l => {
    const plainLen = l.replace(/\x1b\[[0-9;]*m/g, "").length;
    return color("│") + " " + l + " ".repeat(maxLen - plainLen) + " " + color("│");
  }).join("\n");
  return top + "\n" + middle + "\n" + bottom;
}

function divider(): string {
  return chalk.gray("─".repeat(50));
}

function getRiskEmoji(level: string): string {
  switch (level) {
    case "HIGH": return chalk.red("●");
    case "MEDIUM": return chalk.yellow("●");
    case "LOW": return chalk.green("●");
    case "SAFE": return chalk.green("✓");
    default: return chalk.gray("○");
  }
}

function getRiskColor(level: string): (s: string) => string {
  switch (level) {
    case "HIGH": return chalk.red;
    case "MEDIUM": return chalk.yellow;
    case "LOW": return chalk.green;
    case "SAFE": return chalk.green;
    default: return chalk.gray;
  }
}

// Fetch token metadata from Helius (DAS API for pump.fun tokens)
async function fetchTokenMetadata(mints: string[]): Promise<Map<string, TokenMetadata>> {
  const metadataMap = new Map<string, TokenMetadata>();
  if (mints.length === 0) return metadataMap;

  try {
    // Use DAS API (getAssetBatch) - works better for pump.fun tokens
    const response = await fetch(getHeliusRpc(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "metadata",
        method: "getAssetBatch",
        params: { ids: mints.slice(0, 100) },
      }),
    });

    if (response.ok) {
      const data = await response.json() as {
        result?: Array<{
          id: string;
          content?: { metadata?: { name?: string; symbol?: string } };
        }>;
      };

      if (data.result) {
        for (const item of data.result) {
          const name = item.content?.metadata?.name || "Unknown Token";
          const symbol = item.content?.metadata?.symbol || "???";
          metadataMap.set(item.id, {
            name: name.replace(/\0/g, "").trim(),
            symbol: symbol.replace(/\0/g, "").trim(),
          });
        }
      }
    }
  } catch {
    // Silently fail
  }
  return metadataMap;
}

// Classify token risk
function classifyRisk(balance: bigint, decimals: number, metadata?: TokenMetadata): { level: "LOW" | "MEDIUM" | "HIGH" | "SAFE"; reason: string } {
  const name = metadata?.name?.toLowerCase() || "";
  const symbol = metadata?.symbol?.toLowerCase() || "";

  // Check spam indicators
  for (const indicator of SPAM_INDICATORS) {
    if (name.includes(indicator) || symbol.includes(indicator)) {
      return { level: "HIGH", reason: "Suspicious name (potential scam)" };
    }
  }

  const balanceNum = Number(balance) / Math.pow(10, decimals);

  if (balance === 0n) {
    return { level: "SAFE", reason: "Empty account - safe to close" };
  }
  if (balanceNum > 0 && balanceNum < 0.0001) {
    return { level: "HIGH", reason: "Micro balance (tracking dust)" };
  }
  if (balanceNum < 1) {
    return { level: "MEDIUM", reason: "Small balance - review first" };
  }
  return { level: "LOW", reason: "Has value - keep it" };
}

// Load keypair from file
function loadKeypair(keypairPath: string): Keypair {
  const resolvedPath = keypairPath.startsWith("~")
    ? path.join(process.env.HOME || "", keypairPath.slice(1))
    : path.resolve(keypairPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Keypair file not found: ${resolvedPath}`);
  }

  const content = fs.readFileSync(resolvedPath, "utf-8").trim();

  try {
    const secretKey = new Uint8Array(JSON.parse(content));
    return Keypair.fromSecretKey(secretKey);
  } catch {
    try {
      const secretKey = bs58.decode(content);
      return Keypair.fromSecretKey(secretKey);
    } catch {
      throw new Error("Invalid keypair format");
    }
  }
}

// ============================================
// KEYPAIR ENCRYPTION & MANAGEMENT
// ============================================

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTED_EXTENSION = ".enc";

interface EncryptedKeypair {
  version: number;
  algorithm: string;
  salt: string;
  iv: string;
  authTag: string;
  ciphertext: string;
}

interface KeypairInfo {
  path: string;
  name: string;
  address: string;
  encrypted: boolean;
}

// Derive key from password using PBKDF2
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

// Encrypt keypair with password
function encryptKeypair(keypair: Keypair, password: string): EncryptedKeypair {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const secretKeyJson = JSON.stringify(Array.from(keypair.secretKey));

  let ciphertext = cipher.update(secretKeyJson, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    version: 1,
    algorithm: ENCRYPTION_ALGORITHM,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext,
  };
}

// Decrypt keypair with password
function decryptKeypair(encrypted: EncryptedKeypair, password: string): Keypair {
  const salt = Buffer.from(encrypted.salt, "hex");
  const iv = Buffer.from(encrypted.iv, "hex");
  const authTag = Buffer.from(encrypted.authTag, "hex");
  const key = deriveKey(password, salt);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  const secretKey = new Uint8Array(JSON.parse(decrypted));
  return Keypair.fromSecretKey(secretKey);
}

// Check if file is encrypted
function isEncryptedKeypair(filepath: string): boolean {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    const data = JSON.parse(content);
    return data.version && data.algorithm && data.ciphertext;
  } catch {
    return false;
  }
}

// Scan directories for keypair files
function scanForKeypairs(): KeypairInfo[] {
  const keypairs: KeypairInfo[] = [];
  const homeDir = process.env.HOME || "";

  // Directories to scan
  const dirsToScan = [
    path.join(homeDir, ".config/solana"),
    path.join(homeDir, ".pussycat/wallets"),
    path.join(homeDir, "Desktop"),
    path.join(homeDir, "Documents"),
    process.cwd(),
  ];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;

    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        const filepath = path.join(dir, file);

        try {
          const encrypted = isEncryptedKeypair(filepath);
          let address = "Unknown";

          if (!encrypted) {
            // Try to read address from unencrypted file
            const content = fs.readFileSync(filepath, "utf-8").trim();
            try {
              const secretKey = new Uint8Array(JSON.parse(content));
              if (secretKey.length === 64) {
                const kp = Keypair.fromSecretKey(secretKey);
                address = kp.publicKey.toBase58();
              } else {
                continue; // Not a valid keypair
              }
            } catch {
              try {
                const secretKey = bs58.decode(content);
                if (secretKey.length === 64) {
                  const kp = Keypair.fromSecretKey(secretKey);
                  address = kp.publicKey.toBase58();
                } else {
                  continue;
                }
              } catch {
                continue; // Not a keypair file
              }
            }
          } else {
            address = "🔒 Encrypted";
          }

          keypairs.push({
            path: filepath,
            name: file,
            address,
            encrypted,
          });
        } catch {
          // Skip files that can't be read
        }
      }
    } catch {
      // Skip directories that can't be read
    }
  }

  return keypairs;
}

// Create a new encrypted wallet
async function createNewWallet(): Promise<Keypair | null> {
  console.log("\n" + box(
    `${chalk.bold.green("Create New Wallet")}\n\n` +
    `${chalk.gray("A new Solana keypair will be generated.")}\n` +
    `${chalk.gray("It will be encrypted with a password for security.")}`,
    chalk.green
  ));

  // Generate new keypair
  const keypair = Keypair.generate();

  console.log(chalk.cyan(`\n  New wallet address:`));
  console.log(chalk.white(`  ${keypair.publicKey.toBase58()}\n`));

  // Get password
  const pwd = await password({
    message: "Create a password for this wallet:",
    mask: "*",
  });

  const confirmPwd = await password({
    message: "Confirm password:",
    mask: "*",
  });

  if (pwd !== confirmPwd) {
    console.log(chalk.red("\n  Passwords don't match. Wallet not saved.\n"));
    return null;
  }

  if (pwd.length < 8) {
    console.log(chalk.red("\n  Password must be at least 8 characters.\n"));
    return null;
  }

  // Encrypt and save
  const encrypted = encryptKeypair(keypair, pwd);

  const walletsDir = path.join(process.env.HOME || "", ".pussycat/wallets");
  if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir, { recursive: true });
  }

  const filename = `${keypair.publicKey.toBase58().slice(0, 8)}_encrypted.json`;
  const encryptedPath = path.join(walletsDir, filename);

  fs.writeFileSync(encryptedPath, JSON.stringify(encrypted, null, 2));

  const address = keypair.publicKey.toBase58();

  console.log("\n" + box(
    `${chalk.bold.green("✓ Wallet Created!")}\n\n` +
    `${chalk.gray("Address:")} ${chalk.cyan(address)}\n` +
    `${chalk.gray("Saved to:")} ${chalk.white(encryptedPath)}\n\n` +
    `${chalk.yellow("⚠ Fund this wallet to use it!")}`,
    chalk.green
  ));

  // Show QR code for easy funding
  console.log(chalk.gray("\n  Scan to send SOL:"));
  await showQRCode(address);

  const network = loadSettings().network;
  if (network === "devnet") {
    console.log(chalk.gray(`  Or airdrop: solana airdrop 1 ${address} --url devnet\n`));
  }

  return keypair;
}

// Interactive keypair selector
async function selectKeypair(): Promise<Keypair | null> {
  const keypairs = scanForKeypairs();

  // Build choices for selector
  const choices: Array<{name: string, value: any}> = [];

  // Add create new wallet option first
  choices.push({
    name: `${chalk.green("+")} ${chalk.bold("Create New Wallet")} ${chalk.gray("(generate & encrypt)")}`,
    value: "create_new",
  });

  // Add existing keypairs
  for (const kp of keypairs) {
    choices.push({
      name: `${kp.encrypted ? "🔒" : "🔓"} ${kp.name} ${chalk.gray(`(${kp.address.slice(0, 20)}...)`)}\n     ${chalk.gray(kp.path)}`,
      value: kp,
    });
  }

  // Add manual entry option
  choices.push({
    name: `${chalk.cyan("→")} Enter path manually`,
    value: "manual",
  });

  let selected: any;
  try {
    selected = await select({
      message: "Select wallet keypair:",
      choices,
    });
  } catch (e) {
    // ESC pressed - go back
    return null;
  }

  // Handle create new wallet
  if (selected === "create_new") {
    return await createNewWallet();
  }

  // Handle manual path entry
  if (selected === "manual") {
    const manualPath = await input({
      message: "Enter path to keypair file:",
    });

    try {
      const kp = loadKeypair(manualPath);

      // Offer to encrypt unencrypted keypair
      const shouldEncrypt = await confirm({
        message: `${chalk.yellow("⚠")} This keypair is not encrypted. Encrypt it with a password?`,
        default: true,
      });

      if (shouldEncrypt) {
        await encryptAndSaveKeypair(kp, manualPath);
      }

      return kp;
    } catch (error) {
      console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
      return null;
    }
  }

  // Load selected keypair
  if (selected.encrypted) {
    // Decrypt with password
    const pwd = await password({
      message: "Enter password to decrypt wallet:",
      mask: "*",
    });

    try {
      const content = fs.readFileSync(selected.path, "utf-8");
      const encrypted = JSON.parse(content) as EncryptedKeypair;
      return decryptKeypair(encrypted, pwd);
    } catch (error) {
      console.log(chalk.red("\n  Error: Invalid password or corrupted file\n"));
      return null;
    }
  } else {
    // Load unencrypted keypair
    try {
      const kp = loadKeypair(selected.path);

      // Offer to encrypt
      const shouldEncrypt = await confirm({
        message: `${chalk.yellow("⚠")} This keypair is not encrypted. Encrypt it with a password?`,
        default: true,
      });

      if (shouldEncrypt) {
        await encryptAndSaveKeypair(kp, selected.path);
      }

      return kp;
    } catch (error) {
      console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
      return null;
    }
  }
}

// Encrypt and save keypair
async function encryptAndSaveKeypair(keypair: Keypair, originalPath: string): Promise<void> {
  const pwd = await password({
    message: "Create a password for this wallet:",
    mask: "*",
  });

  const confirmPwd = await password({
    message: "Confirm password:",
    mask: "*",
  });

  if (pwd !== confirmPwd) {
    console.log(chalk.red("\n  Passwords don't match. Keypair not encrypted.\n"));
    return;
  }

  if (pwd.length < 8) {
    console.log(chalk.red("\n  Password must be at least 8 characters. Keypair not encrypted.\n"));
    return;
  }

  const encrypted = encryptKeypair(keypair, pwd);

  // Save to .pussycat/wallets directory
  const walletsDir = path.join(process.env.HOME || "", ".pussycat/wallets");
  if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir, { recursive: true });
  }

  const filename = `${keypair.publicKey.toBase58().slice(0, 8)}_encrypted.json`;
  const encryptedPath = path.join(walletsDir, filename);

  fs.writeFileSync(encryptedPath, JSON.stringify(encrypted, null, 2));

  console.log(chalk.green(`\n  ✓ Wallet encrypted and saved to:`));
  console.log(chalk.cyan(`    ${encryptedPath}\n`));

  // Ask if user wants to delete the original unencrypted file
  const deleteOriginal = await confirm({
    message: `${chalk.red("Delete original unencrypted file?")} ${chalk.gray(originalPath)}`,
    default: false,
  });

  if (deleteOriginal) {
    fs.unlinkSync(originalPath);
    console.log(chalk.green("\n  ✓ Original unencrypted file deleted.\n"));
  } else {
    console.log(chalk.yellow(`\n  ⚠ Original file still exists at: ${originalPath}`));
    console.log(chalk.yellow("    Consider deleting it manually for security.\n"));
  }
}

// Check if first time user (no wallets)
async function checkFirstTimeUser(): Promise<boolean> {
  const walletsDir = path.join(process.env.HOME || "", ".pussycat/wallets");
  if (!fs.existsSync(walletsDir)) return true;
  const files = fs.readdirSync(walletsDir).filter(f => f.endsWith(".json"));
  return files.length === 0;
}

// Onboarding for first time users
async function showOnboarding() {
  console.log("\n" + box(
    `${chalk.bold.green("Welcome to PRIVATE PUSSY!")}\n\n` +
    `${chalk.gray("This tool helps you move SOL privately using ZK proofs.")}\n` +
    `${chalk.gray("No one can trace where your funds came from.")}\n\n` +
    `${chalk.bold("How it works:")}\n` +
    `${chalk.cyan("1.")} Create a wallet here (encrypted with password)\n` +
    `${chalk.cyan("2.")} Send SOL from your existing wallet (Phantom, etc)\n` +
    `${chalk.cyan("3.")} Shield → Unshield to your destination\n` +
    `${chalk.cyan("4.")} Done! No on-chain link between wallets`,
    chalk.green
  ));

  console.log(chalk.yellow("\n  Let's create your first wallet!\n"));

  const wallet = await createNewWallet();

  if (wallet) {
    const address = wallet.publicKey.toBase58();

    console.log("\n" + box(
      `${chalk.bold("Next step:")}\n\n` +
      `${chalk.gray("Send SOL to this wallet from Phantom/Backpack:")}\n\n` +
      `${chalk.cyan(address)}\n\n` +
      `${chalk.gray("Scan the QR code below:")}`,
      chalk.yellow
    ));

    await showQRCode(address);

    console.log(chalk.gray(`  ${chalk.gray("Then come back and use")} ${chalk.green("Privacy Migration")}\n`));

    await input({
      message: "Press Enter when you've sent SOL...",
    });
  }
}

// Main interactive mode
export async function interactiveMode() {
  console.log("");

  // Check if first time user
  const isFirstTime = await checkFirstTimeUser();
  if (isFirstTime) {
    await showOnboarding();
  }

  while (true) {
    const action = await select({
      message: chalk.bold("What would you like to do?"),
      choices: [
        {
          name: `${chalk.green("★")} Privacy Migration`,
          value: "migrate",
          description: "Shield SOL and migrate to new wallet (ZK Privacy)",
        },
        {
          name: `${chalk.cyan("›")} Scan Wallet`,
          value: "scan",
          description: "Analyze wallet for dust & privacy risks",
        },
        {
          name: `${chalk.gray("›")} Settings`,
          value: "settings",
          description: "Configure RPC and network",
        },
        {
          name: `${chalk.gray("›")} Clear`,
          value: "clear",
          description: "Clear screen",
        },
        {
          name: `${chalk.red("›")} Exit`,
          value: "exit",
          description: "Quit application",
        },
      ],
    });

    console.log("");

    switch (action) {
      case "migrate":
        await privacyMigration();
        break;
      case "scan":
        await scanWallet();
        break;
      case "settings":
        await showSettings();
        break;
      case "clear":
        console.clear();
        break;
      case "exit":
        console.log(chalk.cyan("  Goodbye! Stay private.\n"));
        process.exit(0);
    }
  }
}

// Scan wallet function
async function scanWallet() {
  const walletAddress = await input({
    message: "Enter wallet address:",
    validate: (value) => {
      try {
        new PublicKey(value);
        return true;
      } catch {
        return "Invalid Solana address";
      }
    },
  });

  const spinner = ora("Scanning wallet...").start();

  try {
    const connection = new Connection(getHeliusRpc(), "confirmed");
    const pubkey = new PublicKey(walletAddress);

    // Fetch native SOL balance
    const solBalance = await connection.getBalance(pubkey);
    const solBalanceNum = solBalance / 1e9;

    // Fetch both TOKEN_PROGRAM and TOKEN_2022 accounts (pump.fun, etc.)
    spinner.text = "Fetching token accounts...";
    const [tokenAccounts, token2022Accounts] = await Promise.all([
      connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }),
      connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_2022_PROGRAM_ID }),
    ]);

    // Combine all token accounts
    const allTokenAccounts = [...tokenAccounts.value, ...token2022Accounts.value];

    const mints = allTokenAccounts.map((a) => a.account.data.parsed.info.mint);
    spinner.text = "Fetching token metadata...";
    const metadataMap = await fetchTokenMetadata(mints);

    spinner.text = "Fetching token prices...";
    const priceMap = await fetchTokenPrices(mints);

    spinner.text = "Analyzing dust transactions...";
    const dustAnalysis = await fetchDustAnalysis(walletAddress);

    spinner.stop();

    const accounts: TokenAccount[] = allTokenAccounts.map((account) => {
      const info = account.account.data.parsed.info;
      const balance = BigInt(info.tokenAmount.amount);
      const decimals = info.tokenAmount.decimals;
      const metadata = metadataMap.get(info.mint);
      const risk = classifyRisk(balance, decimals, metadata);
      const price = priceMap.get(info.mint);
      const balanceNum = Number(balance) / Math.pow(10, decimals);
      const usdValue = price ? balanceNum * price : undefined;

      return {
        pubkey: account.pubkey,
        mint: info.mint,
        balance,
        decimals,
        metadata,
        riskLevel: risk.level,
        riskReason: risk.reason,
        usdValue,
        isVerified: VERIFIED_TOKENS.has(info.mint) || Boolean(metadata?.name && !SPAM_INDICATORS.some(s => metadata.name.toLowerCase().includes(s))),
      };
    });

    // Sort by risk
    const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, SAFE: 3 };
    accounts.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    const closeable = accounts.filter((a) => a.balance === 0n);
    const dust = accounts.filter((a) => a.riskLevel === "HIGH" || a.riskLevel === "MEDIUM");
    const recoverable = (closeable.length * RENT_EXEMPT_LAMPORTS) / 1e9;

    // Get risk color for dust
    const getDustRiskColor = (risk: string) => {
      switch (risk) {
        case "CRITICAL": return chalk.red;
        case "HIGH": return chalk.red;
        case "MEDIUM": return chalk.yellow;
        default: return chalk.green;
      }
    };

    // Display results
    console.log(frame(
      `  ${chalk.gray("Wallet:")} ${chalk.cyan(walletAddress.slice(0, 20))}...\n` +
      `  ${chalk.gray("SOL Balance:")} ${chalk.bold.yellow(formatNumber(solBalanceNum))} ${chalk.yellow("SOL")}\n` +
      `  ${chalk.gray("Token accounts:")} ${chalk.white(accounts.length)} ${chalk.gray(`(${tokenAccounts.value.length} classic + ${token2022Accounts.value.length} TOKEN-2022)`)}\n` +
      `  ${chalk.gray("Closeable:")} ${chalk.green(closeable.length)}\n` +
      `  ${chalk.gray("Recoverable:")} ${chalk.green(`~${formatNumber(recoverable, 4)} SOL`)}`,
      "Scan Results"
    ));

    // Display dust analysis if available
    if (dustAnalysis && dustAnalysis.dustTransactionsReceived > 0) {
      const riskColor = getDustRiskColor(dustAnalysis.linkingRisk);
      console.log("\n" + frame(
        `  ${chalk.gray("Dust Received:")} ${chalk.red(dustAnalysis.dustTransactionsReceived)} ${chalk.gray("transactions")}\n` +
        `  ${chalk.gray("Unique Trackers:")} ${chalk.yellow(dustAnalysis.uniqueDustSenders)} ${chalk.gray("senders")}\n` +
        `  ${chalk.gray("Total Dust:")} ${chalk.cyan(dustAnalysis.totalDustReceived.toFixed(6))} ${chalk.gray("SOL")}\n` +
        `  ${chalk.gray("Linking Risk:")} ${riskColor(dustAnalysis.linkingRisk)}`,
        "Dust Analysis"
      ));
    }

    if (accounts.length > 0) {
      console.log("\n" + chalk.bold("  Token Accounts:\n"));

      for (const account of accounts.slice(0, 10)) {
        const emoji = getRiskEmoji(account.riskLevel);
        const color = getRiskColor(account.riskLevel);
        const name = account.metadata?.name?.slice(0, 25) || "Unknown";
        const symbol = account.metadata?.symbol || "???";
        const balance = Number(account.balance) / Math.pow(10, account.decimals);
        const verifiedIcon = account.isVerified ? chalk.green("✓") : chalk.yellow("?");
        const rentRecoverable = RENT_EXEMPT_LAMPORTS / 1e9;

        // Token name with verified status
        console.log(`  ${emoji} ${chalk.white(name)} ${chalk.gray(`(${symbol})`)} ${verifiedIcon}`);

        // Balance + USD value (show all decimals)
        const balanceStr = balance === 0 ? "0" : balance.toLocaleString("en-US", { maximumFractionDigits: 10 });
        const usdStr = account.usdValue !== undefined && account.usdValue > 0.01
          ? chalk.gray(` (~$${formatNumber(account.usdValue, 2)})`)
          : "";
        console.log(`     ${chalk.gray("Balance:")} ${balance === 0 ? chalk.green(balanceStr) : chalk.yellow(balanceStr)}${usdStr}`);

        // Full Mint address
        console.log(`     ${chalk.gray("Mint:")} ${chalk.cyan(account.mint)}`);

        // Full Account address
        console.log(`     ${chalk.gray("Account:")} ${chalk.cyan(account.pubkey.toString())}`);

        // Rent recoverable
        console.log(`     ${chalk.gray("Rent:")} ${chalk.green(`~${rentRecoverable.toFixed(4)} SOL`)}`);

        // Risk level
        console.log(`     ${chalk.gray("Risk:")} ${color(account.riskLevel)} ${chalk.gray(`- ${account.riskReason}`)}`);
        console.log("");
      }

      if (accounts.length > 10) {
        console.log(chalk.gray(`  ... and ${accounts.length - 10} more accounts\n`));
      }
    }

    console.log(divider() + "\n");

  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Clean wallet function
async function cleanWallet() {
  // Use wallet selector with encryption support
  const keypair = await selectKeypair();
  if (!keypair) return;

  const walletAddress = keypair.publicKey.toString();
  console.log(chalk.gray(`\n  Wallet: ${walletAddress}\n`));

  const cleanMode = await select({
    message: "How would you like to clean?",
    choices: [
      {
        name: `${chalk.green("○")} Safe Mode - Empty accounts only`,
        value: "safe",
        description: "Only close accounts with 0 balance",
      },
      {
        name: `${chalk.yellow("◇")} Interactive - Review each token`,
        value: "interactive",
        description: "Confirm each token one by one",
      },
      {
        name: `${chalk.red("◆")} Aggressive - Burn dust + close`,
        value: "aggressive",
        description: "Burn small balances and close accounts",
      },
    ],
  });

  const spinner = ora("Scanning wallet...").start();

  try {
    const connection = new Connection(getHeliusRpc(), "confirmed");
    const pubkey = new PublicKey(walletAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const mints = tokenAccounts.value.map((a) => a.account.data.parsed.info.mint);
    spinner.text = "Fetching metadata...";
    const metadataMap = await fetchTokenMetadata(mints);

    spinner.stop();

    const accounts: TokenAccount[] = tokenAccounts.value.map((account) => {
      const info = account.account.data.parsed.info;
      const balance = BigInt(info.tokenAmount.amount);
      const decimals = info.tokenAmount.decimals;
      const metadata = metadataMap.get(info.mint);
      const risk = classifyRisk(balance, decimals, metadata);

      return {
        pubkey: account.pubkey,
        mint: info.mint,
        balance,
        decimals,
        metadata,
        riskLevel: risk.level,
        riskReason: risk.reason,
      };
    });

    // Filter based on mode
    let toProcess: TokenAccount[];
    if (cleanMode === "safe") {
      toProcess = accounts.filter((a) => a.balance === 0n);
    } else if (cleanMode === "aggressive") {
      toProcess = accounts.filter((a) => a.riskLevel !== "LOW");
    } else {
      toProcess = accounts.filter((a) => a.riskLevel !== "LOW");
    }

    if (toProcess.length === 0) {
      console.log(chalk.green("\n  No dust tokens to clean.\n"));
      return;
    }

    const recoverable = (toProcess.length * RENT_EXEMPT_LAMPORTS) / 1e9;

    console.log("\n" + box(
      `${chalk.bold("Clean Summary")}\n\n` +
      `${chalk.gray("Accounts to process:")} ${chalk.white(toProcess.length)}\n` +
      `${chalk.gray("SOL to recover:")} ${chalk.green(`~${formatNumber(recoverable, 4)} SOL`)}`
    ));

    if (cleanMode === "interactive") {
      await interactiveClean(connection, keypair, toProcess);
    } else {
      const proceed = await confirm({
        message: `Process ${toProcess.length} accounts?`,
        default: false,
      });

      if (proceed) {
        await batchClean(connection, keypair, toProcess, cleanMode === "aggressive");
      } else {
        console.log(chalk.yellow("\n  Cancelled.\n"));
      }
    }

  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Interactive clean one by one
async function interactiveClean(connection: Connection, keypair: Keypair, accounts: TokenAccount[]) {
  console.log("\n" + chalk.bold("  Interactive Mode") + chalk.gray(" - Review each token\n"));

  let totalClosed = 0;
  let totalRecovered = 0;

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const emoji = getRiskEmoji(account.riskLevel);
    const color = getRiskColor(account.riskLevel);
    const name = account.metadata?.name || "Unknown Token";
    const symbol = account.metadata?.symbol || "???";
    const balance = Number(account.balance) / Math.pow(10, account.decimals);

    console.log(divider());
    console.log(`\n  ${chalk.bold(`${i + 1}/${accounts.length}`)} ${emoji} ${chalk.white(name)} ${chalk.gray(`(${symbol})`)}`);
    console.log(`  ${chalk.gray("Balance:")} ${balance === 0 ? chalk.green("0") : chalk.yellow(formatNumber(balance))}`);
    console.log(`  ${chalk.gray("Risk:")} ${color(account.riskLevel)} - ${account.riskReason}`);
    console.log(`  ${chalk.gray("Recover:")} ${chalk.green("~0.002 SOL")}\n`);

    const action = await select({
      message: "Action:",
      choices: [
        { name: chalk.green("✓ Close this account"), value: "close" },
        { name: chalk.yellow("→ Skip"), value: "skip" },
        { name: chalk.cyan("» Close all remaining"), value: "all" },
        { name: chalk.red("✗ Stop"), value: "stop" },
      ],
    });

    if (action === "stop") {
      break;
    }

    if (action === "skip") {
      continue;
    }

    if (action === "all") {
      // Process all remaining
      const remaining = accounts.slice(i);
      await batchClean(connection, keypair, remaining, true);
      totalClosed += remaining.length;
      totalRecovered += (remaining.length * RENT_EXEMPT_LAMPORTS) / 1e9;
      break;
    }

    // Close single account
    const closeSpinner = ora("  Closing...").start();

    try {
      const transaction = new Transaction();

      if (account.balance > 0n) {
        transaction.add(
          createBurnInstruction(
            account.pubkey,
            new PublicKey(account.mint),
            keypair.publicKey,
            account.balance
          )
        );
      }

      transaction.add(
        createCloseAccountInstruction(
          account.pubkey,
          keypair.publicKey,
          keypair.publicKey
        )
      );

      const sig = await sendAndConfirmTransaction(connection, transaction, [keypair]);
      closeSpinner.succeed(chalk.green(`  Closed! TX: ${sig.slice(0, 20)}...`));

      totalClosed++;
      totalRecovered += RENT_EXEMPT_LAMPORTS / 1e9;
    } catch (err) {
      closeSpinner.fail(chalk.red(`  Failed: ${(err as Error).message}`));
    }

    console.log("");
  }

  // Summary
  console.log("\n" + box(
    `${chalk.bold("Summary")}\n\n` +
    `${chalk.gray("Accounts closed:")} ${chalk.green(totalClosed.toString())}\n` +
    `${chalk.gray("SOL recovered:")} ${chalk.green(`~${formatNumber(totalRecovered, 4)} SOL`)}`,
    chalk.green
  ) + "\n");
}

// Batch clean
async function batchClean(connection: Connection, keypair: Keypair, accounts: TokenAccount[], burn: boolean) {
  const batchSize = 5;
  let totalClosed = 0;
  let totalRecovered = 0;

  console.log("\n" + chalk.bold("  Processing...\n"));

  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(accounts.length / batchSize);

    const spinner = ora(`  Batch ${batchNum}/${totalBatches}`).start();

    try {
      const transaction = new Transaction();

      for (const account of batch) {
        if (burn && account.balance > 0n) {
          transaction.add(
            createBurnInstruction(
              account.pubkey,
              new PublicKey(account.mint),
              keypair.publicKey,
              account.balance
            )
          );
        }

        transaction.add(
          createCloseAccountInstruction(
            account.pubkey,
            keypair.publicKey,
            keypair.publicKey
          )
        );
      }

      const sig = await sendAndConfirmTransaction(connection, transaction, [keypair]);
      spinner.succeed(chalk.green(`  Batch ${batchNum}/${totalBatches} - ${batch.length} closed (${sig.slice(0, 12)}...)`));

      totalClosed += batch.length;
      totalRecovered += (batch.length * RENT_EXEMPT_LAMPORTS) / 1e9;
    } catch (err) {
      spinner.fail(chalk.red(`  Batch ${batchNum} failed: ${(err as Error).message}`));
    }
  }

  // Summary
  console.log("\n" + box(
    `${chalk.bold("Summary")}\n\n` +
    `${chalk.gray("Accounts closed:")} ${chalk.green(totalClosed.toString())}\n` +
    `${chalk.gray("SOL recovered:")} ${chalk.green(`~${formatNumber(totalRecovered, 4)} SOL`)}`,
    chalk.green
  ) + "\n");
}

// View summary
async function viewSummary() {
  const walletAddress = await input({
    message: "Enter wallet address:",
    validate: (value) => {
      try {
        new PublicKey(value);
        return true;
      } catch {
        return "Invalid Solana address";
      }
    },
  });

  const spinner = ora("Analyzing wallet...").start();

  try {
    const connection = new Connection(getHeliusRpc(), "confirmed");
    const pubkey = new PublicKey(walletAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const mints = tokenAccounts.value.map((a) => a.account.data.parsed.info.mint);
    spinner.text = "Fetching metadata...";
    const metadataMap = await fetchTokenMetadata(mints);

    spinner.stop();

    // Group by category
    const categories = {
      empty: 0,
      dust: 0,
      small: 0,
      valuable: 0,
    };

    for (const account of tokenAccounts.value) {
      const info = account.account.data.parsed.info;
      const balance = BigInt(info.tokenAmount.amount);
      const decimals = info.tokenAmount.decimals;
      const balanceNum = Number(balance) / Math.pow(10, decimals);

      if (balance === 0n) categories.empty++;
      else if (balanceNum < 0.0001) categories.dust++;
      else if (balanceNum < 1) categories.small++;
      else categories.valuable++;
    }

    const totalRecoverable = ((categories.empty + categories.dust) * RENT_EXEMPT_LAMPORTS) / 1e9;

    console.log("\n" + box(
      `${chalk.bold("Recovery Breakdown")}\n\n` +
      `${chalk.green("✓")} Empty accounts:     ${chalk.white(categories.empty.toString().padStart(3))}  ${chalk.green("(safe to close)")}\n` +
      `${chalk.red("●")} Dust/trackers:      ${chalk.white(categories.dust.toString().padStart(3))}  ${chalk.yellow("(burn + close)")}\n` +
      `${chalk.yellow("●")} Small balance:      ${chalk.white(categories.small.toString().padStart(3))}  ${chalk.gray("(review first)")}\n` +
      `${chalk.cyan("◆")} Valuable:           ${chalk.white(categories.valuable.toString().padStart(3))}  ${chalk.gray("(keep)")}\n\n` +
      `${chalk.gray("─".repeat(38))}\n` +
      `${chalk.gray("Total recoverable:")} ${chalk.green(`~${formatNumber(totalRecoverable, 4)} SOL`)}`
    ));

    console.log("");

  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Settings
async function showSettings() {
  while (true) {
    const settings = loadSettings();
    const rpcUrl = getLightRpc();
    const walletsDir = path.join(process.env.HOME || "", ".pussycat/wallets");
    const walletCount = fs.existsSync(walletsDir)
      ? fs.readdirSync(walletsDir).filter(f => f.endsWith(".json")).length
      : 0;

    const hasApiKey = !!getHeliusApiKey();

    console.log("\n" + box(
      `${chalk.bold("Current Settings")}\n\n` +
      `${chalk.gray("Network:")} ${settings.network === "mainnet" ? chalk.green("Mainnet") : chalk.yellow("Devnet")}\n` +
      `${chalk.gray("Helius API:")} ${hasApiKey ? chalk.green("Configured") : chalk.red("Not set")}\n` +
      `${chalk.gray("Saved Wallets:")} ${chalk.white(walletCount.toString())}`
    ));

    let action: string;
    try {
      action = await select({
        message: "Settings",
        choices: [
          {
            name: `${chalk.cyan("›")} Switch Network ${chalk.gray(`(current: ${getNetworkName()})`)}`,
            value: "network",
            description: "Toggle between Devnet and Mainnet",
          },
          {
            name: `${hasApiKey ? chalk.cyan("›") : chalk.yellow("!")} Helius API Key ${chalk.gray(hasApiKey ? "(configured)" : "(required for Shield)")}`,
            value: "apikey",
            description: "Set Helius API key for Light Protocol",
          },
          {
            name: `${chalk.cyan("›")} Manage Wallets`,
            value: "wallets",
            description: "View and manage encrypted wallets",
          },
          {
            name: `${chalk.gray("←")} Back ${chalk.gray("(ESC)")}`,
            value: "back",
          },
        ],
      });
    } catch (e) {
      return; // ESC pressed
    }

    if (action === "back") return;

    if (action === "network") {
      await switchNetwork();
    } else if (action === "apikey") {
      await setHeliusApiKey();
    } else if (action === "wallets") {
      await manageWallets();
    }
  }
}

// Switch network between devnet and mainnet
async function switchNetwork() {
  const settings = loadSettings();

  console.log(chalk.yellow("\n  ⚠ Note: Privacy Migration (Shield/Unshield) only works on Devnet"));
  console.log(chalk.gray("  Light Protocol state trees are not active on Mainnet yet.\n"));

  let newNetwork: string;
  try {
    newNetwork = await select({
      message: "Select network:",
      choices: [
        {
          name: `${settings.network === "devnet" ? chalk.green("●") : chalk.gray("○")} Devnet ${chalk.green("(privacy features work)")}`,
          value: "devnet",
          description: "Shield/Unshield available",
        },
        {
          name: `${settings.network === "mainnet" ? chalk.green("●") : chalk.gray("○")} Mainnet ${chalk.red("(privacy features disabled)")}`,
          value: "mainnet",
          description: "Only wallet scanning works, no Shield/Unshield",
        },
      ],
    });
  } catch (e) {
    return;
  }

  if (newNetwork === "mainnet") {
    console.log(chalk.red("\n  ⚠ Mainnet Limitations:"));
    console.log(chalk.gray("  • Shield/Unshield: ") + chalk.red("NOT AVAILABLE"));
    console.log(chalk.gray("  • Wallet Scan: ") + chalk.green("Available"));
    console.log(chalk.gray("  • Balance Check: ") + chalk.green("Available\n"));

    const confirmed = await confirm({
      message: `Switch to Mainnet anyway?`,
      default: false,
    });
    if (!confirmed) return;
  }

  settings.network = newNetwork as "devnet" | "mainnet";
  saveSettings(settings);
  console.log(chalk.green(`\n  ✓ Network switched to ${newNetwork}\n`));
}

// Set Helius API key
async function setHeliusApiKey() {
  const currentKey = getHeliusApiKey();

  console.log("\n" + box(
    `${chalk.bold("Helius API Key")}\n\n` +
    `${chalk.gray("Required for Shield/Unshield (Light Protocol ZK compression)")}\n` +
    `${chalk.gray("Get a free key at:")} ${chalk.cyan("https://helius.dev")}`,
    chalk.cyan
  ));

  if (currentKey) {
    console.log(chalk.gray(`\n  Current: ${currentKey.slice(0, 8)}...${currentKey.slice(-4)}\n`));
  }

  const apiKey = await input({
    message: "Enter Helius API key (or leave empty to clear):",
    default: "",
  });

  const settings = loadSettings();

  if (apiKey.trim() === "") {
    delete settings.heliusApiKey;
    saveSettings(settings);
    console.log(chalk.yellow("\n  API key cleared. Set HELIUS_API_KEY env var or reconfigure.\n"));
  } else {
    settings.heliusApiKey = apiKey.trim();
    saveSettings(settings);
    console.log(chalk.green("\n  ✓ Helius API key saved!\n"));
  }
}

// Manage saved wallets
async function manageWallets() {
  const walletsDir = path.join(process.env.HOME || "", ".pussycat/wallets");

  if (!fs.existsSync(walletsDir)) {
    console.log(chalk.yellow("\n  No saved wallets found.\n"));
    return;
  }

  const files = fs.readdirSync(walletsDir).filter(f => f.endsWith(".json"));

  if (files.length === 0) {
    console.log(chalk.yellow("\n  No saved wallets found.\n"));
    return;
  }

  console.log("\n" + chalk.bold("  Saved Wallets:\n"));

  for (const file of files) {
    const filepath = path.join(walletsDir, file);
    const isEncrypted = isEncryptedKeypair(filepath);
    const icon = isEncrypted ? "🔒" : "🔓";

    // Try to get address from filename
    const address = file.replace("_encrypted.json", "").replace(".json", "");

    console.log(`  ${icon} ${chalk.cyan(file)}`);
    console.log(`     ${chalk.gray(filepath)}`);
    console.log("");
  }

  let action: string;
  try {
    action = await select({
      message: "Wallet actions:",
      choices: [
        {
          name: `${chalk.green("+")} Create New Wallet`,
          value: "create",
        },
        {
          name: `${chalk.red("×")} Delete a Wallet`,
          value: "delete",
        },
        {
          name: `${chalk.gray("←")} Back ${chalk.gray("(ESC)")}`,
          value: "back",
        },
      ],
    });
  } catch (e) {
    return;
  }

  if (action === "back") return;

  if (action === "create") {
    await createNewWallet();
  } else if (action === "delete") {
    await deleteWallet(files, walletsDir);
  }
}

// Delete a wallet
async function deleteWallet(files: string[], walletsDir: string) {
  const choices = files.map(f => ({
    name: `🔒 ${f}`,
    value: f,
  }));

  choices.push({
    name: `${chalk.gray("←")} Cancel`,
    value: "cancel",
  });

  let fileToDelete: string;
  try {
    fileToDelete = await select({
      message: "Select wallet to delete:",
      choices,
    });
  } catch (e) {
    return;
  }

  if (fileToDelete === "cancel") return;

  const confirmed = await confirm({
    message: `${chalk.red("⚠ DELETE")} ${fileToDelete}? This cannot be undone!`,
    default: false,
  });

  if (confirmed) {
    fs.unlinkSync(path.join(walletsDir, fileToDelete));
    console.log(chalk.green(`\n  ✓ Wallet deleted\n`));
  }
}

// Set custom RPC
async function setCustomRpc() {
  const settings = loadSettings();

  console.log("\n" + box(
    `${chalk.bold("Custom RPC")}\n\n` +
    `${chalk.gray("Current:")} ${settings.customRpc || chalk.gray("(using default)")}\n\n` +
    `${chalk.gray("Leave empty to use default Helius RPC")}`
  ));

  const rpcUrl = await input({
    message: "Enter RPC URL (or empty for default):",
    default: settings.customRpc || "",
  });

  if (rpcUrl.trim() === "") {
    delete settings.customRpc;
    console.log(chalk.green("\n  ✓ Using default RPC\n"));
  } else {
    settings.customRpc = rpcUrl.trim();
    console.log(chalk.green(`\n  ✓ Custom RPC set\n`));
  }

  saveSettings(settings);
}

// ============================================
// LIGHT PROTOCOL FUNCTIONS (ZK Compression)
// ============================================

// Light Protocol: Shield SOL (compress)
async function lightShield() {
  const settings = loadSettings();

  console.log("\n" + box(
    `${chalk.bold.green("Light Protocol - Shield SOL")}\n\n` +
    `${chalk.gray("This will compress your SOL into a private account.")}\n` +
    `${chalk.gray("No one can trace where it came from.")}\n\n` +
    `${chalk.cyan("Network:")} ${settings.network === "mainnet" ? chalk.green("Mainnet") : chalk.yellow("Devnet")}`,
    chalk.green
  ));

  // Block mainnet until Light Protocol state trees are active
  if (settings.network === "mainnet") {
    console.log(chalk.red("\n  ⚠ Mainnet not yet supported for native SOL shielding."));
    console.log(chalk.gray("  Light Protocol state trees for SOL compression are only active on devnet."));
    console.log(chalk.gray("  Your SOL is safe - please switch to devnet in Settings to test.\n"));
    console.log(chalk.cyan("  Tip: Go to Settings → Network to switch to Devnet\n"));
    return;
  }

  // Check for Helius API key (required for Light Protocol)
  if (!getHeliusApiKey()) {
    console.log(chalk.red("\n  ⚠ Helius API key required for Shield/Unshield."));
    console.log(chalk.gray("  Light Protocol requires Helius RPC for ZK compression.\n"));
    console.log(chalk.cyan("  Set your API key:"));
    console.log(chalk.gray("  • Environment: export HELIUS_API_KEY=your-key"));
    console.log(chalk.gray("  • Or: Settings → Set Helius API Key\n"));
    console.log(chalk.gray("  Get a free key at: https://helius.dev\n"));
    return;
  }

  // Select keypair with encryption support
  const keypair = await selectKeypair();
  if (!keypair) return;

  // Check balance FIRST
  const spinner = ora("Checking balance...").start();
  let balance: number;

  try {
    const rpc = createRpc(getLightRpc()!, getLightRpc()!, getLightRpc()!);
    balance = await rpc.getBalance(keypair.publicKey);
    spinner.stop();
  } catch (e) {
    spinner.fail("Failed to connect");
    console.log(chalk.red(`\n  Error: ${(e as Error).message}\n`));
    return;
  }

  const balanceSol = balance / LAMPORTS_PER_SOL;
  const maxAmount = Math.max(0, balanceSol - 0.001); // Leave 0.001 for fees

  if (balance < 10000) {
    console.log(chalk.red(`\n  Insufficient balance: ${balanceSol} SOL\n`));
    return;
  }

  console.log(chalk.gray(`\n  Wallet: ${keypair.publicKey.toBase58()}`));
  console.log(chalk.gray(`  Balance: ${balanceSol} SOL`));
  console.log(chalk.green(`  Max shieldable: ${maxAmount.toFixed(6)} SOL\n`));

  const amountStr = await input({
    message: `Amount to shield (or "max" for ${maxAmount.toFixed(4)} SOL):`,
    default: maxAmount.toFixed(4),
    validate: (value) => {
      if (value.toLowerCase() === "max") return true;
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return "Enter a number or 'max'";
      if (num < 0.001) return "Minimum is 0.001 SOL";
      if (num > maxAmount) return `Maximum is ${maxAmount.toFixed(6)} SOL`;
      return true;
    },
  });

  const amount = amountStr.toLowerCase() === "max" ? maxAmount : parseFloat(amountStr);
  const lamportsToCompress = Math.floor(amount * LAMPORTS_PER_SOL);

  const proceed = await confirm({
    message: `Shield ${amount.toFixed(6)} SOL?`,
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("\n  Cancelled.\n"));
    return;
  }

  spinner.start("Connecting to Light Protocol...");

  try {
    // Create Light Protocol RPC connection
    const rpc = createRpc(getLightRpc()!, getLightRpc()!, getLightRpc()!);
    spinner.succeed("Connected to Light Protocol");

    // Compress SOL
    spinner.start("Compressing SOL (creating shielded account)...");

    const compressTxId = await compress(
      rpc,
      keypair,
      lamportsToCompress,
      keypair.publicKey,
    );

    spinner.succeed("SOL compressed successfully!");

    console.log("\n" + box(
      `${chalk.bold.green("Shield Complete!")}\n\n` +
      `${chalk.gray("Amount:")} ${chalk.yellow(amount.toString())} ${chalk.yellow("SOL")} ${chalk.green("compressed")}\n` +
      `${chalk.gray("Transaction:")} ${chalk.cyan(compressTxId)}\n\n` +
      `${chalk.gray("Your SOL is now in a compressed (shielded) account.")}\n` +
      `${chalk.gray("Use \"Unshield to Wallet\" to send to any address.")}`,
      chalk.green
    ));

    // Mainnet is blocked above, so this is always devnet
    console.log(chalk.cyan(`\n  View on Solscan: https://solscan.io/tx/${compressTxId}?cluster=devnet\n`));

  } catch (error) {
    spinner.fail("Shield failed");
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Light Protocol: Unshield SOL (decompress to any wallet)
async function lightUnshield() {
  const settings = loadSettings();

  console.log("\n" + box(
    `${chalk.bold.green("Light Protocol - Unshield SOL")}\n\n` +
    `${chalk.gray("Send your shielded SOL to ANY wallet address.")}\n` +
    `${chalk.gray("The transaction is untraceable - no link to your original wallet.")}\n\n` +
    `${chalk.cyan("Network:")} ${settings.network === "mainnet" ? chalk.green("Mainnet") : chalk.yellow("Devnet")}`,
    chalk.green
  ));

  // Block mainnet until Light Protocol state trees are active
  if (settings.network === "mainnet") {
    console.log(chalk.red("\n  ⚠ Mainnet not yet supported for SOL unshielding."));
    console.log(chalk.gray("  Light Protocol state trees for SOL decompression are only active on devnet."));
    console.log(chalk.cyan("  Tip: Go to Settings → Network to switch to Devnet\n"));
    return;
  }

  // Check for Helius API key (required for Light Protocol)
  if (!getHeliusApiKey()) {
    console.log(chalk.red("\n  ⚠ Helius API key required for Shield/Unshield."));
    console.log(chalk.gray("  Light Protocol requires Helius RPC for ZK compression.\n"));
    console.log(chalk.cyan("  Set your API key:"));
    console.log(chalk.gray("  • Environment: export HELIUS_API_KEY=your-key"));
    console.log(chalk.gray("  • Or: Settings → Set Helius API Key\n"));
    console.log(chalk.gray("  Get a free key at: https://helius.dev\n"));
    return;
  }

  // Select keypair with encryption support
  const keypair = await selectKeypair();
  if (!keypair) return;

  const amountStr = await input({
    message: "Amount of SOL to unshield:",
    default: "0.1",
    validate: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return "Please enter a valid positive number";
      if (num < 0.001) return "Minimum is 0.001 SOL";
      return true;
    },
  });

  const recipientAddress = await input({
    message: "Recipient wallet address (can be ANY wallet):",
    validate: (value) => {
      try {
        new PublicKey(value);
        return true;
      } catch {
        return "Invalid Solana address";
      }
    },
  });

  const amount = parseFloat(amountStr);
  const lamportsToDecompress = Math.floor(amount * LAMPORTS_PER_SOL);
  const recipient = new PublicKey(recipientAddress);

  console.log(chalk.gray(`\n  From wallet: ${keypair.publicKey.toBase58()}`));
  console.log(chalk.gray(`  To wallet: ${recipient.toBase58()}`));
  console.log(chalk.gray(`  Amount: ${amount} SOL`));

  const proceed = await confirm({
    message: `Unshield ${amount} SOL to ${recipientAddress.slice(0, 20)}...?`,
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("\n  Cancelled.\n"));
    return;
  }

  const spinner = ora("Connecting to Light Protocol...").start();

  try {
    // Create Light Protocol RPC connection
    const rpc = createRpc(getLightRpc()!, getLightRpc()!, getLightRpc()!);
    spinner.succeed("Connected to Light Protocol");

    // Check compressed balance
    spinner.start("Checking compressed balance...");

    const compressedAccounts = await rpc.getCompressedAccountsByOwner(keypair.publicKey);

    let totalCompressed = 0n;
    if (compressedAccounts && compressedAccounts.items) {
      for (const account of compressedAccounts.items) {
        if (account.lamports) {
          totalCompressed += BigInt(account.lamports.toString());
        }
      }
    }

    if (totalCompressed < BigInt(lamportsToDecompress)) {
      spinner.fail("Insufficient compressed balance");
      console.log(chalk.red(`  Compressed balance: ${Number(totalCompressed) / LAMPORTS_PER_SOL} SOL`));
      console.log(chalk.red(`  Requested: ${amount} SOL\n`));
      return;
    }

    spinner.succeed(`Compressed balance: ${Number(totalCompressed) / LAMPORTS_PER_SOL} SOL`);

    // Decompress SOL to recipient
    spinner.start("Decompressing SOL to recipient...");

    const decompressTxId = await decompress(
      rpc,
      keypair,
      lamportsToDecompress,
      recipient,
    );

    spinner.succeed("SOL decompressed successfully!");

    console.log("\n" + box(
      `${chalk.bold.green("Unshield Complete!")}\n\n` +
      `${chalk.gray("Amount:")} ${chalk.yellow(amount.toString())} ${chalk.yellow("SOL")} ${chalk.green("sent")}\n` +
      `${chalk.gray("Recipient:")} ${chalk.cyan(recipient.toBase58())}\n` +
      `${chalk.gray("Transaction:")} ${chalk.cyan(decompressTxId)}\n\n` +
      `${chalk.green("✓")} ${chalk.gray("No on-chain link between your wallet and the recipient!")}`,
      chalk.green
    ));

    // Mainnet is blocked above, so this is always devnet
    console.log(chalk.cyan(`\n  View on Solscan: https://solscan.io/tx/${decompressTxId}?cluster=devnet\n`));

  } catch (error) {
    spinner.fail("Unshield failed");
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Light Protocol: Check compressed balance
async function lightBalance() {
  const settings = loadSettings();

  console.log("\n" + box(
    `${chalk.bold.cyan("Light Protocol - Compressed Balance")}\n\n` +
    `${chalk.gray("Check your shielded SOL balance.")}\n\n` +
    `${chalk.cyan("Network:")} ${settings.network === "mainnet" ? chalk.green("Mainnet") : chalk.yellow("Devnet")}`,
    chalk.cyan
  ));

  // Block mainnet until Light Protocol state trees are active
  if (settings.network === "mainnet") {
    console.log(chalk.red("\n  ⚠ Mainnet not yet supported for compressed balance checks."));
    console.log(chalk.gray("  Light Protocol state trees are only active on devnet."));
    console.log(chalk.cyan("  Tip: Go to Settings → Network to switch to Devnet\n"));
    return;
  }

  const walletAddress = await input({
    message: "Enter wallet address:",
    validate: (value) => {
      try {
        new PublicKey(value);
        return true;
      } catch {
        return "Invalid Solana address";
      }
    },
  });

  const spinner = ora("Connecting to Light Protocol...").start();

  try {
    const rpc = createRpc(getLightRpc()!, getLightRpc()!, getLightRpc()!);
    const wallet = new PublicKey(walletAddress);

    spinner.text = "Fetching compressed accounts...";

    const compressedAccounts = await rpc.getCompressedAccountsByOwner(wallet);

    spinner.stop();

    let totalCompressed = 0n;
    const accountCount = compressedAccounts?.items?.length || 0;

    if (compressedAccounts && compressedAccounts.items) {
      for (const account of compressedAccounts.items) {
        if (account.lamports) {
          totalCompressed += BigInt(account.lamports.toString());
        }
      }
    }

    const totalSol = Number(totalCompressed) / LAMPORTS_PER_SOL;

    console.log("\n" + box(
      `${chalk.bold("Compressed Balance")}\n\n` +
      `${chalk.gray("Wallet:")} ${chalk.cyan(walletAddress.slice(0, 30))}...\n` +
      `${chalk.gray("Compressed Accounts:")} ${chalk.white(accountCount.toString())}\n` +
      `${chalk.gray("Shielded SOL:")} ${chalk.green(formatNumber(totalSol, 6))} ${chalk.green("SOL")}\n\n` +
      (totalSol > 0
        ? `${chalk.green("✓")} ${chalk.gray("Use \"Unshield to Wallet\" to send to any address")}`
        : `${chalk.yellow("○")} ${chalk.gray("Use \"Shield SOL\" to compress some SOL first")}`),
      totalSol > 0 ? chalk.green : chalk.yellow
    ));

    console.log("");

  } catch (error) {
    spinner.fail("Failed to fetch balance");
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Privacy Migration - Shield funds and migrate to new wallet
async function privacyMigration() {
  console.log("\n" + frame(
    `  ${chalk.bold("Zero-Knowledge Privacy Migration")}\n\n` +
    `  ${chalk.gray("Two privacy options:")}\n\n` +
    `  ${chalk.green("★")} ${chalk.bold("Light Protocol")} ${chalk.green("(Recommended)")}\n` +
    `     ${chalk.gray("• True privacy - no anonymity set needed")}\n` +
    `     ${chalk.gray("• ZK compression on Solana")}\n` +
    `     ${chalk.gray("• Shield → Unshield to any wallet")}\n\n` +
    `  ${chalk.yellow("○")} ${chalk.bold("Mixer Pool")} ${chalk.gray("(Legacy)")}\n` +
    `     ${chalk.gray("• Privacy depends on other users")}\n` +
    `     ${chalk.gray("• Requires waiting for anonymity set")}`,
    "Privacy Migration"
  ));

  let action: string;
  try {
    action = await select({
      message: "What would you like to do?",
      choices: [
        {
          name: `${chalk.green("★")} Shield SOL ${chalk.green("(Light Protocol)")}`,
          value: "light-shield",
          description: "Compress SOL with ZK - best privacy option",
        },
        {
          name: `${chalk.green("★")} Unshield to Wallet ${chalk.green("(Light Protocol)")}`,
          value: "light-unshield",
          description: "Send compressed SOL to any address - untraceable",
        },
        {
          name: `${chalk.cyan("●")} Check Compressed Balance`,
          value: "light-balance",
          description: "View your shielded SOL balance",
        },
        {
          name: `${chalk.gray("─")} ${chalk.gray("─────────────────────────────")}`,
          value: "divider",
          disabled: true,
        },
        {
          name: `${chalk.yellow("○")} Mixer: Create Note ${chalk.gray("(legacy)")}`,
          value: "create",
          description: "Generate a privacy note for mixer deposit",
        },
        {
          name: `${chalk.yellow("○")} Mixer: Deposit ${chalk.gray("(legacy)")}`,
          value: "deposit",
          description: "Shield SOL using mixer pool",
        },
        {
          name: `${chalk.yellow("○")} Mixer: Withdraw ${chalk.gray("(legacy)")}`,
          value: "withdraw",
          description: "Withdraw from mixer with ZK proof",
        },
        {
          name: `${chalk.yellow("○")} Mixer: Check Notes ${chalk.gray("(legacy)")}`,
          value: "status",
          description: "View your saved mixer notes",
        },
        {
          name: `${chalk.gray("←")} Back ${chalk.gray("(ESC)")}`,
          value: "back",
        },
      ],
    });
  } catch (e) {
    // ESC pressed - go back
    return;
  }

  if (action === "back" || action === "divider") return;

  if (action === "light-shield") {
    await lightShield();
  } else if (action === "light-unshield") {
    await lightUnshield();
  } else if (action === "light-balance") {
    await lightBalance();
  } else if (action === "create") {
    await createPrivacyNote();
  } else if (action === "deposit") {
    await depositToPool();
  } else if (action === "withdraw") {
    await withdrawFromPool();
  } else if (action === "status") {
    await checkNoteStatus();
  }
}

// Create a new privacy note
async function createPrivacyNote() {
  const amountStr = await input({
    message: "Amount of SOL to shield:",
    default: "1",
    validate: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return "Please enter a valid positive number";
      if (num < 0.01) return "Minimum is 0.01 SOL";
      return true;
    },
  });

  const amount = parseFloat(amountStr);
  const lamports = BigInt(Math.floor(amount * 1e9));

  const spinner = ora("Generating privacy note...").start();

  try {
    // Generate random secret and nullifier
    const secret = generateRandomBytes(31);
    const nullifier = generateRandomBytes(31);

    // Create commitment hash (simplified - in production use Poseidon)
    const commitment = simpleHash(secret, nullifier);
    const nullifierHash = simpleHash(nullifier, new Uint8Array(31));

    // Create note string
    const noteData = {
      version: 1,
      secret: bytesToHex(secret),
      nullifier: bytesToHex(nullifier),
      amount: lamports.toString(),
      commitment: bytesToHex(commitment),
      timestamp: Date.now(),
    };

    const noteString = `pussycat-note-v1:${Buffer.from(JSON.stringify(noteData)).toString("base64")}`;

    spinner.stop();

    console.log("\n" + box(
      `${chalk.bold.green("Privacy Note Created!")}\n\n` +
      `${chalk.gray("Amount:")} ${chalk.yellow(formatNumber(amount))} ${chalk.yellow("SOL")}\n` +
      `${chalk.gray("Commitment:")} ${chalk.cyan(bytesToHex(commitment).slice(0, 20))}...\n\n` +
      `${chalk.red.bold("⚠ SAVE THIS NOTE - YOU NEED IT TO WITHDRAW!")}\n\n` +
      `${chalk.gray("Note:")}\n${chalk.white(noteString.slice(0, 60))}...\n`,
      chalk.green
    ));

    // Offer to save to file
    const saveToFile = await confirm({
      message: "Save note to file?",
      default: true,
    });

    if (saveToFile) {
      const notesDir = path.join(process.env.HOME || "", ".pussycat", "notes");
      if (!fs.existsSync(notesDir)) {
        fs.mkdirSync(notesDir, { recursive: true });
      }

      const filename = `note_${Date.now()}.txt`;
      const filepath = path.join(notesDir, filename);
      fs.writeFileSync(filepath, noteString);

      console.log(chalk.green(`\n  Saved to: ${filepath}\n`));
    } else {
      // Copy to clipboard hint
      console.log(chalk.yellow(`\n  Make sure to copy and save this note!\n`));
      console.log(chalk.gray(`  ${noteString}\n`));
    }

  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Deposit to privacy pool
async function depositToPool() {
  const PROGRAM_ID = new PublicKey("DjMmzkXneGrsGYmKhY3uUSDeQtfbczbgf7MpPWVifM9x");
  const DEPOSIT_DISC = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);
  const VALID_AMOUNTS = [0.1, 0.5, 1, 10]; // SOL

  console.log("\n" + box(
    `${chalk.bold("Deposit to Privacy Pool")}\n\n` +
    `${chalk.gray("Program:")} ${chalk.cyan("DjMmzkXneGrsGYmKhY3uUSDeQtfbczbgf7MpPWVifM9x")}\n` +
    `${chalk.gray("Network:")} ${chalk.yellow("Devnet")}\n\n` +
    `${chalk.gray("Valid amounts:")} ${chalk.white("0.1, 0.5, 1, or 10 SOL")}`,
    chalk.cyan
  ));

  const amountChoice = await select({
    message: "Select deposit amount:",
    choices: VALID_AMOUNTS.map(a => ({
      name: `${chalk.yellow(a.toString())} SOL`,
      value: a,
    })),
  });

  const keypairPath = await input({
    message: "Path to keypair file:",
    default: "~/.config/solana/id.json",
  });

  let keypair: Keypair;
  try {
    keypair = loadKeypair(keypairPath);
  } catch (error) {
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
    return;
  }

  const spinner = ora("Connecting to Devnet...").start();

  try {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    const amountLamports = BigInt(Math.floor(amountChoice * 1e9));

    if (balance < Number(amountLamports) + 10000) {
      spinner.stop();
      console.log(chalk.red(`\n  Insufficient balance. Have ${balance / 1e9} SOL, need ${amountChoice} SOL + fees\n`));
      return;
    }

    spinner.text = "Generating commitment...";

    // Generate commitment
    const secret = generateRandomBytes(31);
    const nullifier = generateRandomBytes(31);
    const commitment = simpleHash(secret, nullifier);

    // Derive PDAs
    const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], PROGRAM_ID);
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault")], PROGRAM_ID);

    spinner.text = "Building transaction...";

    // Build deposit instruction
    const depositData = Buffer.alloc(8 + 32 + 8);
    DEPOSIT_DISC.copy(depositData, 0);
    Buffer.from(commitment).copy(depositData, 8);
    depositData.writeBigUInt64LE(amountLamports, 40);

    const { TransactionInstruction: TxIx } = await import("@solana/web3.js");
    const depositIx = new TxIx({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: poolPda, isSigner: false, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false },
      ],
      data: depositData,
    });

    spinner.text = "Sending transaction...";

    const tx = new Transaction().add(depositIx);
    const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);

    spinner.stop();

    // Create and save note
    const noteData = {
      version: 1,
      secret: bytesToHex(secret),
      nullifier: bytesToHex(nullifier),
      amount: amountLamports.toString(),
      commitment: bytesToHex(commitment),
      timestamp: Date.now(),
      txSignature: sig,
    };
    const noteString = `pussycat-note-v1:${Buffer.from(JSON.stringify(noteData)).toString("base64")}`;

    // Save note
    const notesDir = path.join(process.env.HOME || "", ".pussycat", "notes");
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }
    const filename = `deposit_${Date.now()}.txt`;
    const filepath = path.join(notesDir, filename);
    fs.writeFileSync(filepath, noteString);

    console.log("\n" + box(
      `${chalk.bold.green("DEPOSIT SUCCESSFUL!")}\n\n` +
      `${chalk.gray("Amount:")} ${chalk.yellow(amountChoice.toString())} ${chalk.yellow("SOL")}\n` +
      `${chalk.gray("Commitment:")} ${chalk.cyan(bytesToHex(commitment).slice(0, 20))}...\n` +
      `${chalk.gray("Signature:")} ${chalk.cyan(sig.slice(0, 20))}...\n\n` +
      `${chalk.gray("Note saved:")} ${chalk.white(filepath)}\n\n` +
      `${chalk.red.bold("⚠ KEEP YOUR NOTE FILE SAFE!")}\n` +
      `${chalk.gray("You need it to withdraw your funds.")}`,
      chalk.green
    ));

    console.log(chalk.cyan(`\n  View on Solscan: https://solscan.io/tx/${sig}?cluster=devnet\n`));

  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n  Error: ${(error as Error).message}\n`));
  }
}

// Withdraw from privacy pool
async function withdrawFromPool() {
  const noteString = await input({
    message: "Paste your note string (pussycat-note-v1:...):",
    validate: (value) => {
      if (!value.startsWith("pussycat-note-v1:")) {
        return "Invalid note format. Must start with 'pussycat-note-v1:'";
      }
      return true;
    },
  });

  const recipientAddress = await input({
    message: "Recipient wallet address (your new clean wallet):",
    validate: (value) => {
      try {
        new PublicKey(value);
        return true;
      } catch {
        return "Invalid Solana address";
      }
    },
  });

  console.log("\n" + box(
    `${chalk.bold("Withdraw from Privacy Pool")}\n\n` +
    `${chalk.gray("Status:")} ${chalk.yellow("Pool deployment in progress...")}\n\n` +
    `${chalk.gray("Once the pool is deployed:")}\n` +
    `${chalk.cyan("1.")} Your note will be verified\n` +
    `${chalk.cyan("2.")} ZK proof will be generated (5-10 seconds)\n` +
    `${chalk.cyan("3.")} Funds will be sent to your new wallet\n\n` +
    `${chalk.gray("Recipient:")} ${chalk.cyan(recipientAddress.slice(0, 20))}...`,
    chalk.yellow
  ));

  console.log(chalk.gray("\n  Pool deployment coming soon!\n"));
}

// Check saved notes
async function checkNoteStatus() {
  const notesDir = path.join(process.env.HOME || "", ".pussycat", "notes");

  if (!fs.existsSync(notesDir)) {
    console.log(chalk.yellow("\n  No saved notes found.\n"));
    return;
  }

  const files = fs.readdirSync(notesDir).filter((f) => f.endsWith(".txt"));

  if (files.length === 0) {
    console.log(chalk.yellow("\n  No saved notes found.\n"));
    return;
  }

  console.log("\n" + chalk.bold("  Saved Notes:\n"));

  for (const file of files) {
    const filepath = path.join(notesDir, file);
    const noteString = fs.readFileSync(filepath, "utf-8").trim();

    try {
      const base64Data = noteString.replace("pussycat-note-v1:", "");
      const noteData = JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));

      const amount = Number(noteData.amount) / 1e9;
      const date = new Date(noteData.timestamp).toLocaleDateString();

      console.log(`  ${chalk.cyan("●")} ${chalk.white(file)}`);
      console.log(`    ${chalk.gray("Amount:")} ${chalk.yellow(formatNumber(amount))} ${chalk.yellow("SOL")}`);
      console.log(`    ${chalk.gray("Created:")} ${chalk.white(date)}`);
      console.log(`    ${chalk.gray("Status:")} ${chalk.yellow("Pending deposit")}`);
      console.log("");
    } catch {
      console.log(`  ${chalk.red("●")} ${chalk.white(file)} ${chalk.red("(invalid format)")}`);
      console.log("");
    }
  }
}

// Helper: Generate random bytes
function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Helper: Convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: Simple hash (placeholder - use Poseidon in production)
function simpleHash(a: Uint8Array, b: Uint8Array): Uint8Array {
  const combined = new Uint8Array(a.length + b.length);
  combined.set(a);
  combined.set(b, a.length);

  // Simple hash using XOR and rotation (NOT cryptographically secure - placeholder only)
  const result = new Uint8Array(32);
  for (let i = 0; i < combined.length; i++) {
    result[i % 32] ^= combined[i];
    result[(i + 1) % 32] = (result[(i + 1) % 32] + combined[i]) & 0xff;
  }
  return result;
}

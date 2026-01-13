import { Command } from "commander";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import bs58 from "bs58";

const HELIUS_RPC = "https://mainnet.helius-rpc.com/?api-key=40067999-16c1-4b5a-95a3-fa46f6dcdc21";
const RENT_EXEMPT_LAMPORTS = 2039280; // ~0.00203928 SOL per account

interface TokenAccount {
  pubkey: PublicKey;
  mint: string;
  balance: bigint;
  isCloseable: boolean;
}

export const dustCommand = new Command("dust")
  .description("Dust token management commands")
  .addCommand(
    new Command("scan")
      .description("Scan wallet for dust tokens")
      .argument("<wallet>", "Wallet address to scan")
      .action(scanDust)
  )
  .addCommand(
    new Command("clean")
      .description("Close empty token accounts and recover SOL")
      .argument("<wallet>", "Wallet address to clean")
      .option("-k, --keypair <path>", "Path to keypair file (JSON or base58)")
      .option("-y, --yes", "Skip confirmation prompt")
      .option("--dry-run", "Show what would be done without executing")
      .action(cleanDust)
  );

async function scanDust(walletAddress: string) {
  const spinner = ora("Scanning wallet for dust tokens...").start();

  try {
    const connection = new Connection(HELIUS_RPC, "confirmed");
    const pubkey = new PublicKey(walletAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    });

    spinner.stop();

    const accounts: TokenAccount[] = tokenAccounts.value.map((account) => {
      const info = account.account.data.parsed.info;
      const balance = BigInt(info.tokenAmount.amount);
      return {
        pubkey: account.pubkey,
        mint: info.mint,
        balance,
        isCloseable: balance === 0n,
      };
    });

    const closeable = accounts.filter((a) => a.isCloseable);
    const withBalance = accounts.filter((a) => !a.isCloseable);

    console.log(chalk.bold("\n  Dust Scan Results\n"));
    console.log(chalk.gray("  Wallet: ") + chalk.cyan(walletAddress));
    console.log(chalk.gray("  Total token accounts: ") + chalk.white(accounts.length));
    console.log(chalk.gray("  Closeable (empty): ") + chalk.green(closeable.length));
    console.log(chalk.gray("  With balance: ") + chalk.yellow(withBalance.length));

    if (closeable.length > 0) {
      const recoverable = (closeable.length * RENT_EXEMPT_LAMPORTS) / 1e9;
      console.log(
        chalk.gray("  Recoverable SOL: ") +
          chalk.green(`~${recoverable.toFixed(6)} SOL`)
      );

      console.log(chalk.bold("\n  Empty Token Accounts:\n"));
      closeable.forEach((account, i) => {
        console.log(
          chalk.gray(`  ${i + 1}. `) +
            chalk.white(account.pubkey.toString().slice(0, 20) + "...")
        );
        console.log(chalk.gray(`     Mint: `) + chalk.cyan(account.mint.slice(0, 20) + "..."));
      });

      console.log(chalk.yellow("\n  Run 'solprivacy dust clean " + walletAddress + "' to recover SOL\n"));
    } else {
      console.log(chalk.green("\n  No empty token accounts found.\n"));
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red("\n  Error: ") + (error as Error).message);
    process.exit(1);
  }
}

async function cleanDust(
  walletAddress: string,
  options: { keypair?: string; yes?: boolean; dryRun?: boolean }
) {
  const spinner = ora("Scanning wallet...").start();

  try {
    const connection = new Connection(HELIUS_RPC, "confirmed");
    const walletPubkey = new PublicKey(walletAddress);

    // Get closeable accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const closeable = tokenAccounts.value.filter((account) => {
      const balance = BigInt(account.account.data.parsed.info.tokenAmount.amount);
      return balance === 0n;
    });

    spinner.stop();

    if (closeable.length === 0) {
      console.log(chalk.green("\n  No empty token accounts to close.\n"));
      return;
    }

    const recoverable = (closeable.length * RENT_EXEMPT_LAMPORTS) / 1e9;

    console.log(chalk.bold("\n  Dust Clean Summary\n"));
    console.log(chalk.gray("  Accounts to close: ") + chalk.white(closeable.length));
    console.log(chalk.gray("  SOL to recover: ") + chalk.green(`~${recoverable.toFixed(6)} SOL`));

    if (options.dryRun) {
      console.log(chalk.yellow("\n  [DRY RUN] No transactions will be sent.\n"));
      console.log(chalk.bold("  Accounts that would be closed:\n"));
      closeable.forEach((account, i) => {
        console.log(
          chalk.gray(`  ${i + 1}. `) + chalk.white(account.pubkey.toString())
        );
      });
      return;
    }

    // Load keypair
    if (!options.keypair) {
      console.log(chalk.red("\n  Error: ") + "Keypair required. Use --keypair <path>\n");
      console.log(chalk.gray("  Example: solprivacy dust clean " + walletAddress + " --keypair ~/.config/solana/id.json\n"));
      process.exit(1);
    }

    const keypair = loadKeypair(options.keypair);

    // Verify keypair matches wallet
    if (keypair.publicKey.toString() !== walletAddress) {
      console.log(
        chalk.red("\n  Error: ") +
          "Keypair public key does not match wallet address\n"
      );
      console.log(chalk.gray("  Keypair: ") + chalk.white(keypair.publicKey.toString()));
      console.log(chalk.gray("  Wallet:  ") + chalk.white(walletAddress));
      process.exit(1);
    }

    // Confirm
    if (!options.yes) {
      console.log(chalk.yellow("\n  This will close " + closeable.length + " token accounts."));
      console.log(chalk.yellow("  Make sure you have backed up your wallet.\n"));
      console.log(chalk.gray("  Use --yes to skip this prompt.\n"));

      const readline = await import("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question(chalk.white("  Proceed? (y/N): "), resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== "y") {
        console.log(chalk.yellow("\n  Aborted.\n"));
        return;
      }
    }

    // Process in batches of 10 to avoid transaction size limits
    const batchSize = 10;
    let totalClosed = 0;
    let totalRecovered = 0;

    for (let i = 0; i < closeable.length; i += batchSize) {
      const batch = closeable.slice(i, i + batchSize);
      const batchSpinner = ora(
        `Closing accounts ${i + 1}-${Math.min(i + batchSize, closeable.length)}...`
      ).start();

      try {
        const transaction = new Transaction();

        for (const account of batch) {
          transaction.add(
            createCloseAccountInstruction(
              account.pubkey,
              keypair.publicKey,
              keypair.publicKey
            )
          );
        }

        const signature = await sendAndConfirmTransaction(connection, transaction, [
          keypair,
        ]);

        totalClosed += batch.length;
        totalRecovered += (batch.length * RENT_EXEMPT_LAMPORTS) / 1e9;

        batchSpinner.succeed(
          chalk.green(`Closed ${batch.length} accounts. `) +
            chalk.gray(`TX: ${signature.slice(0, 20)}...`)
        );
      } catch (err) {
        batchSpinner.fail(chalk.red(`Failed to close batch: ${(err as Error).message}`));
      }
    }

    console.log(chalk.bold("\n  Summary\n"));
    console.log(chalk.gray("  Accounts closed: ") + chalk.green(totalClosed));
    console.log(chalk.gray("  SOL recovered: ") + chalk.green(`~${totalRecovered.toFixed(6)} SOL`));
    console.log("");
  } catch (error) {
    spinner.stop();
    console.error(chalk.red("\n  Error: ") + (error as Error).message);
    process.exit(1);
  }
}

function loadKeypair(keypairPath: string): Keypair {
  const resolvedPath = keypairPath.startsWith("~")
    ? path.join(process.env.HOME || "", keypairPath.slice(1))
    : path.resolve(keypairPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Keypair file not found: ${resolvedPath}`);
  }

  const content = fs.readFileSync(resolvedPath, "utf-8").trim();

  // Try JSON array format (Solana CLI default)
  try {
    const secretKey = new Uint8Array(JSON.parse(content));
    return Keypair.fromSecretKey(secretKey);
  } catch {
    // Try base58 format
    try {
      const secretKey = bs58.decode(content);
      return Keypair.fromSecretKey(secretKey);
    } catch {
      throw new Error(
        "Invalid keypair format. Expected JSON array or base58 string."
      );
    }
  }
}

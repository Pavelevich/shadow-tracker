/**
 * Test Privacy Pool Deposit via CLI logic
 * Simulates what the "Privacy Migration > Deposit" menu does
 */

import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { homedir } from 'os';

const PROGRAM_ID = new PublicKey('DjMmzkXneGrsGYmKhY3uUSDeQtfbczbgf7MpPWVifM9x');
const DEPOSIT_DISC = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);

function simpleHash(a, b) {
    const combined = Buffer.concat([a, b]);
    const result = Buffer.alloc(32);
    for (let i = 0; i < combined.length; i++) {
        result[i % 32] ^= combined[i];
        result[(i + 1) % 32] = (result[(i + 1) % 32] + combined[i]) & 0xff;
    }
    return result;
}

async function main() {
    console.log('\n╭──────────────────────────────────────────────────╮');
    console.log('│       PUSSY-DUST Privacy Pool Test               │');
    console.log('╰──────────────────────────────────────────────────╯\n');

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('✓ Connected to Devnet');

    // Load wallet
    const walletPath = '/Users/pchmirenko/AgenC-audit/test-wallet.json';
    const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(walletPath, 'utf-8'))));
    console.log('✓ Wallet:', wallet.publicKey.toBase58());

    const balance = await connection.getBalance(wallet.publicKey);
    console.log('✓ Balance:', balance / 1e9, 'SOL\n');

    // Deposit amount: 0.1 SOL
    const amount = 0.1;
    const amountLamports = BigInt(Math.floor(amount * 1e9));
    console.log('─── Privacy Migration: Deposit ───\n');
    console.log('Amount:', amount, 'SOL');

    // Generate commitment (same as CLI does)
    const secret = randomBytes(31);
    const nullifier = randomBytes(31);
    const commitment = simpleHash(secret, nullifier);
    console.log('Commitment:', commitment.toString('hex').slice(0, 20) + '...');

    // Derive PDAs
    const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from('pool')], PROGRAM_ID);
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from('vault')], PROGRAM_ID);
    console.log('Pool PDA:', poolPda.toBase58());
    console.log('Vault PDA:', vaultPda.toBase58());

    // Build deposit instruction
    const depositData = Buffer.alloc(8 + 32 + 8);
    DEPOSIT_DISC.copy(depositData, 0);
    commitment.copy(depositData, 8);
    depositData.writeBigUInt64LE(amountLamports, 40);

    const depositIx = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: poolPda, isSigner: false, isWritable: true },
            { pubkey: vaultPda, isSigner: false, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
        ],
        data: depositData,
    });

    console.log('\n⏳ Sending transaction...');

    try {
        const tx = new Transaction().add(depositIx);
        const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);

        // Create note (same format as CLI)
        const noteData = {
            version: 1,
            secret: secret.toString('hex'),
            nullifier: nullifier.toString('hex'),
            amount: amountLamports.toString(),
            commitment: commitment.toString('hex'),
            timestamp: Date.now(),
            txSignature: sig,
        };
        const noteString = `pussycat-note-v1:${Buffer.from(JSON.stringify(noteData)).toString('base64')}`;

        // Save note
        const notesDir = join(homedir(), '.pussycat', 'notes');
        if (!existsSync(notesDir)) {
            mkdirSync(notesDir, { recursive: true });
        }
        const filename = `deposit_${Date.now()}.txt`;
        const filepath = join(notesDir, filename);
        writeFileSync(filepath, noteString);

        console.log('\n╭──────────────────────────────────────────────────╮');
        console.log('│            ✓ DEPOSIT SUCCESSFUL!                 │');
        console.log('╰──────────────────────────────────────────────────╯');
        console.log('\nAmount:     ', amount, 'SOL');
        console.log('Signature:  ', sig);
        console.log('Note saved: ', filepath);
        console.log('\n🔗 View on Solscan:');
        console.log(`   https://solscan.io/tx/${sig}?cluster=devnet`);

        // Check vault balance
        const vaultBalance = await connection.getBalance(vaultPda);
        console.log('\n📊 Vault Balance:', vaultBalance / 1e9, 'SOL');

    } catch (e) {
        console.error('\n❌ Deposit failed:', e.message);
        if (e.logs) console.error('Logs:', e.logs.slice(-5));
    }

    console.log('\n');
}

main().catch(console.error);

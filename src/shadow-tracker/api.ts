/**
 * SHADOW TRACKER API SERVER
 *
 * REST API for the Shadow Tracker wallet privacy analyzer.
 * Serves the web interface and provides wallet analysis endpoints.
 *
 * Helius Bounty Submission ($5,000)
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import ShadowTracker, { PrivacyReport } from './index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from web directory
app.use(express.static(path.join(__dirname, '../../web')));

// Initialize Shadow Tracker
const apiKey = process.env.HELIUS_API_KEY;
if (!apiKey) {
  console.error('❌ HELIUS_API_KEY not found in .env');
  process.exit(1);
}

const tracker = new ShadowTracker(apiKey);

// ===========================================
// API ROUTES
// ===========================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Shadow Tracker API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Analyze a wallet's privacy
 * POST /api/analyze
 * Body: { address: string, maxTransactions?: number }
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  const { address, maxTransactions = 100 } = req.body;

  if (!address) {
    return res.status(400).json({
      error: 'Missing required parameter: address'
    });
  }

  // Validate Solana address format (base58, 32-44 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({
      error: 'Invalid Solana address format'
    });
  }

  try {
    console.log(`\n📡 API Request: Analyze ${address.slice(0, 8)}...`);

    const report = await tracker.analyzeWallet(address, {
      maxTransactions: Math.min(maxTransactions, 500), // Cap at 500
      includeNFTs: true
    });

    console.log(`✅ Analysis complete: Score ${report.privacyScore}/100`);

    res.json({
      success: true,
      data: report
    });

  } catch (error: any) {
    console.error('❌ Analysis error:', error.message);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * Get analysis for a wallet (GET version)
 * GET /api/analyze/:address
 */
app.get('/api/analyze/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  const maxTransactions = parseInt(req.query.limit as string) || 100;

  // Validate Solana address format
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({
      error: 'Invalid Solana address format'
    });
  }

  try {
    console.log(`\n📡 API Request: Analyze ${address.slice(0, 8)}...`);

    const report = await tracker.analyzeWallet(address, {
      maxTransactions: Math.min(maxTransactions, 500),
      includeNFTs: true
    });

    console.log(`✅ Analysis complete: Score ${report.privacyScore}/100`);

    res.json({
      success: true,
      data: report
    });

  } catch (error: any) {
    console.error('❌ Analysis error:', error.message);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * Example wallets for testing
 * GET /api/examples
 */
app.get('/api/examples', (req: Request, res: Response) => {
  res.json({
    examples: [
      {
        name: 'Solana Foundation',
        address: 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg',
        description: 'High-activity foundation wallet'
      },
      {
        name: 'Active Trader',
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        description: 'Active DeFi wallet'
      },
      {
        name: 'NFT Collector',
        address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        description: 'Heavy NFT holder'
      }
    ]
  });
});

/**
 * Serve the main web interface
 */
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../web/index.html'));
});

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              SHADOW TRACKER API SERVER                    ║');
  console.log('║           Wallet Privacy Analyzer v1.0                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📡 API Endpoints:');
  console.log(`   GET  /api/health              - Health check`);
  console.log(`   GET  /api/examples            - Example wallets`);
  console.log(`   GET  /api/analyze/:address    - Analyze wallet`);
  console.log(`   POST /api/analyze             - Analyze wallet (with options)`);
  console.log('');
  console.log('🌐 Web Interface:');
  console.log(`   http://localhost:${PORT}/`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

export default app;

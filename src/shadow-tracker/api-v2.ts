/**
 * SHADOW TRACKER v2.0 - Advanced Privacy API
 *
 * REST API with information-theoretic privacy analysis.
 * Serves the advanced web dashboard.
 *
 * Helius Bounty ($5,000) + Encrypt.trade Bounty ($1,000)
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import AdvancedPrivacyAnalyzer from './advanced-analyzer';
import { AdvancedPrivacyReport } from './privacy-math';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Advanced Analyzer
const apiKey = process.env.HELIUS_API_KEY;
if (!apiKey) {
  console.error('❌ HELIUS_API_KEY not found in .env');
  process.exit(1);
}

const analyzer = new AdvancedPrivacyAnalyzer(apiKey);

// Cache for recent analyses
const analysisCache = new Map<string, { report: AdvancedPrivacyReport; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ===========================================
// API ROUTES
// ===========================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Shadow Tracker v2.0 API',
    version: '2.0.0',
    features: [
      'Shannon Entropy Analysis',
      'k-Anonymity Calculation',
      'Transaction Graph Analysis',
      'Attack Probability Simulation'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * Advanced wallet analysis
 * GET /api/v2/analyze/:address
 */
app.get('/api/v2/analyze/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  const maxTransactions = parseInt(req.query.limit as string) || 100;

  // Validate Solana address format
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({
      error: 'Invalid Solana address format'
    });
  }

  try {
    // Check cache
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Cache hit for ${address.slice(0, 8)}...`);
      return res.json({
        success: true,
        cached: true,
        data: cached.report
      });
    }

    console.log(`\n📡 API Request: Advanced analysis for ${address.slice(0, 8)}...`);

    const report = await analyzer.analyzeWallet(address, {
      maxTransactions: Math.min(maxTransactions, 500),
      includeAssets: true
    });

    // Cache result
    analysisCache.set(address, { report, timestamp: Date.now() });

    console.log(`✅ Analysis complete: Score ${report.advancedPrivacyScore}/100`);

    res.json({
      success: true,
      cached: false,
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
 * Legacy v1 endpoint (for backwards compatibility)
 * GET /api/analyze/:address
 */
app.get('/api/analyze/:address', async (req: Request, res: Response) => {
  // Redirect to v2
  const { address } = req.params;
  res.redirect(`/api/v2/analyze/${address}`);
});

/**
 * POST endpoint for analysis with options
 * POST /api/v2/analyze
 */
app.post('/api/v2/analyze', async (req: Request, res: Response) => {
  const { address, maxTransactions = 100 } = req.body;

  if (!address) {
    return res.status(400).json({
      error: 'Missing required parameter: address'
    });
  }

  // Validate Solana address format
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({
      error: 'Invalid Solana address format'
    });
  }

  try {
    const report = await analyzer.analyzeWallet(address, {
      maxTransactions: Math.min(maxTransactions, 500),
      includeAssets: true
    });

    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * Get entropy details only
 * GET /api/v2/entropy/:address
 */
app.get('/api/v2/entropy/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.entropy
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.entropy
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get k-anonymity details only
 * GET /api/v2/k-anonymity/:address
 */
app.get('/api/v2/k-anonymity/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.kAnonymity
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.kAnonymity
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get attack simulation only
 * GET /api/v2/attacks/:address
 */
app.get('/api/v2/attacks/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.attackSimulation
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.attackSimulation
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compare two wallets
 * GET /api/v2/compare?wallet1=...&wallet2=...
 */
app.get('/api/v2/compare', async (req: Request, res: Response) => {
  const wallet1 = req.query.wallet1 as string;
  const wallet2 = req.query.wallet2 as string;

  if (!wallet1 || !wallet2) {
    return res.status(400).json({
      error: 'Missing required parameters: wallet1 and wallet2'
    });
  }

  try {
    const [report1, report2] = await Promise.all([
      analyzer.analyzeWallet(wallet1, { maxTransactions: 50 }),
      analyzer.analyzeWallet(wallet2, { maxTransactions: 50 })
    ]);

    res.json({
      success: true,
      data: {
        wallet1: {
          address: wallet1,
          score: report1.advancedPrivacyScore,
          grade: report1.grade,
          entropy: report1.entropy.totalEntropy,
          kAnonymity: report1.kAnonymity.kValue
        },
        wallet2: {
          address: wallet2,
          score: report2.advancedPrivacyScore,
          grade: report2.grade,
          entropy: report2.entropy.totalEntropy,
          kAnonymity: report2.kAnonymity.kValue
        },
        comparison: {
          scoreDifference: report1.advancedPrivacyScore - report2.advancedPrivacyScore,
          morePrivate: report1.advancedPrivacyScore > report2.advancedPrivacyScore ? 'wallet1' : 'wallet2'
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Example wallets for testing
 * GET /api/v2/examples
 */
app.get('/api/v2/examples', (req: Request, res: Response) => {
  res.json({
    examples: [
      {
        name: 'Solana Foundation',
        address: 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg',
        description: 'High-activity foundation wallet - expect low privacy score',
        expectedScore: '40-60'
      },
      {
        name: 'Jupiter Aggregator',
        address: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        description: 'DeFi protocol - high volume',
        expectedScore: '30-50'
      },
      {
        name: 'Fresh Wallet',
        address: '5aud9zBwEikWkxj4CKoR5QqPuzhqBg4ZRtGvWCxrQP7N',
        description: 'Low activity wallet - expect high privacy score',
        expectedScore: '70-90'
      }
    ],
    methodology: [
      'Shannon Entropy Analysis (1948)',
      'k-Anonymity Model (Sweeney, 2002)',
      'Graph-based De-anonymization (Narayanan, 2009)',
      'Monte Carlo Attack Simulation'
    ]
  });
});

/**
 * API documentation
 * GET /api/v2/docs
 */
app.get('/api/v2/docs', (req: Request, res: Response) => {
  res.json({
    name: 'Shadow Tracker v2.0 API',
    version: '2.0.0',
    description: 'Advanced information-theoretic privacy analysis for Solana wallets',
    endpoints: {
      'GET /api/v2/analyze/:address': 'Full privacy analysis',
      'GET /api/v2/entropy/:address': 'Entropy metrics only',
      'GET /api/v2/k-anonymity/:address': 'k-Anonymity analysis only',
      'GET /api/v2/attacks/:address': 'Attack simulation only',
      'GET /api/v2/compare?wallet1=...&wallet2=...': 'Compare two wallets',
      'GET /api/v2/examples': 'Example wallets for testing',
      'POST /api/v2/analyze': 'Analysis with custom options'
    },
    responseFormat: {
      success: 'boolean',
      cached: 'boolean (optional)',
      data: 'AdvancedPrivacyReport object'
    },
    academicBasis: [
      'Shannon, C. E. (1948). "A Mathematical Theory of Communication"',
      'Sweeney, L. (2002). "k-Anonymity: A Model for Protecting Privacy"',
      'Narayanan, A. & Shmatikov, V. (2009). "De-anonymizing Social Networks"'
    ]
  });
});

/**
 * Serve the main web interface (v2 dashboard)
 */
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../web/index-v2.html'));
});

// Fallback for v1 interface
app.get('/v1', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../web/index.html'));
});

// Serve static files from web directory (after explicit routes)
app.use(express.static(path.join(__dirname, '../../web')));

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SHADOW TRACKER v2.0 API SERVER                         ║');
  console.log('║            Advanced Information-Theoretic Privacy Analyzer                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📡 API Endpoints (v2):');
  console.log(`   GET  /api/v2/analyze/:address    - Full privacy analysis`);
  console.log(`   GET  /api/v2/entropy/:address    - Entropy metrics`);
  console.log(`   GET  /api/v2/k-anonymity/:address - k-Anonymity analysis`);
  console.log(`   GET  /api/v2/attacks/:address    - Attack simulation`);
  console.log(`   GET  /api/v2/compare             - Compare two wallets`);
  console.log(`   GET  /api/v2/examples            - Example wallets`);
  console.log(`   GET  /api/v2/docs                - API documentation`);
  console.log('');
  console.log('🌐 Web Interface:');
  console.log(`   http://localhost:${PORT}/         - Advanced Dashboard (v2)`);
  console.log(`   http://localhost:${PORT}/v1       - Basic Dashboard (v1)`);
  console.log('');
  console.log('📚 Academic Methodology:');
  console.log('   • Shannon Entropy (1948)');
  console.log('   • k-Anonymity (Sweeney, 2002)');
  console.log('   • Graph De-anonymization (Narayanan, 2009)');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
});

export default app;

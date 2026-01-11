/**
 * SHADOW TRACKER v3.0 - State-of-the-Art Privacy API
 *
 * REST API with cutting-edge privacy analysis:
 * - Mutual Information
 * - Differential Privacy (ε-δ)
 * - Multi-Heuristic Clustering
 * - PageRank Network Centrality
 * - Temporal Autocorrelation
 * - Mixer Detection
 * - Cross-chain Linkability
 *
 * Based on 8 academic papers (1948-2013)
 *
 * Hackathon Bounties: Helius ($5,000) + Encrypt.trade ($1,000) + Privacy Track ($15,000)
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import AdvancedPrivacyAnalyzerV3 from './advanced-analyzer-v3';
import { AdvancedPrivacyReportV3 } from './privacy-math-v3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// ANTI-BOT & RATE LIMITING
// ===========================================

// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for analyze endpoint: 10 requests per 5 minutes per IP
const analyzeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    error: 'Too many analysis requests',
    message: 'You can only analyze 10 wallets per 5 minutes. Please wait.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bot detection middleware
const botDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousAgents = ['curl', 'wget', 'python-requests', 'scrapy', 'bot', 'spider', 'crawler'];

  // Check for missing or suspicious user agent
  if (!userAgent || suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    // Allow but flag - don't block legitimate tools completely
    (req as any).isSuspicious = true;
  }

  // Check for missing common headers (browsers always send these)
  const hasAcceptHeader = req.headers['accept'];
  const hasAcceptLanguage = req.headers['accept-language'];

  if (!hasAcceptHeader && !hasAcceptLanguage) {
    (req as any).isSuspicious = true;
  }

  next();
};

// Request logging for monitoring
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress;
  const suspicious = (req as any).isSuspicious ? ' [SUSPICIOUS]' : '';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${ip}${suspicious}`);
  next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(botDetection);
app.use(requestLogger);
app.use(generalLimiter);

// Initialize V3 Analyzer
const apiKey = process.env.HELIUS_API_KEY;
if (!apiKey) {
  console.error('❌ HELIUS_API_KEY not found in .env');
  process.exit(1);
}

const analyzer = new AdvancedPrivacyAnalyzerV3(apiKey);

// Cache for recent analyses
const analysisCache = new Map<string, { report: AdvancedPrivacyReportV3; timestamp: number }>();
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
    service: 'Shadow Tracker v3.0 API',
    version: '3.0.0',
    features: [
      'Shannon Entropy Analysis',
      'Mutual Information',
      'Differential Privacy (ε-δ)',
      'k-Anonymity Calculation',
      'Multi-Heuristic Clustering',
      'PageRank Network Centrality',
      'Temporal Autocorrelation',
      'Mixer/Tumbler Detection',
      'Cross-chain Linkability',
      'Attack Probability Simulation'
    ],
    academicBasis: [
      'Shannon (1948)',
      'Sweeney (2002)',
      'Dwork (2006)',
      'Narayanan (2009)',
      'Meiklejohn (2013)'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * Full v3 wallet analysis
 * GET /api/v3/analyze/:address
 */
app.get('/api/v3/analyze/:address', analyzeLimiter, async (req: Request, res: Response) => {
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

    console.log(`\n📡 API v3 Request: ${address.slice(0, 8)}...`);

    const report = await analyzer.analyzeWallet(address, {
      maxTransactions: Math.min(maxTransactions, 500)
    });

    // Cache result
    analysisCache.set(address, { report, timestamp: Date.now() });

    console.log(`✅ v3 Analysis complete: Score ${report.advancedPrivacyScore}/100`);

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
 * Mutual Information endpoint
 * GET /api/v3/mutual-info/:address
 */
app.get('/api/v3/mutual-info/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.mutualInformation
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.mutualInformation
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Differential Privacy endpoint
 * GET /api/v3/differential-privacy/:address
 */
app.get('/api/v3/differential-privacy/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.differentialPrivacy
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.differentialPrivacy
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clustering Analysis endpoint
 * GET /api/v3/clustering/:address
 */
app.get('/api/v3/clustering/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.advancedClustering
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.advancedClustering
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Temporal Analysis endpoint
 * GET /api/v3/temporal/:address
 */
app.get('/api/v3/temporal/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.temporalAnalysis
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.temporalAnalysis
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Network Centrality endpoint
 * GET /api/v3/centrality/:address
 */
app.get('/api/v3/centrality/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.networkCentrality
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.networkCentrality
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mixer Detection endpoint
 * GET /api/v3/mixer/:address
 */
app.get('/api/v3/mixer/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.mixerDetection
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.mixerDetection
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cross-chain Linkability endpoint
 * GET /api/v3/cross-chain/:address
 */
app.get('/api/v3/cross-chain/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.crossChain
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.crossChain
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dust Attack Detection (v3.1)
 * GET /api/v3/dust-attack/:address
 */
app.get('/api/v3/dust-attack/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.dustAttack
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.dustAttack
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Exchange Fingerprint / KYC Exposure Detection (v3.1)
 * GET /api/v3/exchange-fingerprint/:address
 */
app.get('/api/v3/exchange-fingerprint/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const cached = analysisCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.report.exchangeFingerprint
      });
    }

    const report = await analyzer.analyzeWallet(address, { maxTransactions: 100 });
    analysisCache.set(address, { report, timestamp: Date.now() });

    res.json({
      success: true,
      data: report.exchangeFingerprint
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compare two wallets (v3)
 * GET /api/v3/compare?wallet1=...&wallet2=...
 */
app.get('/api/v3/compare', async (req: Request, res: Response) => {
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
          epsilon: report1.differentialPrivacy.epsilon,
          mutualInfo: report1.mutualInformation.totalMutualInformation,
          networkVisibility: report1.networkCentrality.networkVisibility
        },
        wallet2: {
          address: wallet2,
          score: report2.advancedPrivacyScore,
          grade: report2.grade,
          epsilon: report2.differentialPrivacy.epsilon,
          mutualInfo: report2.mutualInformation.totalMutualInformation,
          networkVisibility: report2.networkCentrality.networkVisibility
        },
        comparison: {
          scoreDifference: report1.advancedPrivacyScore - report2.advancedPrivacyScore,
          morePrivate: report1.advancedPrivacyScore > report2.advancedPrivacyScore ? 'wallet1' : 'wallet2',
          epsilonDifference: report1.differentialPrivacy.epsilon - report2.differentialPrivacy.epsilon
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Example wallets for testing
 * GET /api/v3/examples
 */
app.get('/api/v3/examples', (req: Request, res: Response) => {
  res.json({
    examples: [
      {
        name: 'Solana Foundation',
        address: 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg',
        description: 'High-activity foundation wallet - expect low privacy score',
        expectedScore: '40-55'
      },
      {
        name: 'Jupiter Aggregator',
        address: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        description: 'DeFi protocol - high volume',
        expectedScore: '30-50'
      }
    ],
    methodology: [
      'Shannon Entropy Analysis (1948)',
      'Mutual Information Theory (Cover & Thomas, 2006)',
      'Differential Privacy (Dwork, 2006)',
      'k-Anonymity Model (Sweeney, 2002)',
      'Graph De-anonymization (Narayanan, 2009)',
      'Bitcoin Clustering Heuristics (Meiklejohn, 2013)',
      'Transaction Graph Analysis (Ron & Shamir, 2013)',
      'Monte Carlo Attack Simulation'
    ],
    newInV3: [
      'Mutual Information Analysis',
      'Differential Privacy ε-δ Metrics',
      'Multi-Heuristic Clustering',
      'Temporal Autocorrelation',
      'PageRank Network Centrality',
      'Mixer/Tumbler Detection',
      'Cross-chain Linkability',
      'Timezone Fingerprinting'
    ]
  });
});

/**
 * API Documentation
 * GET /api/v3/docs
 */
app.get('/api/v3/docs', (req: Request, res: Response) => {
  res.json({
    name: 'Shadow Tracker v3.0 API',
    version: '3.0.0',
    description: 'State-of-the-art information-theoretic privacy analysis for Solana wallets',
    endpoints: {
      'GET /api/v3/analyze/:address': 'Full v3 privacy analysis (all metrics)',
      'GET /api/v3/mutual-info/:address': 'Mutual Information analysis',
      'GET /api/v3/differential-privacy/:address': 'Differential Privacy (ε-δ) metrics',
      'GET /api/v3/clustering/:address': 'Multi-heuristic clustering analysis',
      'GET /api/v3/temporal/:address': 'Temporal pattern analysis',
      'GET /api/v3/centrality/:address': 'Network centrality (PageRank)',
      'GET /api/v3/mixer/:address': 'Mixer/tumbler detection',
      'GET /api/v3/cross-chain/:address': 'Cross-chain linkability',
      'GET /api/v3/compare?wallet1=&wallet2=': 'Compare two wallets',
      'GET /api/v3/examples': 'Example wallets for testing'
    },
    academicBasis: [
      'Shannon, C. E. (1948). "A Mathematical Theory of Communication"',
      'Cover, T. & Thomas, J. (2006). "Elements of Information Theory"',
      'Dwork, C. (2006). "Differential Privacy"',
      'Mir, D. (2013). "Information-Theoretic Foundations of Differential Privacy"',
      'Sweeney, L. (2002). "k-Anonymity: A Model for Protecting Privacy"',
      'Narayanan, A. & Shmatikov, V. (2009). "De-anonymizing Social Networks"',
      'Meiklejohn, S. et al. (2013). "A Fistful of Bitcoins"',
      'Ron, D. & Shamir, A. (2013). "Quantitative Analysis of Bitcoin Transaction Graph"'
    ]
  });
});

// Legacy v2 redirect
app.get('/api/v2/analyze/:address', (req: Request, res: Response) => {
  res.redirect(`/api/v3/analyze/${req.params.address}`);
});

/**
 * Serve the main web interface (v3 dashboard)
 */
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../web/index-v3.html'));
});

// Fallback for v2 interface
app.get('/v2', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../web/index-v2.html'));
});

// Serve static files from web directory
app.use(express.static(path.join(__dirname, '../../web')));

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SHADOW TRACKER v3.1 API SERVER                                     ║');
  console.log('║              State-of-the-Art Privacy Analysis + Attack Detection                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📡 API Endpoints (v3):');
  console.log(`   GET  /api/v3/analyze/:address        - Full v3 analysis`);
  console.log(`   GET  /api/v3/mutual-info/:address    - Mutual Information`);
  console.log(`   GET  /api/v3/differential-privacy/:address - ε-δ metrics`);
  console.log(`   GET  /api/v3/clustering/:address     - Clustering heuristics`);
  console.log(`   GET  /api/v3/temporal/:address       - Temporal patterns`);
  console.log(`   GET  /api/v3/centrality/:address     - PageRank centrality`);
  console.log(`   GET  /api/v3/mixer/:address          - Mixer detection`);
  console.log(`   GET  /api/v3/cross-chain/:address    - Cross-chain links`);
  console.log('');
  console.log('🛡️  NEW v3.1 Attack Detection:');
  console.log(`   GET  /api/v3/dust-attack/:address          - Dust attack detection`);
  console.log(`   GET  /api/v3/exchange-fingerprint/:address - Exchange/KYC exposure`);
  console.log('');
  console.log('📊 Utilities:');
  console.log(`   GET  /api/v3/compare                 - Compare wallets`);
  console.log(`   GET  /api/v3/docs                    - API documentation`);
  console.log('');
  console.log('🌐 Web Interface:');
  console.log(`   http://localhost:${PORT}/         - Advanced Dashboard (v3)`);
  console.log(`   http://localhost:${PORT}/v2       - Legacy Dashboard (v2)`);
  console.log('');
  console.log('📚 Academic Methodology (10 papers):');
  console.log('   • Shannon Entropy (1948)');
  console.log('   • Mutual Information (Cover & Thomas, 2006)');
  console.log('   • Differential Privacy (Dwork, 2006)');
  console.log('   • k-Anonymity (Sweeney, 2002)');
  console.log('   • Graph De-anonymization (Narayanan, 2009)');
  console.log('   • Bitcoin Clustering (Meiklejohn, 2013)');
  console.log('   • Chainalysis Dust Attack Reports (2019)');
  console.log('   • Elliptic Exchange Fingerprinting (2020)');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════');
  console.log('');
});

export default app;

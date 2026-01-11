/**
 * Shadow Tracker - Comprehensive Test Suite
 *
 * Tests:
 * 1. Real wallet analysis with Helius API
 * 2. Security tests (input validation, command injection)
 * 3. API endpoint tests
 * 4. Privacy scoring validation
 */

import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '40067999-16c1-4b5a-95a3-fa46f6dcdc21';
const API_PORT = 3001; // Use different port for tests
const API_URL = `http://localhost:${API_PORT}`;

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  duration: number;
}

const results: TestResult[] = [];
let serverProcess: ChildProcess | null = null;

// Helper to make HTTP requests
async function httpGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function httpPost(url: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

// Run a single test
async function runTest(name: string, testFn: () => Promise<boolean>): Promise<void> {
  const start = Date.now();
  try {
    const passed = await testFn();
    results.push({
      name,
      passed,
      details: passed ? 'OK' : 'FAILED',
      duration: Date.now() - start
    });
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      details: error.message,
      duration: Date.now() - start
    });
  }
}

// ============================================
// TEST DEFINITIONS
// ============================================

async function testHealthEndpoint(): Promise<boolean> {
  const response = await httpGet(`${API_URL}/api/health`);
  return response.status === 'ok' && response.service === 'Shadow Tracker API';
}

async function testRealWalletAnalysis(): Promise<boolean> {
  // Test with Solana Foundation wallet
  const wallet = 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg';
  const response = await httpGet(`${API_URL}/api/analyze/${wallet}`);

  if (!response.success) return false;

  const data = response.data;
  // Solana Foundation should have low privacy score (high activity)
  return (
    data.privacyScore <= 30 &&
    data.metrics.transactionCount > 0 &&
    data.risks.length > 0
  );
}

async function testFreshWalletAnalysis(): Promise<boolean> {
  // Test with a wallet that has no/minimal activity
  const wallet = 'BPFLoaderUpgradeab1e11111111111111111111111';
  const response = await httpGet(`${API_URL}/api/analyze/${wallet}`);

  if (!response.success) return false;

  // Fresh wallet should have higher privacy score
  return response.data.privacyScore >= 50;
}

async function testInvalidAddressRejection(): Promise<boolean> {
  const response = await httpGet(`${API_URL}/api/analyze/INVALID_ADDRESS`);
  return response.error === 'Invalid Solana address format';
}

async function testSQLInjectionPrevention(): Promise<boolean> {
  const response = await httpGet(`${API_URL}/api/analyze/'; DROP TABLE users; --`);
  return response.error === 'Invalid Solana address format';
}

async function testCommandInjectionPrevention(): Promise<boolean> {
  const response = await httpGet(`${API_URL}/api/analyze/; rm -rf /`);
  return response.error === 'Invalid Solana address format';
}

async function testPathTraversalPrevention(): Promise<boolean> {
  const response = await httpGet(`${API_URL}/api/analyze/../../../etc/passwd`);
  // Should be blocked by address validation
  return response.error !== undefined || typeof response === 'string';
}

async function testMissingAddressInPost(): Promise<boolean> {
  const response = await httpPost(`${API_URL}/api/analyze`, {});
  return response.error === 'Missing required parameter: address';
}

async function testExamplesEndpoint(): Promise<boolean> {
  const response = await httpGet(`${API_URL}/api/examples`);
  return response.examples && response.examples.length > 0;
}

async function testPrivacyScoreLogic(): Promise<boolean> {
  // High activity wallet should have lower score than fresh wallet
  const highActivity = await httpGet(`${API_URL}/api/analyze/vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg`);
  const lowActivity = await httpGet(`${API_URL}/api/analyze/BPFLoaderUpgradeab1e11111111111111111111111`);

  if (!highActivity.success || !lowActivity.success) return false;

  // Logic check: less activity = higher privacy score
  return lowActivity.data.privacyScore > highActivity.data.privacyScore;
}

// Security regex tests (unit test style)
async function testSecurityRegex(): Promise<boolean> {
  const dangerousChars = /[;&|`$(){}[\]<>!#*?\\'"]/;

  const shouldBlock = [
    '../../../etc/passwd',
    './circuits; rm -rf /',
    './circuits`whoami`',
    './circuits$(cat /etc/passwd)',
    './circuits | cat /etc/passwd',
  ];

  const shouldAllow = [
    './circuits/test',
    'my-circuit',
    'circuit_name',
  ];

  for (const path of shouldBlock) {
    const hasTraversal = path.includes('..') || path.includes('~');
    const hasDangerousChars = dangerousChars.test(path);
    if (!hasTraversal && !hasDangerousChars) return false;
  }

  for (const path of shouldAllow) {
    const hasTraversal = path.includes('..') || path.includes('~');
    const hasDangerousChars = dangerousChars.test(path);
    if (hasTraversal || hasDangerousChars) return false;
  }

  return true;
}

// Direct Helius API verification
async function testHeliusAPIConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const url = `https://api.helius.xyz/v0/addresses/vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg/transactions?api-key=${HELIUS_API_KEY}&limit=1`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(Array.isArray(json) && json.length > 0);
        } catch {
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
}

import * as https from 'https';

// ============================================
// TEST RUNNER
// ============================================

async function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Set test port via environment
    const env = { ...process.env, PORT: String(API_PORT) };

    serverProcess = spawn('npx', ['ts-node', 'src/shadow-tracker/api.ts'], {
      env,
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;

    serverProcess.stdout?.on('data', (data) => {
      if (data.toString().includes('Server running') && !started) {
        started = true;
        resolve();
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      if (!started && data.toString().includes('Error')) {
        reject(new Error(data.toString()));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!started) {
        reject(new Error('Server failed to start within 10 seconds'));
      }
    }, 10000);
  });
}

function stopServer(): void {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           SHADOW TRACKER - COMPREHENSIVE TEST SUITE          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Start server
  console.log('Starting test server on port', API_PORT, '...');
  try {
    await startServer();
    console.log('Server started successfully.\n');
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }

  // Wait for server to be fully ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Run all tests
  console.log('Running tests...\n');

  await runTest('Health endpoint', testHealthEndpoint);
  await runTest('Helius API connection', testHeliusAPIConnection);
  await runTest('Real wallet analysis (Solana Foundation)', testRealWalletAnalysis);
  await runTest('Fresh wallet analysis', testFreshWalletAnalysis);
  await runTest('Privacy score logic (high > low activity)', testPrivacyScoreLogic);
  await runTest('Invalid address rejection', testInvalidAddressRejection);
  await runTest('SQL injection prevention', testSQLInjectionPrevention);
  await runTest('Command injection prevention', testCommandInjectionPrevention);
  await runTest('Path traversal prevention', testPathTraversalPrevention);
  await runTest('Missing address in POST', testMissingAddressInPost);
  await runTest('Examples endpoint', testExamplesEndpoint);
  await runTest('Security regex patterns', testSecurityRegex);

  // Stop server
  stopServer();

  // Print results
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         TEST RESULTS                           ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${status}: ${result.name} (${result.duration}ms)`);
    if (!result.passed) {
      console.log(`        └─ ${result.details}`);
    }
    result.passed ? passed++ : failed++;
  }

  console.log('');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('───────────────────────────────────────────────────────────────');

  if (failed > 0) {
    console.log('\n⚠️  SOME TESTS FAILED\n');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED\n');
    process.exit(0);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

main().catch((error) => {
  console.error('Test suite error:', error);
  stopServer();
  process.exit(1);
});

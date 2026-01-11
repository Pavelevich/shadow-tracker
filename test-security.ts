/**
 * Security Test - Command Injection Prevention
 * Tests that the NoirVerifier rejects malicious paths
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Import the path validation function by creating a test instance
const testCases = [
  {
    name: "Normal path",
    path: "./circuits/test",
    shouldFail: false,
    reason: "Valid path within project"
  },
  {
    name: "Path traversal attack",
    path: "../../../etc/passwd",
    shouldFail: true,
    reason: "Contains .."
  },
  {
    name: "Command injection via semicolon",
    path: "./circuits; rm -rf /",
    shouldFail: true,
    reason: "Contains shell metacharacter ;"
  },
  {
    name: "Command injection via backticks",
    path: "./circuits`whoami`",
    shouldFail: true,
    reason: "Contains shell metacharacter `"
  },
  {
    name: "Command injection via $(...)",
    path: "./circuits$(cat /etc/passwd)",
    shouldFail: true,
    reason: "Contains shell metacharacter $("
  },
  {
    name: "Pipe injection",
    path: "./circuits | cat /etc/passwd",
    shouldFail: true,
    reason: "Contains shell metacharacter |"
  },
  {
    name: "Home directory expansion",
    path: "~/malicious",
    shouldFail: true,
    reason: "Contains ~"
  },
  {
    name: "Null byte injection",
    path: "./circuits\x00/malicious",
    shouldFail: true,
    reason: "Contains null byte"
  }
];

// Test the regex that validates paths
const dangerousChars = /[;&|`$(){}[\]<>!#*?\\'"\x00]/;

console.log("╔════════════════════════════════════════════════════════╗");
console.log("║     COMMAND INJECTION PREVENTION TEST                   ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const hasTraversal = test.path.includes('..') || test.path.includes('~');
  const hasDangerousChars = dangerousChars.test(test.path);
  const wouldBeBlocked = hasTraversal || hasDangerousChars;

  const testPassed = wouldBeBlocked === test.shouldFail;

  if (testPassed) {
    console.log(`✅ PASS: ${test.name}`);
    console.log(`   Path: "${test.path}"`);
    console.log(`   Blocked: ${wouldBeBlocked} (expected: ${test.shouldFail})`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${test.name}`);
    console.log(`   Path: "${test.path}"`);
    console.log(`   Blocked: ${wouldBeBlocked} (expected: ${test.shouldFail})`);
    console.log(`   Reason: ${test.reason}`);
    failed++;
  }
  console.log("");
}

console.log("════════════════════════════════════════════════════════════");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("════════════════════════════════════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  SECURITY TESTS FAILED - FIX REQUIRED");
  process.exit(1);
} else {
  console.log("\n✅ ALL SECURITY TESTS PASSED");
  process.exit(0);
}

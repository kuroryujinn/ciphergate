// CipherGate Headless Deployment Script
// Uses the CLI's run() function with non-interactive mode
// SPDX-License-Identifier: Apache-2.0

import { WebSocket } from 'ws';
(globalThis as any).WebSocket = WebSocket;

// Import the CLI's run function and config
const { run } = await import('../ciphergate-cli/src/index.js');
const { StandaloneConfig } = await import('../ciphergate-cli/src/config.js');
const { createLogger } = await import('../ciphergate-cli/src/logger-utils.js');

const config = new StandaloneConfig();
const logger = await createLogger(config.logDir);
const testEnvironment = config.getEnvironment(logger);

console.log('\n🔐 CipherGate Headless Deployment');
console.log('=================================\n');

try {
  // Monkey-patch readline to provide non-interactive answers
  const rli = (await import('node:readline/promises')).createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // Override question to auto-answer
  const origQuestion = rli.question.bind(rli);
  rli.question = async (query: string) => {
    process.stdout.write(query);
    if (query.includes('Which would you like to do?')) {
      const answer = '1\n'; // Deploy new vault
      process.stdout.write(answer);
      return answer.trim();
    }
    if (query.includes('Enter encrypted file payload')) {
      const answer = 'encrypted:QmTestFileHash123abc\n';
      process.stdout.write(answer);
      return answer.trim();
    }
    const answer = '8\n'; // Exit for everything else
    process.stdout.write(answer);
    return answer.trim();
  };

  // Run the CLI - it will auto-answer prompts
  await run(config, testEnvironment, logger);

  console.log('\n✅ Deployment completed!');
} catch (err: any) {
  console.error('\n❌ Deployment failed:', err?.message || String(err));
  process.exit(1);
}

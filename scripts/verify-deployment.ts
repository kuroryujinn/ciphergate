// CipherGate Deployment Verification Script
// Deploys to local testnet, exercises all 4 circuits, and reports results.
// SPDX-License-Identifier: Apache-2.0

import { WebSocket } from 'ws';
globalThis.WebSocket = WebSocket;

import { CipherGateAPI, type CipherGateProviders, type PrivateStateId, cipherGatePrivateStateKey } from '../api/src/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { MidnightWalletProvider } from '../ciphergate-cli/src/midnight-wallet-provider.js';
import { waitForUnshieldedFunds } from '../ciphergate-cli/src/wallet-utils.js';
import { CipherGatePrivateState, createCipherGatePrivateState } from '../contract/src/witnesses.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { getTestEnvironment } from '@midnight-ntwrk/testkit-js';
import { randomBytes } from '../api/src/utils/index.js';
import { type Ledger, State, ledger } from '../contract/src/managed/ciphergate/contract/index.js';
import * as CipherGate from '../contract/src/managed/ciphergate/contract/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger } from '../ciphergate-cli/src/logger-utils.js';

setNetworkId('undeployed');

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(currentDir, '..', 'ciphergate-cli', 'logs', 'verify', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

const zkConfigPath = path.resolve(currentDir, '..', 'contract', 'src', 'managed', 'ciphergate');
const genesisSeed = '0000000000000000000000000000000000000000000000000000000000000001';

let contractAddress = '';
const results: { test: string; passed: boolean; detail?: string }[] = [];

function record(test: string, passed: boolean, detail?: string) {
  results.push({ test, passed, detail });
  console.log(`  ${passed ? '✅' : '❌'} ${test}${detail ? ': ' + detail : ''}`);
}

async function queryLedgerState(providers: CipherGateProviders, address: string): Promise<Ledger | null> {
  try {
    const contractState = await providers.publicDataProvider.queryContractState(address);
    return contractState != null ? ledger(contractState.data) : null;
  } catch { return null; }
}

async function main() {
  console.log('\n🔐 CipherGate Deployment Verification');
  console.log('========================================\n');

  // Start test environment
  console.log('📦 Starting local test environment...');
  const testEnv = getTestEnvironment(logger) as any;
  const envConfiguration = await testEnv.start();
  logger.info(`Environment: ${JSON.stringify(envConfiguration)}`);
  console.log('   ✅ Test environment ready');

  // Create wallet
  console.log('\n💰 Creating wallet...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, genesisSeed);
  await walletProvider.start();
  const unshieldedState = await waitForUnshieldedFunds(logger, walletProvider.wallet, envConfiguration, unshieldedToken());
  const nightBalance = unshieldedState.balances[unshieldedToken().raw];
  if (!nightBalance) { console.error('No funds'); process.exit(1); }
  console.log(`   ✅ Wallet funded: ${nightBalance} NIGHT`);

  // Setup providers
  console.log('\n🔧 Setting up providers...');
  const privateStateStoreName = `ciphergate-verify-${Date.now()}`;
  const zkcp = new NodeZkConfigProvider<'uploadVault' | 'shareVault' | 'accessVault' | 'revokeVault'>(zkConfigPath);
  const providers: CipherGateProviders = {
    privateStateProvider: levelPrivateStateProvider<PrivateStateId, CipherGatePrivateState>({
      privateStateStoreName,
      signingKeyStoreName: `${privateStateStoreName}-signing-keys`,
      privateStoragePasswordProvider: () => 'CipherGate-Verify-2026!',
      accountId: genesisSeed,
    }),
    publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
    zkConfigProvider: zkcp,
    proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkcp),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // Deploy contract
  console.log('\n🚀 Deploying CipherGate contract...');
  const api = await CipherGateAPI.deploy(providers, logger);
  contractAddress = api.deployedContractAddress;
  console.log(`   ✅ Contract deployed at: ${contractAddress}`);
  record('Contract deployment', true, contractAddress);
  await sleep(3000);

  // 1. Test uploadVault
  console.log('\n📤 Testing uploadVault...');
  const payload = 'encrypted:QmTestFileHash123abc';
  await api.uploadVault(payload);
  await sleep(4000);
  const s1 = await queryLedgerState(providers, contractAddress);
  if (s1) {
    record('uploadVault → PRIVATE state', s1.state === State.PRIVATE, `state=${s1.state}`);
    record('uploadVault → payload stored', s1.encryptedPayload.is_some, `payload=${s1.encryptedPayload.value}`);
    record('uploadVault → owner set', toHex(s1.owner).length === 64, `owner=${toHex(s1.owner).substring(0,16)}...`);
  }

  // 2. Test shareVault
  console.log('\n🔑 Testing shareVault...');
  const recipientKey = randomBytes(32);
  const recipientPubKey = toHex(CipherGate.pureCircuits.publicKey(recipientKey));
  const encSharingKey = 'encrypted-symmetric-key-for-recipient';
  await api.shareVault(recipientPubKey, encSharingKey);
  await sleep(4000);
  const s2 = await queryLedgerState(providers, contractAddress);
  if (s2) {
    record('shareVault → SHARED state', s2.state === State.SHARED, `state=${s2.state}`);
    record('shareVault → recipient set', toHex(s2.authorizedRecipient) === recipientPubKey, `recipient=${recipientPubKey.substring(0,16)}...`);
    record('shareVault → sharing key stored', s2.encryptedSharingKey.is_some, `key=${s2.encryptedSharingKey.value}`);
  }

  // 3. Test accessVault (as recipient)
  console.log('\n👤 Testing accessVault (as recipient)...');
  const recipientStore = `ciphergate-verify-recipient-${Date.now()}`;
  const rProviders: CipherGateProviders = {
    privateStateProvider: levelPrivateStateProvider<PrivateStateId, CipherGatePrivateState>({
      privateStateStoreName: recipientStore,
      signingKeyStoreName: `${recipientStore}-signing-keys`,
      privateStoragePasswordProvider: () => 'CipherGate-Verify-2026!',
      accountId: toHex(randomBytes(32)),
    }),
    publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath) as any,
    proofProvider: httpClientProofProvider(envConfiguration.proofServer, new NodeZkConfigProvider(zkConfigPath) as any),
    walletProvider,
    midnightProvider: walletProvider,
  };
  const recipientApi = await CipherGateAPI.join(rProviders, contractAddress, logger);
  // Override initial private state to use our recipient key
  await rProviders.privateStateProvider.set(cipherGatePrivateStateKey, createCipherGatePrivateState(recipientKey));
  await sleep(3000);
  const accessResult = await recipientApi.accessVault();
  await sleep(4000);
  const s3 = await queryLedgerState(providers, contractAddress);
  if (s3) {
    record('accessVault → returns correct key', accessResult === encSharingKey, `key=${accessResult}`);
    record('accessVault → audit count = 1', s3.accessCount === 1n, `count=${s3.accessCount}`);
  }

  // 4. Test revokeVault
  console.log('\n🔄 Testing revokeVault...');
  await api.revokeVault();
  await sleep(4000);
  const s4 = await queryLedgerState(providers, contractAddress);
  if (s4) {
    record('revokeVault → PRIVATE state', s4.state === State.PRIVATE, `state=${s4.state}`);
    record('revokeVault → sharing key cleared', !s4.encryptedSharingKey.is_some, 'cleared');
  }

  // 5. Test unauthorized access rejection
  console.log('\n🚫 Testing unauthorized access...');
  try {
    const bystanderStore = `ciphergate-verify-bystander-${Date.now()}`;
    const bProviders: CipherGateProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, CipherGatePrivateState>({
        privateStateStoreName: bystanderStore,
        signingKeyStoreName: `${bystanderStore}-signing-keys`,
        privateStoragePasswordProvider: () => 'CipherGate-Verify-2026!',
        accountId: toHex(randomBytes(32)),
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: new NodeZkConfigProvider(zkConfigPath) as any,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, new NodeZkConfigProvider(zkConfigPath) as any),
      walletProvider,
      midnightProvider: walletProvider,
    };
    const bystanderApi = await CipherGateAPI.join(bProviders, contractAddress, logger);
    await bProviders.privateStateProvider.set(cipherGatePrivateStateKey, createCipherGatePrivateState(randomBytes(32)));
    await sleep(3000);
    await bystanderApi.accessVault();
    record('Unauthorized rejection', false, 'Should have thrown');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('Unauthorized rejection', true, msg.substring(0, 80));
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  await walletProvider.stop();
  await testEnv.shutdown();
  console.log('   ✅ Cleanup complete');

  // Final report
  console.log('\n========================================');
  console.log('📋 DEPLOYMENT VERIFICATION REPORT');
  console.log('========================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  for (const r of results) {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.test}`);
    if (r.detail) console.log(`     ${r.detail}`);
  }

  console.log(`\n📊 Passing: ${passed}/${results.length}`);
  console.log(`📝 Contract Address: ${contractAddress || 'N/A'}`);
  console.log(`\n${failed === 0 ? '🎉 ALL VERIFICATIONS PASSED!' : '⚠️  Some checks failed'}`);

  process.exit(failed > 0 ? 1 : 0);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => { console.error(err); process.exit(1); });

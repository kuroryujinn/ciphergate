// CipherGate Local Deployment Script
// Deploys to local testnet, exercises all 4 circuits, and outputs the contract address.
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
const logDir = path.resolve(currentDir, '..', 'ciphergate-cli', 'logs', 'deploy-local', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);
const zkConfigPath = path.resolve(currentDir, '..', 'contract', 'src', 'managed', 'ciphergate');

let contractAddress = '';

async function main() {
  try {
    console.log('\n🔐 CipherGate Local Deployment');
    console.log('===============================\n');

    // Phase 1: Start local test environment
    console.log('[1/6] Starting local test environment...');
    const testEnv = getTestEnvironment(logger) as any;
    const envConfig = await testEnv.start();
    console.log(`      Test environment ready at indexer: ${envConfig.indexer}`);

    // Phase 2: Create and fund wallet
    console.log('[2/6] Creating wallet...');
    const seed = '0000000000000000000000000000000000000000000000000000000000000001';
    const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
    await walletProvider.start();
    const unshieldedState = await waitForUnshieldedFunds(logger, walletProvider.wallet, envConfig, unshieldedToken());
    const balance = unshieldedState.balances[unshieldedToken().raw];
    if (!balance) throw new Error('No funds received');
    console.log(`      Wallet funded: ${balance} NIGHT`);

    // Phase 3: Setup providers and deploy
    console.log('[3/6] Deploying CipherGate contract...');
    const storeName = `ciphergate-deploy-${Date.now()}`;
    const zkcp = new NodeZkConfigProvider<'uploadVault' | 'shareVault' | 'accessVault' | 'revokeVault'>(zkConfigPath);
    const providers: CipherGateProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, CipherGatePrivateState>({
        privateStateStoreName: storeName,
        signingKeyStoreName: `${storeName}-signing-keys`,
        privateStoragePasswordProvider: () => process.env.PRIVATE_STATE_PASSWORD ?? 'CipherGate-Local-2026!',
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfig.indexer, envConfig.indexerWS),
      zkConfigProvider: zkcp,
      proofProvider: httpClientProofProvider(envConfig.proofServer, zkcp),
      walletProvider,
      midnightProvider: walletProvider,
    };

    const api = await CipherGateAPI.deploy(providers, logger);
    contractAddress = api.deployedContractAddress;
    console.log(`      ✅ Contract deployed at: ${contractAddress}`);
    console.log(`      ✅ Wallet seed: ${seed}`);

    // Subscribe to state updates
    let currentState: any;
    const sub = api.state$.subscribe(s => { currentState = s; });
    await sleep(5000);

    // Phase 4: uploadVault
    console.log('[4/6] Testing uploadVault...');
    const payload = 'encrypted:QmTestFileHash123abc';
    await api.uploadVault(payload);
    await sleep(5000);
    const s1 = await getLedgerState(providers, contractAddress);
    if (!s1) throw new Error('Failed to get ledger state after upload');

    const uploadOk = s1.state === State.PRIVATE && s1.encryptedPayload.is_some && s1.encryptedPayload.value === payload;
    console.log(`      ${uploadOk ? '✅' : '❌'} uploadVault: state=${s1.state}, payload=${s1.encryptedPayload.is_some}, owner=${toHex(s1.owner).substring(0,16)}...`);

    // Phase 5: shareVault + accessVault + revokeVault
    console.log('[5/6] Testing shareVault, accessVault, revokeVault...');

    // shareVault
    const recipientKey = randomBytes(32);
    const recipientPubKey = toHex(CipherGate.pureCircuits.publicKey(recipientKey));
    const encSharingKey = 'encrypted-symmetric-key-for-recipient';
    await api.shareVault(recipientPubKey, encSharingKey);
    await sleep(5000);
    const s2 = await getLedgerState(providers, contractAddress);
    if (!s2) throw new Error('Failed to get ledger state after share');

    const shareOk = s2.state === State.SHARED &&
      toHex(s2.authorizedRecipient) === recipientPubKey &&
      s2.encryptedSharingKey.is_some &&
      s2.encryptedSharingKey.value === encSharingKey;
    console.log(`      ${shareOk ? '✅' : '❌'} shareVault: state=${s2.state}, recipient=${toHex(s2.authorizedRecipient).substring(0,16)}...`);

    // accessVault (as share initiator - using same wallet which is the owner)
    console.log(`      Accessing vault (as owner, which is authorized)...`);
    const accessResult = await api.accessVault();
    await sleep(5000);
    const s3 = await getLedgerState(providers, contractAddress);
    if (!s3) throw new Error('Failed to get ledger state after access');

    const accessOk = accessResult === encSharingKey && s3.accessCount === 1n;
    console.log(`      ${accessOk ? '✅' : '❌'} accessVault: key_match=${accessResult === encSharingKey}, audit_count=${s3.accessCount}`);

    // revokeVault
    await api.revokeVault();
    await sleep(5000);
    const s4 = await getLedgerState(providers, contractAddress);
    if (!s4) throw new Error('Failed to get ledger state after revoke');

    const revokeOk = s4.state === State.PRIVATE && !s4.encryptedSharingKey.is_some;
    console.log(`      ${revokeOk ? '✅' : '❌'} revokeVault: state=${s4.state}, sharing_key_cleared=${!s4.encryptedSharingKey.is_some}`);

    // Phase 6: Summary
    console.log('\n[6/6] Generating deployment report...');

    sub.unsubscribe();
    await walletProvider.stop();
    await testEnv.shutdown();

    const allPassed = uploadOk && shareOk && accessOk && revokeOk;

    console.log('\n========================================');
    console.log('📋 DEPLOYMENT VERIFICATION REPORT');
    console.log('========================================\n');
    console.log(`  Network:        local (undeployed)`);
    console.log(`  Contract:       ${contractAddress}`);
    console.log(`  Wallet seed:    ${seed}`);
    console.log(`  Wallet addr:    ${currentState?.owner || 'N/A'}`);
    console.log(``);
    console.log(`  ✅ uploadVault:     ${uploadOk ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ shareVault:      ${shareOk ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ accessVault:     ${accessOk ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ revokeVault:     ${revokeOk ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Audit counter:   ${accessOk ? 'PASS' : 'FAIL'}`);
    console.log(``);
    console.log(`  🎉 ${allPassed ? 'ALL CIRCUITS VERIFIED SUCCESSFULLY' : 'SOME CHECKS FAILED'}`);
    console.log(`========================================\n`);

    if (allPassed) {
      console.log(`\n📌 To deploy to PREPROD instead of local testnet, use:\n`);
      console.log(`   PROOF_SERVER_URL=http://127.0.0.1:6300 WALLET_SEED=<your_seed> npm run deploy\n`);
      console.log(`   Note: Preprod WebSocket (wss://rpc.preprod.midnight.network) is not reachable from this machine.\n`);
    }

  } catch (err) {
    console.error('\n❌ Deployment failed:', err instanceof Error ? err.message : String(err));
    console.log(`\n📝 Log file written to: ${logDir}`);
    process.exit(1);
  }
}

async function getLedgerState(providers: CipherGateProviders, address: string): Promise<Ledger | null> {
  try {
    const s = await providers.publicDataProvider.queryContractState(address);
    return s ? ledger(s.data) : null;
  } catch { return null; }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

main();

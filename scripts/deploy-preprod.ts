// CipherGate Deploy Script (non-interactive, preprod)
// SPDX-License-Identifier: Apache-2.0

import { WebSocket } from 'ws';
import { createLogger } from '../ciphergate-cli/src/logger-utils.js';
import { CipherGateAPI, type CipherGateProviders } from '../api/src/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { MidnightWalletProvider } from '../ciphergate-cli/src/midnight-wallet-provider.js';
import { waitForUnshieldedFunds, syncWallet } from '../ciphergate-cli/src/wallet-utils.js';
import { generateDust } from '../ciphergate-cli/src/generate-dust.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { randomBytes } from '../api/src/utils/index.js';
import { CipherGatePrivateState } from '../contract/src/witnesses.js';
import { cipherGatePrivateStateKey, type PrivateStateId } from '../api/src/common-types.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error: needed for WebSocket in Node
globalThis.WebSocket = WebSocket;

setNetworkId('preprod');

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(currentDir, '..', 'ciphergate-cli', 'logs', 'deploy', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

const envConfiguration: EnvironmentConfiguration = {
  walletNetworkId: 'preprod',
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
  proofServer: process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
};

const zkConfigPath = path.resolve(currentDir, '..', 'contract', 'src', 'managed', 'ciphergate');
const privateStateStoreName = 'ciphergate-private-state';

async function deploy() {
  logger.info(`Using proof server: ${envConfiguration.proofServer}`);

  const seed = process.env.WALLET_SEED ?? toHex(randomBytes(32));
  logger.info(`Using wallet seed: ${seed}`);

  const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
  await walletProvider.start();

  const unshieldedState = await waitForUnshieldedFunds(
    logger,
    walletProvider.wallet,
    envConfiguration,
    unshieldedToken(),
    true,
  );
  const nightBalance = unshieldedState.balances[unshieldedToken().raw];
  if (nightBalance === undefined) {
    logger.error('No funds received after faucet request.');
    process.exit(1);
  }
  logger.info(`NIGHT balance: ${nightBalance}`);

  const dustGeneration = await generateDust(logger, seed, unshieldedState, walletProvider.wallet);
  if (dustGeneration) {
    logger.info(`Dust generation tx: ${dustGeneration}`);
    await syncWallet(logger, walletProvider.wallet);
  }

  const zkConfigProvider = new NodeZkConfigProvider<'uploadVault' | 'shareVault' | 'accessVault' | 'revokeVault'>(zkConfigPath);
  const providers: CipherGateProviders = {
    privateStateProvider: levelPrivateStateProvider<PrivateStateId, CipherGatePrivateState>({
      privateStateStoreName,
      signingKeyStoreName: `${privateStateStoreName}-signing-keys`,
      privateStoragePasswordProvider: () => process.env.PRIVATE_STATE_PASSWORD ?? 'CipherGate-Deploy-2026!',
      accountId: seed,
    }),
    publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  logger.info('Deploying CipherGate contract to preprod...');
  const api = await CipherGateAPI.deploy(providers, logger);

  console.log('\n========================================');
  console.log('CONTRACT DEPLOYED SUCCESSFULLY');
  console.log(`Contract Address: ${api.deployedContractAddress}`);
  console.log('========================================\n');
  logger.info('Deployment completed successfully - contract address and seed logged to deployment log');

  await walletProvider.stop();
}

deploy().catch((err) => {
  logger.error(err);
  process.exit(1);
});

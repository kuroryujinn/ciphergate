// CipherGate CLI Client
// SPDX-License-Identifier: Apache-2.0

import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import {
  CipherGateAPI,
  type CipherGateDerivedState,
  cipherGatePrivateStateKey,
  type CipherGateProviders,
  type DeployedCipherGateContract,
  type PrivateStateId,
} from '../../api/src/index.js';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { ledger, type Ledger, State } from '../../contract/src/managed/ciphergate/contract/index.js';
import * as CipherGate from '../../contract/src/managed/ciphergate/contract/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { type Logger } from 'pino';
import { type Config, StandaloneConfig } from './config.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { assertIsContractAddress, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { randomBytes } from '../../api/src/utils/index.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { syncWallet, waitForUnshieldedFunds } from './wallet-utils.js';
import { generateDust } from './generate-dust.js';
import { CipherGatePrivateState } from '../../contract/src/witnesses.js';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

export const getCipherGateLedgerState = async (
  providers: CipherGateProviders,
  contractAddress: ContractAddress,
): Promise<Ledger | null> => {
  assertIsContractAddress(contractAddress);
  const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
  return contractState != null ? ledger(contractState.data) : null;
};

const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new CipherGate vault contract
  2. Join an existing CipherGate vault contract
  3. Exit
Which would you like to do? `;

const deployOrJoin = async (
  providers: CipherGateProviders,
  rli: Interface,
  logger: Logger,
): Promise<CipherGateAPI | null> => {
  let api: CipherGateAPI | null = null;

  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1':
        api = await CipherGateAPI.deploy(providers, logger);
        logger.info(`Deployed CipherGate contract at address: ${api.deployedContractAddress}`);
        return api;
      case '2':
        api = await CipherGateAPI.join(
          providers,
          await rli.question('What is the contract address (in hex)? '),
          logger,
        );
        logger.info(`Joined CipherGate contract at address: ${api.deployedContractAddress}`);
        return api;
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const displayLedgerState = async (
  providers: CipherGateProviders,
  deployedCipherGateContract: DeployedCipherGateContract,
  logger: Logger,
): Promise<void> => {
  const contractAddress = deployedCipherGateContract.deployTxData.public.contractAddress;
  const ledgerState = await getCipherGateLedgerState(providers, contractAddress);
  if (ledgerState === null) {
    logger.info(`There is no contract deployed at ${contractAddress}`);
  } else {
    const vaultState =
      ledgerState.state === State.VACANT ? 'vacant' : ledgerState.state === State.PRIVATE ? 'private' : 'shared';
    logger.info(`Current state is: '${vaultState}'`);
    logger.info(`Owner PK: '${toHex(ledgerState.owner)}'`);
    logger.info(`Recipient PK: '${toHex(ledgerState.authorizedRecipient)}'`);
    logger.info(
      `Encrypted Payload: '${ledgerState.encryptedPayload.is_some ? ledgerState.encryptedPayload.value : 'none'}'`,
    );
    logger.info(
      `Encrypted Sharing Key: '${ledgerState.encryptedSharingKey.is_some ? ledgerState.encryptedSharingKey.value : 'none'}'`,
    );
    logger.info(`Immutable Access Count (Audit Log): ${ledgerState.accessCount}`);
  }
};

const displayPrivateState = async (providers: CipherGateProviders, logger: Logger): Promise<void> => {
  const privateState = await providers.privateStateProvider.get(cipherGatePrivateStateKey);
  if (privateState === null) {
    logger.info(`There is no existing private state`);
  } else {
    logger.info(`Current secret key is: ${toHex(privateState.secretKey)}`);
    const pk = CipherGate.pureCircuits.publicKey(privateState.secretKey);
    logger.info(`Your derived public key is: ${toHex(pk)}`);
  }
};

const displayDerivedState = (state: CipherGateDerivedState | undefined, logger: Logger) => {
  if (state === undefined) {
    logger.info(`No state currently available`);
  } else {
    const vaultState = state.state === State.VACANT ? 'vacant' : state.state === State.PRIVATE ? 'private' : 'shared';
    logger.info(`Current state: '${vaultState}'`);
    logger.info(`Owner: '${state.owner}'`);
    logger.info(`Recipient: '${state.authorizedRecipient}'`);
    logger.info(
      `Role: '${state.isOwner ? 'Owner' : state.isRecipient ? 'Authorized Recipient' : 'Unprivileged Bystander'}'`,
    );
    logger.info(`Audit Access Count: ${state.accessCount}`);
  }
};

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Upload encrypted file metadata (Owner)
  2. Share vault with recipient PK (Owner)
  3. Access and decrypt sharing key (Recipient/Owner - updates on-chain audit log)
  4. Revoke sharing access (Owner)
  5. Display current ledger state (known by everyone)
  6. Display current private state (your private key/public key)
  7. Display current derived state (role, files, access logs)
  8. Exit
Which would you like to do? `;

const mainLoop = async (providers: CipherGateProviders, rli: Interface, logger: Logger): Promise<void> => {
  const api = await deployOrJoin(providers, rli, logger);
  if (api === null) {
    return;
  }
  let currentState: CipherGateDerivedState | undefined;
  const stateObserver = {
    next: (state: CipherGateDerivedState) => (currentState = state),
  };
  const subscription = api.state$.subscribe(stateObserver);
  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      try {
        switch (choice) {
          case '1': {
            const payload = await rli.question(`Enter encrypted file payload (e.g. JSON metadata or IPFS hash): `);
            await api.uploadVault(payload);
            logger.info('Successfully uploaded encrypted file vault.');
            break;
          }
          case '2': {
            const recipient = await rli.question(`Enter recipient public key (in hex): `);
            const encKey = await rli.question(
              `Enter encrypted sharing key (symmetric key encrypted with recipient's public key): `,
            );
            await api.shareVault(recipient, encKey);
            logger.info('Successfully shared vault with recipient.');
            break;
          }
          case '3': {
            logger.info('Initiating ZK authorization proof for accessing the vault...');
            const decryptedKey = await api.accessVault();
            logger.info(`Access verified on-chain. Decrypted sharing key is: ${decryptedKey}`);
            break;
          }
          case '4': {
            await api.revokeVault();
            logger.info('Access revoked successfully.');
            break;
          }
          case '5':
            await displayLedgerState(providers, api.deployedContract, logger);
            break;
          case '6':
            await displayPrivateState(providers, logger);
            break;
          case '7':
            displayDerivedState(currentState, logger);
            break;
          case '8':
            logger.info('Exiting...');
            return;
          default:
            logger.error(`Invalid choice: ${choice}`);
        }
      } catch (e) {
        logError(logger, e);
        logger.info('Returning to main menu...');
      }
    }
  } finally {
    subscription.unsubscribe();
  }
};

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<string | undefined> => {
  if (config instanceof StandaloneConfig) {
    return GENESIS_MINT_WALLET_SEED;
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return toHex(randomBytes(32));
      case '2':
        return await rli.question('Enter your wallet seed: ');
      case '3':
        logger.info('Exiting...');
        return undefined;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, testEnv: TestEnvironment, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  const providersToBeStopped: MidnightWalletProvider[] = [];
  try {
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);
    const seed = await buildWallet(config, rli, logger);
    if (seed === undefined) {
      return;
    }
    const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
    providersToBeStopped.push(walletProvider);
    const walletFacade: WalletFacade = walletProvider.wallet;

    await walletProvider.start();

    const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfiguration, unshieldedToken());
    const nightBalance = unshieldedState.balances[unshieldedToken().raw];
    if (nightBalance === undefined) {
      logger.info('No funds received, exiting...');
      return;
    }
    logger.info(`Your NIGHT wallet balance is: ${nightBalance}`);

    if (config.generateDust) {
      const dustGeneration = await generateDust(logger, seed, unshieldedState, walletFacade);
      if (dustGeneration) {
        logger.info(`Submitted dust generation registration transaction: ${dustGeneration}`);
        await syncWallet(logger, walletFacade);
      }
    }

    const zkConfigProvider = new NodeZkConfigProvider<'uploadVault' | 'shareVault' | 'accessVault' | 'revokeVault'>(
      config.zkConfigPath,
    );
    const providers: CipherGateProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, CipherGatePrivateState>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => {
          return 'CipherGate-Test-2026!';
        },
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };
    await mainLoop(providers, rli, logger);
  } catch (e) {
    logError(logger, e);
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logError(logger, e);
    } finally {
      try {
        for (const wallet of providersToBeStopped) {
          logger.info('Stopping wallet...');
          await wallet.stop();
        }
        if (testEnv) {
          logger.info('Stopping test environment...');
          await testEnv.shutdown();
        }
      } catch (e) {
        logError(logger, e);
      }
    }
  }
};

function logError(logger: Logger, e: unknown) {
  if (e instanceof Error) {
    logger.error(`Found error '${e.message}'`);
    logger.debug(`${e.stack}`);
  } else {
    logger.error(`Found error (unknown type)`);
  }
}

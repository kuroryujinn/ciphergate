// CipherGate Deployed Vault Manager
// SPDX-License-Identifier: Apache-2.0

import {
  CipherGateAPI,
  type CipherGateCircuitKeys,
  type CipherGateProviders,
  type DeployedCipherGateAPI,
} from '../../../api/src/index.js';
import { type ContractAddress, fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  type Observable,
  take,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import { type Logger } from 'pino';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import semver from 'semver';
import {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { CipherGatePrivateState } from '../../../contract/src/index.js';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider.js';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WalletConnectionState {
  readonly status: WalletConnectionStatus;
  readonly error?: string;
}

export interface InProgressVaultDeployment {
  readonly status: 'in-progress';
}

export interface DeployedVaultDeployment {
  readonly status: 'deployed';
  readonly api: DeployedCipherGateAPI;
}

export interface FailedVaultDeployment {
  readonly status: 'failed';
  readonly error: Error;
}

export type VaultDeployment = InProgressVaultDeployment | DeployedVaultDeployment | FailedVaultDeployment;

export interface DeployedVaultAPIProvider {
  readonly vaultDeployments$: Observable<Array<Observable<VaultDeployment>>>;
  readonly walletState$: Observable<WalletConnectionState>;
  readonly resolve: (contractAddress?: ContractAddress) => Observable<VaultDeployment>;
  readonly connectWallet: () => void;
  readonly disconnectWallet: () => void;
}

export class BrowserDeployedVaultManager implements DeployedVaultAPIProvider {
  readonly #vaultDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<VaultDeployment>>>;
  readonly #walletStateSubject: BehaviorSubject<WalletConnectionState>;
  #initializedProviders: Promise<CipherGateProviders> | undefined;
  #connectedAPI: ConnectedAPI | undefined;
  readonly #networkId: NetworkId;

  constructor(private readonly logger: Logger) {
    this.#vaultDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<VaultDeployment>>>([]);
    this.#walletStateSubject = new BehaviorSubject<WalletConnectionState>({ status: 'disconnected' });
    this.#networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
    this.vaultDeployments$ = this.#vaultDeploymentsSubject;
    this.walletState$ = this.#walletStateSubject;
  }

  readonly vaultDeployments$: Observable<Array<Observable<VaultDeployment>>>;
  readonly walletState$: Observable<WalletConnectionState>;

  connectWallet(): void {
    if (this.#walletStateSubject.value.status === 'connecting' || this.#walletStateSubject.value.status === 'connected') {
      return;
    }
    this.#walletStateSubject.next({ status: 'connecting' });
    connectToWallet(this.logger, this.#networkId).then(
      (connectedAPI) => {
        this.#connectedAPI = connectedAPI;
        this.#walletStateSubject.next({ status: 'connected' });
      },
      (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.#walletStateSubject.next({ status: 'error', error: message });
      },
    );
  }

  disconnectWallet(): void {
    this.#initializedProviders = undefined;
    this.#connectedAPI = undefined;
    this.#walletStateSubject.next({ status: 'disconnected' });
  }

  resolve(contractAddress?: ContractAddress): Observable<VaultDeployment> {
    const deployments = this.#vaultDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === 'deployed' && deployment.value.api.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    const currentWalletState = this.#walletStateSubject.value;
    if (currentWalletState.status !== 'connected') {
      this.connectWallet();
      deployment = new BehaviorSubject<VaultDeployment>({
        status: 'failed',
        error: new Error('Wallet not connected. Please connect your Midnight 1AM wallet first.'),
      });
      this.#vaultDeploymentsSubject.next([...deployments, deployment]);
      return deployment;
    }

    deployment = new BehaviorSubject<VaultDeployment>({
      status: 'in-progress',
    });

    if (contractAddress) {
      void this.joinDeployment(deployment, contractAddress);
    } else {
      void this.deployDeployment(deployment);
    }

    this.#vaultDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<CipherGateProviders> {
    return this.#initializedProviders ?? (this.#initializedProviders = this.initializeProviders());
  }

  private async initializeProviders(): Promise<CipherGateProviders> {
    const logger = this.logger;
    const connectedAPI = this.#connectedAPI;
    if (!connectedAPI) {
      throw new Error('Wallet not connected');
    }
    const zkConfigPath = window.location.origin;
    const keyMaterialProvider = new FetchZkConfigProvider<CipherGateCircuitKeys>(zkConfigPath, fetch.bind(window));
    const config = await connectedAPI.getConfiguration();
    const inMemoryCipherGatePrivateStateProvider = inMemoryPrivateStateProvider<string, CipherGatePrivateState>();
    const shieldedAddresses = await connectedAPI.getShieldedAddresses();
    return {
      privateStateProvider: inMemoryCipherGatePrivateStateProvider,
      zkConfigProvider: keyMaterialProvider,
      proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
      publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
      walletProvider: {
        getCoinPublicKey(): string {
          return shieldedAddresses.shieldedCoinPublicKey;
        },
        getEncryptionPublicKey(): string {
          return shieldedAddresses.shieldedEncryptionPublicKey;
        },
        balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
          try {
            logger.info({ tx, ttl }, 'Balancing transaction via wallet');
            const serializedTx = toHex(tx.serialize());
            const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
            return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
              'signature',
              'proof',
              'binding',
              fromHex(received.tx),
            );
          } catch (e) {
            logger.error({ error: e }, 'Error balancing transaction via wallet');
            throw e;
          }
        },
      },
      midnightProvider: {
        submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
          await connectedAPI.submitTransaction(toHex(tx.serialize()));
          const txIdentifiers = tx.identifiers();
          const txId = txIdentifiers[0];
          logger.info({ txIdentifiers }, 'Submitted transaction via wallet');
          return txId;
        },
      },
    };
  }

  private async deployDeployment(deployment: BehaviorSubject<VaultDeployment>): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await CipherGateAPI.deploy(providers, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<VaultDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await CipherGateAPI.join(providers, contractAddress, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(wallet.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

const connectToWallet = (logger: Logger, networkId: string): Promise<ConnectedAPI> => {
  return firstValueFrom(
    fnPipe(
      interval(100),
      map(() => getFirstCompatibleWallet()),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Check for wallet connector API');
      }),
      filter((connectorAPI): connectorAPI is InitialAPI => !!connectorAPI),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Compatible wallet connector API found. Connecting.');
      }),
      take(1),
      timeout({
        first: 1_000,
        with: () =>
          throwError(() => {
            logger.error('Could not find wallet connector API');
            return new Error('Could not find Midnight 1AM wallet. Extension installed?');
          }),
      }),
      concatMap(async (initialAPI) => {
        const connectedAPI = await initialAPI.connect(networkId);
        const connectionStatus = await connectedAPI.getConnectionStatus();
        logger.info(connectionStatus, 'Wallet connector API enabled status');
        return connectedAPI;
      }),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => {
            logger.error('Wallet connector API has failed to respond');
            return new Error('Midnight 1AM wallet has failed to respond. Extension enabled?');
          }),
      }),
      catchError((error, apis) =>
        error
          ? throwError(() => {
              logger.error('Unable to enable connector API' + error);
              return new Error('Application is not authorized');
            })
          : apis,
      ),
    ),
  );
};

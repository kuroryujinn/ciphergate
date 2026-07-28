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

export type WalletConnectionStatus =
  | 'disconnected'
  | 'detecting'
  | 'connecting'
  | 'connected'
  | 'network-ready'
  | 'connection-lost'
  | 'error';

export interface WalletConnectionState {
  readonly status: WalletConnectionStatus;
  readonly error?: string;
  readonly networkId?: string;
  readonly walletDetected?: boolean;
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
  readonly retryConnection: () => void;
}

const WALLET_STORAGE_KEY = 'ciphergate-wallet-state';

interface PersistedWalletState {
  wasConnected: boolean;
  networkId: string;
  timestamp: number;
}

/** Restore the wallet connection state from sessionStorage if available. */
const loadPersistedWalletState = (networkId: string): boolean => {
  try {
    const raw = sessionStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as PersistedWalletState;
    // Only restore if it's for the same network and within the last hour
    if (parsed.networkId !== networkId) return false;
    if (Date.now() - parsed.timestamp > 3_600_000) return false;
    return parsed.wasConnected;
  } catch {
    return false;
  }
};

const persistWalletState = (state: WalletConnectionState): void => {
  try {
    const payload: PersistedWalletState = {
      wasConnected: state.status === 'connected' || state.status === 'network-ready',
      networkId: state.networkId ?? '',
      timestamp: Date.now(),
    };
    sessionStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
};

const clearPersistedWalletState = (): void => {
  try {
    sessionStorage.removeItem(WALLET_STORAGE_KEY);
  } catch {
    // Silently fail
  }
};

const VALID_NETWORKS = ['preprod', 'preview', 'undeployed'] as const;
type ValidNetworkId = (typeof VALID_NETWORKS)[number];

export class BrowserDeployedVaultManager implements DeployedVaultAPIProvider {
  readonly #vaultDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<VaultDeployment>>>;
  readonly #walletStateSubject: BehaviorSubject<WalletConnectionState>;
  #initializedProviders: Promise<CipherGateProviders> | undefined;
  #connectedAPI: ConnectedAPI | undefined;
  readonly #networkId: NetworkId;
  readonly #networkIdValid: boolean;
  #reconnectAttempts: number;
  readonly #maxReconnectAttempts = 3;

  constructor(private readonly logger: Logger) {
    this.#vaultDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<VaultDeployment>>>([]);
    this.#walletStateSubject = new BehaviorSubject<WalletConnectionState>({ status: 'disconnected' });
    this.#networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
    this.#networkIdValid = VALID_NETWORKS.includes(this.#networkId as ValidNetworkId);
    this.#reconnectAttempts = 0;
    this.vaultDeployments$ = this.#vaultDeploymentsSubject;
    this.walletState$ = this.#walletStateSubject;

    // Auto-detect wallet on initialization
    this.detectWallet();
  }

  readonly vaultDeployments$: Observable<Array<Observable<VaultDeployment>>>;
  readonly walletState$: Observable<WalletConnectionState>;

  /** Detect if a Midnight wallet extension is installed without connecting. */
  private detectWallet(): void {
    const wasConnected = loadPersistedWalletState(this.#networkId);

    if (!this.#networkIdValid) {
      this.#walletStateSubject.next({
        status: 'error',
        error: `Unsupported network ID: '${this.#networkId}'. Expected one of: ${VALID_NETWORKS.join(', ')}.`,
        networkId: this.#networkId,
      });
      return;
    }

    // Check if wallet extension is available
    const walletAvailable = !!window.midnight && Object.values(window.midnight).length > 0;

    if (!walletAvailable) {
      this.#walletStateSubject.next({
        status: 'disconnected',
        error: 'Midnight 1AM wallet extension not detected. Please install the wallet extension.',
        networkId: this.#networkId,
        walletDetected: false,
      });
      return;
    }

    this.#walletStateSubject.next({
      status: 'detecting',
      networkId: this.#networkId,
      walletDetected: true,
    });

    // Auto-reconnect if previously connected
    if (wasConnected) {
      this.logger.info('Previous wallet session detected. Attempting auto-reconnect...');
      // Small delay to allow the app to fully initialize
      setTimeout(() => this.connectWallet(), 500);
    }
  }

  connectWallet(): void {
    const currentState = this.#walletStateSubject.value;
    if (
      currentState.status === 'connecting' ||
      currentState.status === 'connected' ||
      currentState.status === 'network-ready'
    ) {
      return;
    }

    if (!this.#networkIdValid) {
      this.#walletStateSubject.next({
        status: 'error',
        error: `Cannot connect: Unsupported network ID '${this.#networkId}'. Please set VITE_NETWORK_ID to one of: ${VALID_NETWORKS.join(', ')}.`,
        networkId: this.#networkId,
      });
      return;
    }

    this.#walletStateSubject.next({
      status: 'connecting',
      networkId: this.#networkId,
    });

    // Reset reconnect attempts on explicit connect
    this.#reconnectAttempts = 0;

    connectToWallet(this.logger, this.#networkId).then(
      (connectedAPI) => {
        this.#connectedAPI = connectedAPI;
        this.#reconnectAttempts = 0;
        this.#walletStateSubject.next({
          status: 'connected',
          networkId: this.#networkId,
        });
        persistWalletState(this.#walletStateSubject.value);

        // After connection, check network readiness
        void this.checkNetworkReadiness();
      },
      (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.#walletStateSubject.next({
          status: 'error',
          error: message,
          networkId: this.#networkId,
        });
        clearPersistedWalletState();
      },
    );
  }

  disconnectWallet(): void {
    this.#initializedProviders = undefined;
    this.#connectedAPI = undefined;
    this.#reconnectAttempts = 0;
    this.#walletStateSubject.next({
      status: 'disconnected',
      networkId: this.#networkId,
    });
    clearPersistedWalletState();
  }

  retryConnection(): void {
    if (this.#reconnectAttempts >= this.#maxReconnectAttempts) {
      this.#walletStateSubject.next({
        status: 'connection-lost',
        error: `Maximum reconnect attempts (${this.#maxReconnectAttempts}) reached. Please click "Connect Wallet" to try again.`,
        networkId: this.#networkId,
      });
      return;
    }
    this.#reconnectAttempts += 1;
    this.logger.info(`Reconnect attempt ${this.#reconnectAttempts}/${this.#maxReconnectAttempts}`);
    this.connectWallet();
  }

  /** Check if the target network endpoints are reachable. */
  private async checkNetworkReadiness(): Promise<void> {
    try {
      const currentState = this.#walletStateSubject.value;
      if (currentState.status !== 'connected') return;

      // Attempt to reach the indexer as a health check
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);

      const response = await fetch('https://indexer.preprod.midnight.network/api/v4/health', {
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);

      if (response !== null) {
        this.#walletStateSubject.next({
          status: 'network-ready',
          networkId: this.#networkId,
          walletDetected: true,
        });
      } else {
        // Network not reachable, stay connected but note it
        this.#walletStateSubject.next({
          status: 'connected',
          networkId: this.#networkId,
          error:
            'Wallet connected but Midnight Preprod network is currently unreachable. Contract deployment will be unavailable.',
        });
      }
    } catch {
      // Network check failed - wallet is connected but infrastructure is down
      this.#walletStateSubject.next({
        status: 'connected',
        networkId: this.#networkId,
      });
    }
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
    if (currentWalletState.status !== 'connected' && currentWalletState.status !== 'network-ready') {
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

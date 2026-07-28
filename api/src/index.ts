// CipherGate API Layer
// SPDX-License-Identifier: Apache-2.0

import * as CipherGate from '../../contract/src/managed/ciphergate/contract/index.js';

import { type ContractAddress, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type CipherGateDerivedState,
  type CipherGateContract,
  type CipherGateProviders,
  type DeployedCipherGateContract,
  cipherGatePrivateStateKey,
} from './common-types.js';
import { CompiledCipherGateContractContract } from '../../contract/src/index.js';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { CipherGatePrivateState, createCipherGatePrivateState } from '../../contract/src/witnesses.js';

/**
 * An API for a deployed CipherGate contract.
 */
export interface DeployedCipherGateAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<CipherGateDerivedState>;

  uploadVault: (payload: string) => Promise<void>;
  shareVault: (recipientPubKey: string, encSharingKey: string) => Promise<void>;
  accessVault: () => Promise<string>;
  revokeVault: () => Promise<void>;
}

export class CipherGateAPI implements DeployedCipherGateAPI {
  private constructor(
    public readonly deployedContract: DeployedCipherGateContract,
    private readonly providers: CipherGateProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = combineLatest(
      [
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => CipherGate.ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  state:
                    ledgerState.state === CipherGate.State.VACANT
                      ? 'vacant'
                      : ledgerState.state === CipherGate.State.PRIVATE
                        ? 'private'
                        : 'shared',
                  owner: toHex(ledgerState.owner),
                  authorizedRecipient: toHex(ledgerState.authorizedRecipient),
                  accessCount: ledgerState.accessCount.toString(),
                },
              },
            }),
          ),
        ),
        from(providers.privateStateProvider.get(cipherGatePrivateStateKey) as Promise<CipherGatePrivateState>),
      ],
      (ledgerState, privateState) => {
        const hashedSecretKey = CipherGate.pureCircuits.publicKey(privateState.secretKey);

        const isOwner = toHex(ledgerState.owner) === toHex(hashedSecretKey);
        const isRecipient = toHex(ledgerState.authorizedRecipient) === toHex(hashedSecretKey);

        return {
          state: ledgerState.state,
          owner: toHex(ledgerState.owner),
          authorizedRecipient: toHex(ledgerState.authorizedRecipient),
          encryptedPayload: ledgerState.encryptedPayload.is_some ? ledgerState.encryptedPayload.value : undefined,
          encryptedSharingKey: ledgerState.encryptedSharingKey.is_some
            ? ledgerState.encryptedSharingKey.value
            : undefined,
          accessCount: ledgerState.accessCount,
          isOwner,
          isRecipient,
        };
      },
    );
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<CipherGateDerivedState>;

  /**
   * Uploads an encrypted file payload/vault metadata.
   */
  async uploadVault(payload: string): Promise<void> {
    this.logger?.info(`uploadingVault: ${payload}`);
    const txData = await this.deployedContract.callTx.uploadVault(payload);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'uploadVault',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Shares the vault with a recipient public key by publishing an encrypted sharing key.
   */
  async shareVault(recipientPubKey: string, encSharingKey: string): Promise<void> {
    this.logger?.info(`sharingVault with recipient: ${recipientPubKey}`);
    const txData = await this.deployedContract.callTx.shareVault(fromHex(recipientPubKey), encSharingKey);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'shareVault',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Accesses/decrypts the vault, generating an immutable audit log entry.
   * Returns the encrypted sharing key string.
   */
  async accessVault(): Promise<string> {
    this.logger?.info('accessingVault');
    const txData = await this.deployedContract.callTx.accessVault();
    this.logger?.trace({
      transactionAdded: {
        circuit: 'accessVault',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
    const contractState = await this.providers.publicDataProvider.queryContractState(this.deployedContractAddress);
    if (!contractState) {
      throw new Error('Contract state not found');
    }
    const ledgerState = CipherGate.ledger(contractState.data);
    if (!ledgerState.encryptedSharingKey.is_some) {
      throw new Error('No sharing key in vault');
    }
    return ledgerState.encryptedSharingKey.value;
  }

  /**
   * Revokes sharing permissions and wipes out the recipient fields.
   */
  async revokeVault(): Promise<void> {
    this.logger?.info('revokingVault');
    const txData = await this.deployedContract.callTx.revokeVault();
    this.logger?.trace({
      transactionAdded: {
        circuit: 'revokeVault',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Deploys a new CipherGate contract to the network.
   */
  static async deploy(providers: CipherGateProviders, logger?: Logger): Promise<CipherGateAPI> {
    logger?.info('deployContract');

    const deployedCipherGateContract = await deployContract(providers, {
      compiledContract: CompiledCipherGateContractContract,
      privateStateId: cipherGatePrivateStateKey,
      initialPrivateState: createCipherGatePrivateState(utils.randomBytes(32)),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedCipherGateContract.deployTxData.public,
      },
    });

    return new CipherGateAPI(deployedCipherGateContract, providers, logger);
  }

  /**
   * Finds an already deployed CipherGate contract on the network and joins it.
   */
  static async join(
    providers: CipherGateProviders,
    contractAddress: ContractAddress,
    logger?: Logger,
  ): Promise<CipherGateAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedCipherGateContract = await findDeployedContract<CipherGateContract>(providers, {
      contractAddress,
      compiledContract: CompiledCipherGateContractContract,
      privateStateId: cipherGatePrivateStateKey,
      initialPrivateState: await CipherGateAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedCipherGateContract.deployTxData.public,
      },
    });

    return new CipherGateAPI(deployedCipherGateContract, providers, logger);
  }

  private static async getPrivateState(
    providers: CipherGateProviders,
    contractAddress: ContractAddress,
  ): Promise<CipherGatePrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(cipherGatePrivateStateKey);
    return existingPrivateState ?? createCipherGatePrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';

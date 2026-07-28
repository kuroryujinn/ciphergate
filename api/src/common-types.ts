// CipherGate API Common Types
// SPDX-License-Identifier: Apache-2.0

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { State, CipherGatePrivateState, Contract, Witnesses } from '../../contract/src/index.js';

export const cipherGatePrivateStateKey = 'cipherGatePrivateState';
export type PrivateStateId = typeof cipherGatePrivateStateKey;

/**
 * The private states consumed throughout the application.
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link CipherGateContract} deployments.
   */
  readonly cipherGatePrivateState: CipherGatePrivateState;
};

/**
 * Represents a CipherGate contract and its private state.
 */
export type CipherGateContract = Contract<CipherGatePrivateState, Witnesses<CipherGatePrivateState>>;

/**
 * The keys of the circuits exported from {@link CipherGateContract}.
 */
export type CipherGateCircuitKeys = Exclude<keyof CipherGateContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link CipherGateContract}.
 */
export type CipherGateProviders = MidnightProviders<CipherGateCircuitKeys, PrivateStateId, CipherGatePrivateState>;

/**
 * A {@link CipherGateContract} that has been deployed to the network.
 */
export type DeployedCipherGateContract = FoundContract<CipherGateContract>;

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type CipherGateDerivedState = {
  readonly state: State;
  readonly owner: string;
  readonly authorizedRecipient: string;
  readonly encryptedPayload: string | undefined;
  readonly encryptedSharingKey: string | undefined;
  readonly accessCount: bigint;

  /**
   * True if the current user is the owner of the vault.
   */
  readonly isOwner: boolean;

  /**
   * True if the current user is the authorized recipient.
   */
  readonly isRecipient: boolean;
};

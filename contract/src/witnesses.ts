// CipherGate Witnesses
// SPDX-License-Identifier: Apache-2.0

import { Ledger } from "./managed/ciphergate/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

export type CipherGatePrivateState = {
  readonly secretKey: Uint8Array;
};

export const createCipherGatePrivateState = (secretKey: Uint8Array) => ({
  secretKey,
});

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, CipherGatePrivateState>): [
    CipherGatePrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};

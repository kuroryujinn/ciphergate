// CipherGate Contract Entrypoint
// SPDX-License-Identifier: Apache-2.0

import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/ciphergate/contract/index.js";
export * from "./witnesses.js";

import * as CompiledCipherGateContract from "./managed/ciphergate/contract/index.js";
import * as Witnesses from "./witnesses.js";

export const CompiledCipherGateContractContract = CompiledContract.make<
  CompiledCipherGateContract.Contract<Witnesses.CipherGatePrivateState>
>(
  "Contract",
  CompiledCipherGateContract.Contract<Witnesses.CipherGatePrivateState>,
).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/ciphergate"),
);

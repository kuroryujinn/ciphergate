// CipherGate Contract Simulator for Tests
// SPDX-License-Identifier: Apache-2.0

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../managed/ciphergate/contract/index.js";
import { type CipherGatePrivateState, witnesses } from "../witnesses.js";

export class CipherGateSimulator {
  readonly contract: Contract<CipherGatePrivateState>;
  circuitContext: CircuitContext<CipherGatePrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<CipherGatePrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({ secretKey }, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public switchUser(secretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = { secretKey };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): CipherGatePrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public uploadVault(payload: string): Ledger {
    this.circuitContext = this.contract.impureCircuits.uploadVault(
      this.circuitContext,
      payload,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public shareVault(recipient: Uint8Array, encSharingKey: string): Ledger {
    this.circuitContext = this.contract.impureCircuits.shareVault(
      this.circuitContext,
      recipient,
      encSharingKey,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public accessVault(): string {
    const result = this.contract.impureCircuits.accessVault(
      this.circuitContext,
    );
    this.circuitContext = result.context;
    return result.result;
  }

  public revokeVault(): Ledger {
    this.circuitContext = this.contract.impureCircuits.revokeVault(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public publicKey(): Uint8Array {
    return this.contract.circuits.publicKey(
      this.circuitContext,
      this.getPrivateState().secretKey,
    ).result;
  }
}

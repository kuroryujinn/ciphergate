import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum State { VACANT = 0, PRIVATE = 1, SHARED = 2 }

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  uploadVault(context: __compactRuntime.CircuitContext<PS>, payload_0: string): __compactRuntime.CircuitResults<PS, []>;
  shareVault(context: __compactRuntime.CircuitContext<PS>,
             recipient_0: Uint8Array,
             encSharingKey_0: string): __compactRuntime.CircuitResults<PS, []>;
  accessVault(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  revokeVault(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  uploadVault(context: __compactRuntime.CircuitContext<PS>, payload_0: string): __compactRuntime.CircuitResults<PS, []>;
  shareVault(context: __compactRuntime.CircuitContext<PS>,
             recipient_0: Uint8Array,
             encSharingKey_0: string): __compactRuntime.CircuitResults<PS, []>;
  accessVault(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  revokeVault(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  publicKey(sk_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  uploadVault(context: __compactRuntime.CircuitContext<PS>, payload_0: string): __compactRuntime.CircuitResults<PS, []>;
  shareVault(context: __compactRuntime.CircuitContext<PS>,
             recipient_0: Uint8Array,
             encSharingKey_0: string): __compactRuntime.CircuitResults<PS, []>;
  accessVault(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  revokeVault(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  publicKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly state: State;
  readonly owner: Uint8Array;
  readonly authorizedRecipient: Uint8Array;
  readonly encryptedPayload: { is_some: boolean, value: string };
  readonly encryptedSharingKey: { is_some: boolean, value: string };
  readonly accessCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;

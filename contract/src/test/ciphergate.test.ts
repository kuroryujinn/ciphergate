// CipherGate Contract Tests
// SPDX-License-Identifier: Apache-2.0

import { CipherGateSimulator } from "./ciphergate-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { State } from "../managed/ciphergate/contract/index.js";

setNetworkId("undeployed");

describe("CipherGate smart contract", () => {
  it("generates initial ledger state deterministically", () => {
    const key = randomBytes(32);
    const simulator0 = new CipherGateSimulator(key);
    const simulator1 = new CipherGateSimulator(key);
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  it("properly initializes ledger state and private state", () => {
    const key = randomBytes(32);
    const simulator = new CipherGateSimulator(key);
    const initialLedgerState = simulator.getLedger();
    expect(initialLedgerState.accessCount).toEqual(0n);
    expect(initialLedgerState.encryptedPayload.is_some).toEqual(false);
    expect(initialLedgerState.encryptedSharingKey.is_some).toEqual(false);
    expect(initialLedgerState.owner).toEqual(new Uint8Array(32));
    expect(initialLedgerState.state).toEqual(State.VACANT);
    expect(simulator.getPrivateState()).toEqual({ secretKey: key });
  });

  it("lets the owner upload an encrypted vault payload", () => {
    const simulator = new CipherGateSimulator(randomBytes(32));
    const payload = "encrypted:QmHash123abc";
    simulator.uploadVault(payload);
    const ledgerState = simulator.getLedger();
    expect(ledgerState.encryptedPayload.is_some).toEqual(true);
    expect(ledgerState.encryptedPayload.value).toEqual(payload);
    expect(ledgerState.owner).toEqual(simulator.publicKey());
    expect(ledgerState.state).toEqual(State.PRIVATE);
  });

  it("lets the owner share the vault with a recipient", () => {
    const ownerKey = randomBytes(32);
    const recipientKey = randomBytes(32);
    const simulator = new CipherGateSimulator(ownerKey);
    simulator.uploadVault("encrypted:file-metadata");
    const recipientSimulator = new CipherGateSimulator(recipientKey);
    const recipientPk = recipientSimulator.publicKey();
    const encSharingKey = "encrypted-symmetric-key-for-recipient";
    simulator.shareVault(recipientPk, encSharingKey);
    const ledgerState = simulator.getLedger();
    expect(ledgerState.authorizedRecipient).toEqual(recipientPk);
    expect(ledgerState.encryptedSharingKey.is_some).toEqual(true);
    expect(ledgerState.encryptedSharingKey.value).toEqual(encSharingKey);
    expect(ledgerState.state).toEqual(State.SHARED);
  });

  it("lets authorized recipient access the sharing key and increments audit count", () => {
    const ownerKey = randomBytes(32);
    const recipientKey = randomBytes(32);
    const simulator = new CipherGateSimulator(ownerKey);
    simulator.uploadVault("encrypted:confidential-report.pdf");
    const recipientPk = new CipherGateSimulator(recipientKey).publicKey();
    const encSharingKey = "encrypted-symmetric-key";
    simulator.shareVault(recipientPk, encSharingKey);
    simulator.switchUser(recipientKey);
    const result = simulator.accessVault();
    expect(result).toEqual(encSharingKey);
    expect(simulator.getLedger().accessCount).toEqual(1n);
  });

  it("lets the owner revoke sharing access", () => {
    const ownerKey = randomBytes(32);
    const recipientKey = randomBytes(32);
    const ownerSimulator = new CipherGateSimulator(ownerKey);
    ownerSimulator.uploadVault("encrypted:file");
    const recipientSimulator = new CipherGateSimulator(recipientKey);
    ownerSimulator.shareVault(recipientSimulator.publicKey(), "enc-key");
    ownerSimulator.revokeVault();
    const ledgerState = ownerSimulator.getLedger();
    expect(ledgerState.encryptedSharingKey.is_some).toEqual(false);
    expect(ledgerState.state).toEqual(State.PRIVATE);
  });

  it("does not allow uploading to an existing vault", () => {
    const simulator = new CipherGateSimulator(randomBytes(32));
    simulator.uploadVault("encrypted:first-file");
    expect(() => simulator.uploadVault("encrypted:second-file")).toThrow(
      "failed assert: Vault already exists",
    );
  });

  it("does not allow unauthorized users to access the vault", () => {
    const ownerKey = randomBytes(32);
    const recipientKey = randomBytes(32);
    const bystanderKey = randomBytes(32);
    const simulator = new CipherGateSimulator(ownerKey);
    simulator.uploadVault("encrypted:secret");
    const recipientPk = new CipherGateSimulator(recipientKey).publicKey();
    simulator.shareVault(recipientPk, "enc-key");
    simulator.switchUser(bystanderKey);
    expect(() => simulator.accessVault()).toThrow(
      "failed assert: Caller is not authorized to access this vault",
    );
  });

  it("does not allow non-owners to share the vault", () => {
    const ownerKey = randomBytes(32);
    const attackerKey = randomBytes(32);
    const simulator = new CipherGateSimulator(ownerKey);
    simulator.uploadVault("encrypted:secret");
    simulator.switchUser(attackerKey);
    expect(() =>
      simulator.shareVault(simulator.publicKey(), "enc-key"),
    ).toThrow("failed assert: Only vault owner can share");
  });
});

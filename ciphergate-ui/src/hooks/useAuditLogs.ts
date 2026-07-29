// CipherGate Audit Log Hook — Simulated Real-time Event Source
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  circuit: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  detail: string;
}

interface SeedEntry {
  timestamp: string;
  action: string;
  circuit: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  detail: string;
}

const seedData: SeedEntry[] = [
  {
    timestamp: '14:32:18',
    action: 'VAULT_ACCESS',
    circuit: 'accessVault',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'Vault #42 accessed successfully. Proof verified on-chain.',
  },
  {
    timestamp: '14:32:15',
    action: 'VAULT_UPLOAD',
    circuit: 'uploadVault',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'New payload encrypted and stored. Encryption: AES-256-GCM.',
  },
  {
    timestamp: '14:32:12',
    action: 'CIRCUIT_VERIFY',
    circuit: 'shareVault',
    actor: 'system',
    status: 'success',
    detail: 'shareVault circuit verified. Prover key match confirmed.',
  },
  {
    timestamp: '14:32:08',
    action: 'VAULT_SHARE',
    circuit: 'shareVault',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'Vault #42 shared with recipient. Sharing key encrypted.',
  },
  {
    timestamp: '14:32:05',
    action: 'MEMORY_WARN',
    circuit: 'proof-server',
    actor: 'system',
    status: 'warning',
    detail: 'Proof server memory utilization at 85%. Threshold: 80%.',
  },
  {
    timestamp: '14:32:02',
    action: 'CONNECTION',
    circuit: 'rpc',
    actor: 'system',
    status: 'success',
    detail: 'RPC session established. Endpoint: preprod.midnight.network.',
  },
  {
    timestamp: '14:32:01',
    action: 'WALLET_AUTH',
    circuit: 'wallet',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'Wallet authenticated. Network: Midnight Preview.',
  },
];

// ─── Random event generators ─────────────────────────────────────────────────

const actions: {
  action: string;
  circuits: string[];
  actors: string[];
  statusWeights: { status: 'success' | 'warning' | 'error'; weight: number }[];
  detailTemplates: string[];
}[] = [
  {
    action: 'VAULT_ACCESS',
    circuits: ['accessVault'],
    actors: ['0x1a2b...9f8e', '0x3c4d...e0f1', '0x5e6f...a2b3'],
    statusWeights: [
      { status: 'success', weight: 85 },
      { status: 'warning', weight: 10 },
      { status: 'error', weight: 5 },
    ],
    detailTemplates: [
      'Vault #{vault} accessed successfully. Proof verified on-chain.',
      'Vault #{vault} access attempt. ZK proof validated.',
      'Vault #{vault} — access granted. Recipient authorized.',
    ],
  },
  {
    action: 'VAULT_UPLOAD',
    circuits: ['uploadVault'],
    actors: ['0x1a2b...9f8e'],
    statusWeights: [
      { status: 'success', weight: 90 },
      { status: 'warning', weight: 8 },
      { status: 'error', weight: 2 },
    ],
    detailTemplates: [
      'New payload encrypted and stored. Encryption: AES-256-GCM.',
      'Payload #{vault} uploaded. {size} KB encrypted blob.',
      'Vault payload stored. Sharing key generated.',
    ],
  },
  {
    action: 'VAULT_SHARE',
    circuits: ['shareVault'],
    actors: ['0x1a2b...9f8e'],
    statusWeights: [
      { status: 'success', weight: 88 },
      { status: 'warning', weight: 10 },
      { status: 'error', weight: 2 },
    ],
    detailTemplates: [
      'Vault #{vault} shared with recipient. Sharing key encrypted.',
      'Recipient access granted to vault #{vault}. Key wrapped.',
      'Vault #{vault} — sharing permission applied on-chain.',
    ],
  },
  {
    action: 'CIRCUIT_VERIFY',
    circuits: ['uploadVault', 'shareVault', 'accessVault', 'revokeVault'],
    actors: ['system'],
    statusWeights: [
      { status: 'success', weight: 95 },
      { status: 'warning', weight: 4 },
      { status: 'error', weight: 1 },
    ],
    detailTemplates: [
      '{circuit} circuit verified. Prover key match confirmed.',
      '{circuit} — circuit parameters validated.',
      '{circuit} proof key integrity check passed.',
    ],
  },
  {
    action: 'VAULT_REVOKE',
    circuits: ['revokeVault'],
    actors: ['0x1a2b...9f8e'],
    statusWeights: [
      { status: 'success', weight: 92 },
      { status: 'warning', weight: 6 },
      { status: 'error', weight: 2 },
    ],
    detailTemplates: [
      'Vault #{vault} access revoked. Recipient removed.',
      'Sharing key invalidated for vault #{vault}.',
      'Vault #{vault} — revoke transaction confirmed on ledger.',
    ],
  },
  {
    action: 'MEMORY_WARN',
    circuits: ['proof-server'],
    actors: ['system'],
    statusWeights: [
      { status: 'warning', weight: 70 },
      { status: 'success', weight: 20 },
      { status: 'error', weight: 10 },
    ],
    detailTemplates: [
      'Proof server memory utilization at {pct}%. Threshold: 80%.',
      'Memory pressure on proof server: {pct}% used.',
      'Proof server resource check: {pct}% memory allocated.',
    ],
  },
  {
    action: 'CONNECTION',
    circuits: ['rpc', 'indexer', 'proof-server'],
    actors: ['system'],
    statusWeights: [
      { status: 'success', weight: 80 },
      { status: 'warning', weight: 12 },
      { status: 'error', weight: 8 },
    ],
    detailTemplates: [
      'RPC session established. Endpoint: preprod.midnight.network.',
      'Indexer connection status: {pct}ms latency.',
      'Proof server handshake complete. Protocol: gRPC.',
    ],
  },
  {
    action: 'WALLET_AUTH',
    circuits: ['wallet'],
    actors: ['0x1a2b...9f8e', '0x3c4d...e0f1'],
    statusWeights: [
      { status: 'success', weight: 85 },
      { status: 'warning', weight: 10 },
      { status: 'error', weight: 5 },
    ],
    detailTemplates: [
      'Wallet authenticated. Network: Midnight Preview.',
      'Wallet re-authenticated. Session token refreshed.',
      'Wallet authorization — signature verified.',
    ],
  },
];

let entryCounter = 0;

const pickWeighted = <T extends { weight: number }>(items: T[]): T => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
};

const pickRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const randBetween = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEntry = (baseTime: Date): AuditLogEntry => {
  const actionDef = pickRandom(actions);
  const circuit = pickRandom(actionDef.circuits);
  const actor = pickRandom(actionDef.actors);
  const status = pickWeighted(actionDef.statusWeights).status;
  const template = pickRandom(actionDef.detailTemplates);
  const vaultNum = randBetween(1, 99);
  const pct = randBetween(72, 96);
  const size = randBetween(4, 64);

  const detail = template
    .replace('{vault}', String(vaultNum))
    .replace('{circuit}', circuit)
    .replace('{pct}', String(pct))
    .replace('{size}', String(size));

  const hh = String(baseTime.getHours()).padStart(2, '0');
  const mm = String(baseTime.getMinutes()).padStart(2, '0');
  const ss = String(baseTime.getSeconds()).padStart(2, '0');

  entryCounter += 1;

  return {
    id: `evt-${Date.now()}-${entryCounter}`,
    timestamp: `${hh}:${mm}:${ss}`,
    action: actionDef.action,
    circuit,
    actor,
    status,
    detail,
  };
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseAuditLogsOptions {
  /** Interval in ms between new log entries. Default 3000. */
  intervalMs?: number;
  /** Maximum number of log entries to keep. Default 100. */
  maxEntries?: number;
}

export interface UseAuditLogsResult {
  /** Current list of log entries, newest first. */
  entries: AuditLogEntry[];
  /** Total count of entries generated since mount (including seed). */
  totalCount: number;
  /** Whether the live feed is active. */
  isActive: boolean;
  /** Pause the live feed. */
  pause: () => void;
  /** Resume the live feed. */
  resume: () => void;
  /** Clear all entries and reset to a fresh set of seed entries. */
  clear: () => void;
}

const buildSeedEntries = (): AuditLogEntry[] =>
  seedData.map((s, i) => ({
    ...s,
    id: `seed-${i}`,
  }));

export const useAuditLogs = (options?: UseAuditLogsOptions): UseAuditLogsResult => {
  const { intervalMs = 3000, maxEntries = 100 } = options ?? {};
  const [entries, setEntries] = useState<AuditLogEntry[]>(buildSeedEntries);
  const [totalCount, setTotalCount] = useState(seedData.length);
  const [isActive, setIsActive] = useState(true);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isActiveRef.current) return;

      const now = new Date();
      // Generate 1-3 entries per tick
      const count = Math.random() < 0.3 ? 2 : 1;
      const newEntries: AuditLogEntry[] = [];
      for (let i = 0; i < count; i++) {
        // Stagger timestamps slightly for batch entries
        const ts = new Date(now.getTime() - (count - i - 1) * 300);
        newEntries.push(generateEntry(ts));
      }

      setEntries((prev) => {
        const combined = [...newEntries, ...prev];
        return combined.slice(0, maxEntries);
      });
      setTotalCount((prev) => prev + count);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, maxEntries]);

  const pause = useCallback(() => setIsActive(false), []);
  const resume = useCallback(() => setIsActive(true), []);
  const clear = useCallback(() => {
    setEntries(buildSeedEntries());
    setTotalCount(seedData.length);
  }, []);

  return { entries, totalCount, isActive, pause, resume, clear };
};

// CipherGate Audit Logs Page — Security Audit Trail Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import { palette, hardwareStyles } from '../config/theme';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  circuit: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  detail: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: '14:32:18',
    action: 'VAULT_ACCESS',
    circuit: 'accessVault',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'Vault #42 accessed successfully. Proof verified on-chain.',
  },
  {
    id: '2',
    timestamp: '14:32:15',
    action: 'VAULT_UPLOAD',
    circuit: 'uploadVault',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'New payload encrypted and stored. Encryption: AES-256-GCM.',
  },
  {
    id: '3',
    timestamp: '14:32:12',
    action: 'CIRCUIT_VERIFY',
    circuit: 'shareVault',
    actor: 'system',
    status: 'success',
    detail: 'shareVault circuit verified. Prover key match confirmed.',
  },
  {
    id: '4',
    timestamp: '14:32:08',
    action: 'VAULT_SHARE',
    circuit: 'shareVault',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'Vault #42 shared with recipient. Sharing key encrypted.',
  },
  {
    id: '5',
    timestamp: '14:32:05',
    action: 'MEMORY_WARN',
    circuit: 'proof-server',
    actor: 'system',
    status: 'warning',
    detail: 'Proof server memory utilization at 85%. Threshold: 80%.',
  },
  {
    id: '6',
    timestamp: '14:32:02',
    action: 'CONNECTION',
    circuit: 'rpc',
    actor: 'system',
    status: 'success',
    detail: 'RPC session established. Endpoint: preprod.midnight.network.',
  },
  {
    id: '7',
    timestamp: '14:32:01',
    action: 'WALLET_AUTH',
    circuit: 'wallet',
    actor: '0x1a2b...9f8e',
    status: 'success',
    detail: 'Wallet authenticated. Network: Midnight Preview.',
  },
];

const statusConfig = {
  success: { color: palette.led.green, label: 'Success' },
  warning: { color: palette.led.amber, label: 'Warning' },
  error: { color: palette.led.red, label: 'Error' },
};

export const AuditLogsPage: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      maxWidth: 1200,
      mx: 'auto',
      animation: 'slideInUp 0.3s ease-out',
    }}
  >
    {/* Page Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 1,
          background: alpha(palette.accent.primary, 0.1),
          border: `1px solid ${alpha(palette.accent.primary, 0.15)}`,
        }}
      >
        <HistoryIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: palette.text.primary,
          }}
        >
          Audit Logs
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6875rem',
            color: palette.text.tertiary,
            letterSpacing: '0.04em',
          }}
        >
          Security audit trail and event history
        </Typography>
      </Box>
    </Box>

    {/* Audit Log Table */}
    <Box
      sx={{
        background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.4)} 0%, transparent 100%)`,
        border: `1px solid ${alpha('#fff', 0.04)}`,
        borderRadius: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(palette.accent.primary, 0.15)}, transparent)`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 1,
            background: alpha(palette.accent.primary, 0.08),
            border: `1px solid ${alpha(palette.accent.primary, 0.12)}`,
          }}
        >
          <HistoryIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
        </Box>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: palette.text.primary,
          }}
        >
          Event Log
        </Typography>
        <Chip
          label={`${auditLogs.length} Events`}
          size="small"
          sx={{
            ml: 1,
            bgcolor: alpha(palette.accent.primary, 0.06),
            color: alpha(palette.accent.primary, 0.7),
            borderColor: alpha(palette.accent.primary, 0.1),
            height: 18,
            '& .MuiChip-label': { fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.04em' },
          }}
        />
      </Box>

      {/* Log entries */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ ...hardwareStyles.oledDisplay }}>
          {auditLogs.map((entry) => {
            const cfg = statusConfig[entry.status];
            return (
              <Box
                key={entry.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha('#fff', 0.02),
                  },
                  borderBottom: `1px solid ${alpha('#fff', 0.03)}`,
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                {/* Status LED */}
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    minWidth: 6,
                    borderRadius: '50%',
                    backgroundColor: cfg.color,
                    boxShadow: `0 0 3px ${cfg.color}`,
                    mt: 0.5,
                  }}
                />

                {/* Timestamp */}
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.5rem',
                    color: alpha('#fff', 0.25),
                    minWidth: 56,
                    mt: 0.25,
                  }}
                >
                  {entry.timestamp}
                </Typography>

                {/* Action */}
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.5625rem',
                    fontWeight: 600,
                    color: alpha(palette.accent.primary, 0.8),
                    minWidth: 110,
                    letterSpacing: '0.02em',
                  }}
                >
                  [{entry.action}]
                </Typography>

                {/* Detail */}
                <Typography
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.5625rem',
                    color: alpha('#fff', 0.55),
                    flex: 1,
                    lineHeight: 1.5,
                  }}
                >
                  {entry.detail}
                </Typography>

                {/* Circuit tag */}
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.15,
                    borderRadius: 1,
                    background: alpha(palette.accent.primary, 0.06),
                    border: `1px solid ${alpha(palette.accent.primary, 0.08)}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.45rem',
                      fontWeight: 600,
                      color: alpha(palette.accent.primary, 0.5),
                      letterSpacing: '0.04em',
                    }}
                  >
                    {entry.circuit}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  </Box>
);

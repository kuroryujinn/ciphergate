// CipherGate Main Dashboard — Modular Hardware Rack Layout
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { HeroDashboard } from './HeroDashboard';
import { ProofEngine } from './ProofEngine';
import { WalletCard } from './WalletCard';
import { ContractModule } from './ContractModule';
import { TransactionTimeline } from './TransactionTimeline';
import { SecurityStatus } from './SecurityStatus';
import { palette } from '../../config/theme';

export const Dashboard: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        maxWidth: 1400,
        mx: 'auto',
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      {/* Hero Section — Full Width */}
      <HeroDashboard />

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <ProofEngine />
          <SecurityStatus />
        </Box>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <WalletCard />
          <ContractModule />
        </Box>
      </Box>

      {/* Transaction Timeline — Full Width */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <TransactionTimeline />
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
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                <Typography sx={{ fontSize: 12, color: alpha(palette.accent.primary, 0.7), fontWeight: 700 }}>
                  {"</>"}
                </Typography>
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
                System Console
              </Typography>
            </Box>

            {/* Console output */}
            <Box
              sx={{
                ...{
                  background: alpha('#000', 0.4),
                  border: `1px solid ${alpha('#fff', 0.03)}`,
                  borderRadius: 1,
                  p: 1.5,
                  fontFamily: '"JetBrains Mono", monospace',
                },
              }}
            >
              {[
                { time: '14:32:01', level: 'INFO', msg: 'Wallet connected: 0x1a2b...9f8e', color: palette.accent.info },
                { time: '14:32:02', level: 'INFO', msg: 'Proof server handshake complete', color: palette.accent.info },
                { time: '14:32:05', level: 'ZK', msg: 'uploadVault circuit verified', color: palette.accent.success },
                { time: '14:32:08', level: 'ZK', msg: 'shareVault circuit verified', color: palette.accent.success },
                { time: '14:32:12', level: 'INFO', msg: 'Access audit logged to ledger', color: palette.accent.info },
                { time: '14:32:15', level: 'WARN', msg: 'Proof server: 85% memory utilization', color: palette.accent.warning },
                { time: '14:32:18', level: 'INFO', msg: 'All circuits nominal. System secure.', color: palette.accent.success },
              ].map((line, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.5625rem',
                    lineHeight: 1.8,
                    color: alpha('#fff', 0.4),
                    '& .level': { color: line.color, fontWeight: 600 },
                    '& .msg': { color: alpha('#fff', 0.65) },
                  }}
                >
                  <span style={{ color: alpha('#fff', 0.2) }}>{line.time}</span>
                  {' '}
                  <span className="level">[{line.level}]</span>
                  {' '}
                  <span className="msg">{line.msg}</span>
                </Typography>
              ))}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 1,
                  pt: 1,
                  borderTop: `1px solid ${alpha('#fff', 0.03)}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: palette.accent.success,
                    boxShadow: `0 0 4px ${palette.accent.success}`,
                    animation: 'ledPulse 2s ease-in-out infinite',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.5625rem',
                    color: alpha(palette.accent.success, 0.6),
                  }}
                >
                  Monitoring...
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

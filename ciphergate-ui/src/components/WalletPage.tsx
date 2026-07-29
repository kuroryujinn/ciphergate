// CipherGate Wallet Page — Secure Wallet Management Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { WalletCard } from './Dashboard/WalletCard';
import { SecurityStatus } from './Dashboard/SecurityStatus';
import { palette } from '../config/theme';

export const WalletPage: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      maxWidth: 1000,
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
        <WalletIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
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
          Wallet
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6875rem',
            color: palette.text.tertiary,
            letterSpacing: '0.04em',
          }}
        >
          Manage your wallet connection and account details
        </Typography>
      </Box>
    </Box>

    {/* Wallet Card — Full Width */}
    <WalletCard />

    {/* System Diagnostics */}
    <SecurityStatus />
  </Box>
);

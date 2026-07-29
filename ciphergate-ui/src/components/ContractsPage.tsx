// CipherGate Contracts Page — Smart Contract Management Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import { ContractModule } from './Dashboard/ContractModule';
import { TransactionTimeline } from './Dashboard/TransactionTimeline';
import { palette } from '../config/theme';

export const ContractsPage: React.FC = () => (
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
        <DescriptionIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
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
          Contracts
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6875rem',
            color: palette.text.tertiary,
            letterSpacing: '0.04em',
          }}
        >
          Deployed vault circuits and contract management
        </Typography>
      </Box>
    </Box>

    {/* Two-column layout */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2.5,
      }}
    >
      <ContractModule />
      <TransactionTimeline />
    </Box>
  </Box>
);

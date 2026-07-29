// CipherGate Dashboard Page — Main Vault Security Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import { Dashboard } from './Dashboard/Dashboard';
import { palette } from '../config/theme';

export const DashboardPage: React.FC = () => (
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
        <DashboardIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
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
          Dashboard
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6875rem',
            color: palette.text.tertiary,
            letterSpacing: '0.04em',
          }}
        >
          Secure vault console overview and system status
        </Typography>
      </Box>
    </Box>

    {/* Main Dashboard Content */}
    <Dashboard />
  </Box>
);

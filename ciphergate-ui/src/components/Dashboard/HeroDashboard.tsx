// CipherGate Hero Dashboard — Secure Vault Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FolderIcon from '@mui/icons-material/FolderOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import SignalIcon from '@mui/icons-material/SignalCellularAltOutlined';
import { palette, hardwareStyles } from '../../config/theme';
import { HeroDashboardSkeleton } from './LoadingSkeleton';
import { ErrorPanel } from './ErrorPanel';
import type { ErrorPanelProps } from './ErrorPanel';

interface OLEDDisplayProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
}

const OLEDDisplay: React.FC<OLEDDisplayProps> = ({ label, value, icon, accent = palette.accent.primary }) => (
  <Box sx={{ ...hardwareStyles.oledDisplay, minWidth: 160 }}>
    {icon && (
      <Box sx={{ color: alpha(accent, 0.4), mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {icon}
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.5625rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: alpha(accent, 0.5),
          }}
        >
          {label}
        </Typography>
      </Box>
    )}
    {!icon && (
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.5625rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: alpha(accent, 0.5),
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
    )}
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: accent,
        letterSpacing: '0.02em',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export interface HeroDashboardProps {
  isLoading?: boolean;
  error?: ErrorPanelProps | null;
}

export const HeroDashboard: React.FC<HeroDashboardProps> = ({ isLoading, error }) => {
  if (isLoading) return <HeroDashboardSkeleton />;
  if (error) return <ErrorPanel {...error} />;
  return (
    <Box
      sx={{
        background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.4)} 0%, transparent 100%)`,
        border: `1px solid ${alpha('#fff', 0.04)}`,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
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
      {/* Top engraved label */}
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
          <ShieldIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
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
          Vault Security Console
        </Typography>
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: 10, color: `${palette.accent.success} !important` }} />}
          label="All Systems Nominal"
          size="small"
          sx={{
            ml: 1,
            bgcolor: alpha(palette.accent.success, 0.06),
            color: alpha(palette.accent.success, 0.9),
            borderColor: alpha(palette.accent.success, 0.12),
            height: 20,
            '& .MuiChip-label': { fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.04em' },
          }}
        />
      </Box>

      {/* OLED Display Grid */}
      <Box
        sx={{
          px: 3,
          pb: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1.5,
        }}
      >
        <OLEDDisplay
          label="Wallet Connection"
          value="0x1a2b...9f8e"
          icon={<WalletIcon sx={{ fontSize: 12 }} />}
          accent={palette.accent.success}
        />
        <OLEDDisplay
          label="Current Balance"
          value="1,234.56 MID"
          icon={<LockIcon sx={{ fontSize: 12 }} />}
          accent={palette.accent.primary}
        />
        <OLEDDisplay
          label="Network"
          value="Midnight Preview"
          icon={<SignalIcon sx={{ fontSize: 12 }} />}
          accent={palette.accent.info}
        />
        <OLEDDisplay
          label="Privacy Level"
          value="Zero-Knowledge"
          icon={<ShieldIcon sx={{ fontSize: 12 }} />}
          accent={palette.accent.success}
        />
        <OLEDDisplay
          label="Active Contracts"
          value="4 Deployed"
          icon={<FolderIcon sx={{ fontSize: 12 }} />}
          accent={palette.accent.warning}
        />
        <OLEDDisplay
          label="System Integrity"
          value="Verified"
          icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
          accent={palette.accent.success}
        />
      </Box>
    </Box>
  );
};

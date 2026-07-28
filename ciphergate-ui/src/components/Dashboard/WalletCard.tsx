// CipherGate Wallet Card — Physical Encrypted Access Badge
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FingerprintIcon from '@mui/icons-material/FingerprintOutlined';
import SignalIcon from '@mui/icons-material/SignalCellularAltOutlined';
import { palette, hardwareStyles } from '../../config/theme';

export interface WalletCardProps {
  address?: string;
  network?: string;
  balance?: string;
  isConnected?: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  address = '0x1a2b...9f8e',
  network = 'Midnight Preview',
  balance = '1,234.56 MID',
  isConnected = true,
}) => {
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
          <WalletIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
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
          Wallet Access Badge
        </Typography>
      </Box>

      {/* OLED Display */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            ...hardwareStyles.oledDisplay,
            border: `1px solid ${alpha(palette.accent.primary, 0.1)}`,
          }}
        >
          {/* Connection status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: isConnected ? palette.led.green : palette.led.off,
                boxShadow: isConnected ? `0 0 3px ${palette.led.green}` : 'none',
                animation: isConnected ? 'ledPulse 2s ease-in-out infinite' : 'none',
              }}
            />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.5rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isConnected ? alpha(palette.accent.success, 0.7) : palette.text.disabled,
                ml: 'auto',
              }}
            >
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Typography>
          </Box>

          {/* Wallet address */}
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.5625rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: alpha(palette.accent.primary, 0.5),
              mb: 0.25,
            }}
          >
            Wallet Address
          </Typography>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: palette.text.primary,
              letterSpacing: '0.02em',
              mb: 1.5,
            }}
          >
            {address}
          </Typography>

          {/* Balance and Network */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: alpha(palette.accent.success, 0.5),
                  mb: 0.25,
                }}
              >
                Balance
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: palette.accent.success,
                }}
              >
                {balance}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: alpha(palette.accent.info, 0.5),
                  mb: 0.25,
                }}
              >
                Network
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: palette.accent.info,
                }}
              >
                {network}
              </Typography>
            </Box>
          </Box>

          {/* Fingerprint verification */}
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: `1px solid ${alpha('#fff', 0.04)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FingerprintIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.4) }} />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.5rem',
                color: palette.text.tertiary,
                letterSpacing: '0.04em',
              }}
            >
              FINGERPRINT VERIFIED
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip
              label="SECURE"
              size="small"
              sx={{
                height: 16,
                bgcolor: alpha(palette.accent.success, 0.08),
                color: alpha(palette.accent.success, 0.8),
                borderColor: alpha(palette.accent.success, 0.12),
                '& .MuiChip-label': { fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.04em', px: 0.75 },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

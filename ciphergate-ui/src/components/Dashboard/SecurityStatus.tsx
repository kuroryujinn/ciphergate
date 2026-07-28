// CipherGate Security Status — Enterprise Diagnostics Panel
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import DnsIcon from '@mui/icons-material/DnsOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';
import RouterIcon from '@mui/icons-material/RouterOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHighOutlined';
import { palette, hardwareStyles } from '../../config/theme';

interface StatusItem {
  label: string;
  status: 'healthy' | 'warning' | 'error' | 'active';
  icon: React.ReactNode;
}

const statusItems: StatusItem[] = [
  { label: 'Proof Server', status: 'healthy', icon: <DnsIcon sx={{ fontSize: 14 }} /> },
  { label: 'Smart Contract', status: 'healthy', icon: <CodeIcon sx={{ fontSize: 14 }} /> },
  { label: 'RPC', status: 'healthy', icon: <RouterIcon sx={{ fontSize: 14 }} /> },
  { label: 'Wallet', status: 'active', icon: <WalletIcon sx={{ fontSize: 14 }} /> },
  { label: 'Encryption', status: 'healthy', icon: <LockIcon sx={{ fontSize: 14 }} /> },
  { label: 'ZK Circuit', status: 'active', icon: <AutoFixHighIcon sx={{ fontSize: 14 }} /> },
];

const statusConfig = {
  healthy: { color: palette.led.green, label: 'Healthy', bgAlpha: 0.06, borderAlpha: 0.12 },
  warning: { color: palette.led.amber, label: 'Warning', bgAlpha: 0.06, borderAlpha: 0.12 },
  error: { color: palette.led.red, label: 'Error', bgAlpha: 0.06, borderAlpha: 0.12 },
  active: { color: palette.led.blue, label: 'Active', bgAlpha: 0.06, borderAlpha: 0.12 },
};

export const SecurityStatus: React.FC = () => {
  return (
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
          <SecurityIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
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
          System Diagnostics
        </Typography>
      </Box>

      {/* Status Grid */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Box
          sx={{
            ...hardwareStyles.oledDisplay,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {statusItems.map((item) => {
            const cfg = statusConfig[item.status];
            const isLit = item.status !== 'error';

            return (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1,
                  background: item.status === 'active' ? alpha(cfg.color, 0.04) : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha('#fff', 0.02),
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    borderRadius: 1,
                    background: alpha(cfg.color, 0.06),
                    border: `1px solid ${alpha(cfg.color, 0.1)}`,
                    color: alpha(cfg.color, 0.7),
                  }}
                >
                  {item.icon}
                </Box>

                {/* Label */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: isLit ? palette.text.secondary : palette.text.disabled,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                {/* LED indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: isLit ? cfg.color : palette.led.off,
                      boxShadow: isLit ? `0 0 4px ${cfg.color}` : 'none',
                      animation: item.status === 'active' ? 'ledPulse 1.5s ease-in-out infinite' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.5rem',
                      fontWeight: 600,
                      color: isLit ? cfg.color : palette.text.disabled,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cfg.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* System integrity footer */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: `1px solid ${alpha('#fff', 0.04)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.5rem',
              color: palette.text.tertiary,
              letterSpacing: '0.04em',
            }}
          >
            ENCRYPTION: AES-256-GCM
          </Typography>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.5rem',
              color: palette.text.tertiary,
              letterSpacing: '0.04em',
            }}
          >
            ZK: GROTH16
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

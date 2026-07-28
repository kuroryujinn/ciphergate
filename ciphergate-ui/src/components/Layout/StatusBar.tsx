// CipherGate Status Bar — Enterprise Monitoring Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha, Tooltip } from '@mui/material';
import { palette } from '../../config/theme';

interface StatusItem {
  label: string;
  status: 'healthy' | 'warning' | 'error' | 'active' | 'offline';
}

const statusItems: StatusItem[] = [
  { label: 'RPC Connection', status: 'healthy' },
  { label: 'Proof Server', status: 'warning' },
  { label: 'Wallet Connection', status: 'active' },
  { label: 'Contract Status', status: 'healthy' },
  { label: 'System Uptime', status: 'active' },
  { label: 'Encryption', status: 'healthy' },
];

const statusConfig = {
  healthy: { color: palette.led.green, text: 'Healthy' },
  warning: { color: palette.led.amber, text: 'Warning' },
  error: { color: palette.led.red, text: 'Error' },
  active: { color: palette.led.blue, text: 'Active' },
  offline: { color: palette.led.off, text: 'Offline' },
};

const StatusLED: React.FC<{ status: StatusItem['status'] }> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: config.color,
        boxShadow: status !== 'offline' ? `0 0 3px ${config.color}` : 'none',
        animation: status !== 'offline' && status !== 'warning' ? 'ledPulse 3s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    />
  );
};

const StatusBar: React.FC = () => {
  return (
    <Box
      sx={{
        height: 32,
        minHeight: 32,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2.5,
        background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.9)} 0%, ${palette.bg.deepest} 100%)`,
        borderTop: `1px solid ${alpha('#fff', 0.04)}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.04)}, transparent)`,
        },
      }}
    >
      {statusItems.map((item) => {
        const config = statusConfig[item.status];

        return (
          <Tooltip key={item.label} title={`${item.label}: ${config.text}`} arrow placement="top">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                '&:hover': {
                  '& .status-label': {
                    color: palette.text.secondary,
                  },
                },
              }}
            >
              <StatusLED status={item.status} />
              <Typography
                className="status-label"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5625rem',
                  fontWeight: 500,
                  color: palette.text.tertiary,
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}

      <Box sx={{ flex: 1 }} />

      {/* Timestamp */}
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.5rem',
          color: palette.text.disabled,
          letterSpacing: '0.04em',
        }}
      >
        {new Date().toLocaleTimeString('en-US', { hour12: false })}
      </Typography>
    </Box>
  );
};

export default StatusBar;

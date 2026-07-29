// CipherGate Settings Page — System Configuration Console
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Typography, alpha, Switch } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import DnsIcon from '@mui/icons-material/DnsOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import { palette, hardwareStyles } from '../config/theme';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, description, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          background: alpha('#fff', 0.02),
        },
        borderBottom: `1px solid ${alpha('#fff', 0.03)}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          minWidth: 32,
          borderRadius: 1,
          background: alpha(palette.accent.primary, 0.06),
          border: `1px solid ${alpha(palette.accent.primary, 0.08)}`,
          color: alpha(palette.accent.primary, 0.6),
        }}
      >
        {icon}
      </Box>

      {/* Label & Description */}
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: palette.text.secondary,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.5625rem',
            color: palette.text.tertiary,
            mt: 0.25,
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Toggle */}
      <Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} size="small" />
    </Box>
  );
};

interface ConfigFieldProps {
  label: string;
  value: string;
}

const ConfigField: React.FC<ConfigFieldProps> = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2,
      py: 1.25,
      borderRadius: 1,
      '&:hover': { background: alpha('#fff', 0.02) },
      borderBottom: `1px solid ${alpha('#fff', 0.03)}`,
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.5625rem',
        fontWeight: 600,
        color: palette.text.tertiary,
        letterSpacing: '0.04em',
        minWidth: 160,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.5625rem',
        color: alpha(palette.accent.primary, 0.7),
      }}
    >
      {value}
    </Typography>
  </Box>
);

export const SettingsPage: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      maxWidth: 800,
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
        <SettingsIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
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
          Settings
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6875rem',
            color: palette.text.tertiary,
            letterSpacing: '0.04em',
          }}
        >
          System configuration and preferences
        </Typography>
      </Box>
    </Box>

    {/* Feature Toggles */}
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
      <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SecurityIcon sx={{ fontSize: 16, color: alpha(palette.accent.primary, 0.6) }} />
        <Typography
          sx={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: palette.text.primary,
          }}
        >
          Feature Toggles
        </Typography>
      </Box>
      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ ...hardwareStyles.oledDisplay, p: 0 }}>
          <SettingRow
            icon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            label="Automatic Proof Verification"
            description="Automatically verify ZK proofs after generation"
            defaultChecked
          />
          <SettingRow
            icon={<LockIcon sx={{ fontSize: 16 }} />}
            label="Encrypt Payloads at Rest"
            description="Always encrypt vault payloads before storing"
            defaultChecked
          />
          <SettingRow
            icon={<NotificationsIcon sx={{ fontSize: 16 }} />}
            label="Real-time Notifications"
            description="Push notifications for vault access events"
            defaultChecked
          />
          <SettingRow
            icon={<StorageIcon sx={{ fontSize: 16 }} />}
            label="Audit Trail Logging"
            description="Log all contract interactions to audit trail"
            defaultChecked
          />
          <SettingRow
            icon={<DnsIcon sx={{ fontSize: 16 }} />}
            label="Auto-reconnect to Proof Server"
            description="Automatically retry proof server connection on failure"
            defaultChecked
          />
        </Box>
      </Box>
    </Box>

    {/* Network Configuration */}
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
      <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DnsIcon sx={{ fontSize: 16, color: alpha(palette.accent.primary, 0.6) }} />
        <Typography
          sx={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: palette.text.primary,
          }}
        >
          Network Configuration
        </Typography>
      </Box>
      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ ...hardwareStyles.oledDisplay, p: 0 }}>
          <ConfigField label="RPC Endpoint" value="wss://rpc.preprod.midnight.network" />
          <ConfigField label="Indexer URL" value="https://indexer.preprod.midnight.network" />
          <ConfigField label="Proof Server" value="127.0.0.1:6300" />
          <ConfigField label="Network" value="Midnight Preprod" />
          <ConfigField label="Chain ID" value="0x1a2b3c4d" />
        </Box>
      </Box>
    </Box>
  </Box>
);

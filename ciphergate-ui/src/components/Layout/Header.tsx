// CipherGate Console Header — Hardware Control Panel
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  alpha,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Fade,
  Chip,
  Badge,
} from '@mui/material';
import LockIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import DisconnectIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import SignalIcon from '@mui/icons-material/SignalCellularAltOutlined';
import { useDeployedVaultContext } from '../../hooks';
import type { WalletConnectionState } from '../../contexts';
import { palette } from '../../config/theme';

export interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const SecurityIndicator: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1.25,
      py: 0.5,
      borderRadius: 1,
      background: alpha(palette.accent.success, 0.04),
      border: `1px solid ${alpha(palette.accent.success, 0.1)}`,
    }}
  >
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: palette.led.green,
        boxShadow: `0 0 4px ${palette.led.green}`,
        animation: 'ledPulse 2s ease-in-out infinite',
      }}
    />
    <SecurityIcon sx={{ fontSize: 12, color: alpha(palette.accent.success, 0.7) }} />
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.5625rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: alpha(palette.accent.success, 0.8),
      }}
    >
      SECURED
    </Typography>
  </Box>
);

const NetworkBadge: React.FC<{ networkId?: string }> = ({ networkId }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1.25,
      py: 0.5,
      borderRadius: 1,
      background: alpha(palette.accent.info, 0.04),
      border: `1px solid ${alpha(palette.accent.info, 0.1)}`,
    }}
  >
    <SignalIcon sx={{ fontSize: 12, color: alpha(palette.accent.info, 0.6) }} />
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.5625rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: alpha(palette.accent.info, 0.8),
      }}
    >
      {networkId ?? 'Not Connected'}
    </Typography>
  </Box>
);

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const vaultApiProvider = useDeployedVaultContext();
  const [walletState, setWalletState] = useState<WalletConnectionState>({ status: 'disconnected' });

  useEffect(() => {
    const subscription = vaultApiProvider.walletState$.subscribe(setWalletState);
    return () => subscription.unsubscribe();
  }, [vaultApiProvider]);

  const handleConnect = () => vaultApiProvider.connectWallet();
  const handleDisconnect = () => vaultApiProvider.disconnectWallet();
  const handleRetry = () => vaultApiProvider.retryConnection();

  const renderWalletBadge = () => {
    switch (walletState.status) {
      case 'network-ready':
      case 'connected':
        return (
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                background: alpha(palette.accent.success, 0.04),
                border: `1px solid ${alpha(palette.accent.success, 0.1)}`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: palette.led.green,
                  boxShadow: `0 0 4px ${palette.led.green}`,
                  animation: 'ledPulse 2s ease-in-out infinite',
                }}
              />
              <WalletIcon sx={{ fontSize: 12, color: alpha(palette.accent.success, 0.6) }} />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: alpha(palette.accent.success, 0.8),
                }}
              >
                WALLET ACTIVE
              </Typography>
              {walletState.status === 'connected' && walletState.error && (
                <Tooltip title={walletState.error} arrow>
                  <ErrorOutlineIcon sx={{ fontSize: 10, color: palette.accent.warning }} />
                </Tooltip>
              )}
              <Tooltip title="Disconnect" arrow>
                <IconButton
                  onClick={handleDisconnect}
                  size="small"
                  sx={{
                    width: 16,
                    height: 16,
                    color: alpha('#fff', 0.3),
                    '&:hover': { color: palette.accent.error },
                  }}
                >
                  <DisconnectIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        );

      case 'detecting':
      case 'connecting':
        return (
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                background: alpha(palette.accent.warning, 0.04),
                border: `1px solid ${alpha(palette.accent.warning, 0.1)}`,
              }}
            >
              <CircularProgress size={8} thickness={6} sx={{ color: palette.accent.warning }} />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: alpha(palette.accent.warning, 0.8),
                }}
              >
                {walletState.status === 'detecting' ? 'DETECTING...' : 'CONNECTING...'}
              </Typography>
            </Box>
          </Fade>
        );

      case 'connection-lost':
      case 'error':
        return (
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                background: alpha(palette.accent.error, 0.04),
                border: `1px solid ${alpha(palette.accent.error, 0.1)}`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: palette.led.red,
                }}
              />
              <ErrorOutlineIcon sx={{ fontSize: 10, color: palette.accent.error }} />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: alpha(palette.accent.error, 0.8),
                }}
              >
                CONNECTION ERROR
              </Typography>
              <Tooltip title="Retry" arrow>
                <IconButton
                  onClick={handleRetry}
                  size="small"
                  sx={{
                    width: 16,
                    height: 16,
                    color: alpha('#fff', 0.3),
                    '&:hover': { color: palette.accent.primary },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        );

      default:
        return (
          <Fade in timeout={300}>
            <Button
              onClick={handleConnect}
              size="small"
              variant="outlined"
              startIcon={<WalletIcon sx={{ fontSize: 12 }} />}
              sx={{
                borderRadius: 1,
                borderColor: alpha('#fff', 0.1),
                color: palette.text.secondary,
                fontSize: '0.5625rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                py: 0.5,
                px: 1.25,
                '&:hover': {
                  borderColor: alpha(palette.accent.primary, 0.3),
                  color: palette.text.primary,
                },
              }}
            >
              CONNECT WALLET
            </Button>
          </Fade>
        );
    }
  };

  return (
    <Box
      data-testid="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 52,
        minHeight: 52,
        px: 2,
        gap: 2,
        background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.95)} 0%, ${palette.bg.deepest} 100%)`,
        borderBottom: `1px solid ${alpha('#fff', 0.04)}`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 40,
          right: 40,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.04)}, transparent)`,
        },
      }}
    >
      {/* Logo section - simpler in header since sidebar has full branding */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 180,
        }}
      >
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: 1,
            background: `linear-gradient(135deg, ${alpha(palette.accent.primary, 0.12)} 0%, transparent 100%)`,
            border: `1px solid ${alpha(palette.accent.primary, 0.12)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockIcon sx={{ fontSize: 12, color: alpha(palette.accent.primary, 0.6) }} />
        </Box>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: palette.text.primary,
          }}
        >
          CIPHERGATE
        </Typography>
      </Box>

      {/* Status indicators */}
      <SecurityIndicator />
      <NetworkBadge networkId={walletState.networkId} />

      <Box sx={{ flex: 1 }} />

      {/* Wallet controls */}
      {renderWalletBadge()}

      {/* Notification bell */}
      <Tooltip title="Notifications" arrow>
        <IconButton
          size="small"
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            color: palette.text.tertiary,
            '&:hover': {
              color: palette.text.secondary,
              background: alpha('#fff', 0.04),
            },
          }}
        >
          <Badge
            overlap="circular"
            variant="dot"
            sx={{
              '& .MuiBadge-dot': {
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: palette.accent.primary,
              },
            }}
          >
            <NotificationsIcon sx={{ fontSize: 16 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* User profile */}
      <Tooltip title="Profile" arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              background: alpha('#fff', 0.03),
            },
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${palette.metal.titanium} 0%, ${palette.metal.obsidian} 100%)`,
              border: `1px solid ${alpha('#fff', 0.06)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 12, color: palette.text.tertiary }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.625rem',
              fontWeight: 500,
              color: palette.text.tertiary,
            }}
          >
            Admin
          </Typography>
        </Box>
      </Tooltip>

      {/* Terminal icon accent */}
      <TerminalIcon
        sx={{
          fontSize: 14,
          color: alpha('#fff', 0.08),
          ml: 0.5,
        }}
      />
    </Box>
  );
};

// CipherGate Application Header
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Typography,
  alpha,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Fade,
} from '@mui/material';
import LockIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import DisconnectIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import { useDeployedVaultContext } from '../../hooks';
import type { WalletConnectionState } from '../../contexts';

/**
 * Premium glass-header with animated borders, wallet connection UX,
 * and refined CipherGate branding.
 */
export const Header: React.FC = () => {
  const vaultApiProvider = useDeployedVaultContext();
  const [walletState, setWalletState] = useState<WalletConnectionState>({ status: 'disconnected' });

  useEffect(() => {
    const subscription = vaultApiProvider.walletState$.subscribe(setWalletState);
    return () => subscription.unsubscribe();
  }, [vaultApiProvider]);

  const handleConnect = () => {
    vaultApiProvider.connectWallet();
  };

  const handleDisconnect = () => {
    vaultApiProvider.disconnectWallet();
  };

  const renderWalletBadge = () => {
    switch (walletState.status) {
      case 'connected':
        return (
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 6,
                background: (t) => alpha(t.palette.success.main, 0.08),
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.success.main, 0.15),
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'success.main',
                  fontWeight: 600,
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Connected
              </Typography>
              <Tooltip title="Disconnect wallet" arrow placement="bottom">
                <IconButton
                  onClick={handleDisconnect}
                  size="small"
                  sx={{
                    ml: 0.5,
                    color: alpha('#fff', 0.4),
                    width: 20,
                    height: 20,
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: alpha('#ef4444', 0.1),
                    },
                  }}
                >
                  <DisconnectIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        );

      case 'connecting':
        return (
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 6,
                background: (t) => alpha(t.palette.warning.main, 0.08),
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.warning.main, 0.15),
              }}
            >
              <CircularProgress size={10} thickness={6} sx={{ color: 'warning.main' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'warning.main',
                  fontWeight: 600,
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Connecting...
              </Typography>
            </Box>
          </Fade>
        );

      case 'error':
        return (
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 6,
                background: (t) => alpha(t.palette.error.main, 0.08),
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.error.main, 0.15),
              }}
            >
              <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 12 }} />
              <Tooltip title={walletState.error ?? 'Wallet error'} arrow placement="bottom">
                <Typography
                  variant="caption"
                  sx={{
                    color: 'error.main',
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'help',
                  }}
                >
                  Wallet Error
                </Typography>
              </Tooltip>
              <Tooltip title="Retry connection" arrow placement="bottom">
                <IconButton
                  onClick={handleConnect}
                  size="small"
                  sx={{
                    color: alpha('#fff', 0.4),
                    width: 20,
                    height: 20,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        );

      default: // disconnected
        return (
          <Fade in timeout={300}>
            <Button
              onClick={handleConnect}
              size="small"
              variant="outlined"
              startIcon={<WalletIcon sx={{ fontSize: 14 }} />}
              sx={{
                borderRadius: 6,
                borderColor: (t) => alpha(t.palette.primary.main, 0.3),
                color: (t) => alpha(t.palette.primary.main, 0.8),
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                py: 0.5,
                px: 1.5,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                },
              }}
            >
              Connect Wallet
            </Button>
          </Fade>
        );
    }
  };

  return (
    <AppBar
      position="sticky"
      data-testid="header"
      elevation={0}
      sx={{
        mt: 1.5,
        mx: 'auto',
        maxWidth: 'calc(100% - 32px)',
        borderRadius: 3,
        background: (t) =>
          `linear-gradient(135deg, ${alpha(t.palette.background.paper, 0.7)} 0%, ${alpha('#0a0e27', 0.85)} 100%)`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid',
        borderColor: (t) => alpha(t.palette.primary.main, 0.12),
        boxShadow: (t) => `0 4px 24px ${alpha('#000', 0.4)}, inset 0 1px 0 ${alpha(t.palette.primary.main, 0.08)}`,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          padding: '1px',
          background: (t) =>
            `linear-gradient(90deg, transparent 0%, ${alpha(t.palette.primary.main, 0.3)} 50%, transparent 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          animation: 'shimmer 4s ease-in-out infinite',
          backgroundSize: '200% 100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          px: 3,
          py: 1.5,
          alignItems: 'center',
          gap: 2.5,
          width: '100%',
        }}
        data-testid="header-logo"
      >
        {/* Icon mark */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            background: (t) => `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.15)} 0%, transparent 100%)`,
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.primary.main, 0.2),
          }}
        >
          <LockIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        </Box>

        {/* Wordmark */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '0.08em',
              background: (t) => `linear-gradient(90deg, ${t.palette.primary.main}, #7dd3fc)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            CIPHERGATE
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              letterSpacing: '0.12em',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              display: 'block',
              mt: 0.2,
            }}
          >
            Secure File Sharing on Midnight Network
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Wallet connection area */}
        {renderWalletBadge()}

        {/* Terminal icon for tech aesthetic */}
        <TerminalIcon
          sx={{
            color: (t) => alpha(t.palette.primary.main, 0.3),
            fontSize: 18,
          }}
        />
      </Box>
    </AppBar>
  );
};

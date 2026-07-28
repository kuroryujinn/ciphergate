// CipherGate Sidebar Navigation — Engraved Metallic Nameplates
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ContractIcon from '@mui/icons-material/DescriptionOutlined';
import ProofIcon from '@mui/icons-material/AutoFixHighOutlined';
import TransactionIcon from '@mui/icons-material/SwapHorizOutlined';
import AuditIcon from '@mui/icons-material/HistoryOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { palette } from '../../config/theme';

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
  { id: 'wallet', label: 'Wallet', icon: <WalletIcon sx={{ fontSize: 18 }} /> },
  { id: 'contracts', label: 'Contracts', icon: <ContractIcon sx={{ fontSize: 18 }} /> },
  { id: 'proof-engine', label: 'Proof Engine', icon: <ProofIcon sx={{ fontSize: 18 }} /> },
  { id: 'transactions', label: 'Transactions', icon: <TransactionIcon sx={{ fontSize: 18 }} /> },
  { id: 'audit-logs', label: 'Audit Logs', icon: <AuditIcon sx={{ fontSize: 18 }} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
];

const NavItemComponent: React.FC<{
  item: NavItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ item, isSelected, onSelect }) => (
  <Box
    onClick={() => onSelect(item.id)}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 1.5,
      py: 1.25,
      mx: 0.75,
      borderRadius: 1,
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s ease',
      background: isSelected
        ? `linear-gradient(90deg, ${alpha(palette.accent.primary, 0.08)} 0%, transparent 100%)`
        : 'transparent',
      '&::before': isSelected
        ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            width: 2,
            background: `linear-gradient(180deg, ${alpha(palette.accent.primary, 0.6)} 0%, ${alpha(palette.accent.primary, 0.2)} 100%)`,
            borderRadius: 1,
          }
        : {},
      '&:hover': {
        background: `linear-gradient(90deg, ${alpha('#fff', 0.04)} 0%, transparent 100%)`,
        '& .nav-icon-bezel': {
          borderColor: alpha('#fff', 0.15),
        },
        '& .nav-label': {
          color: palette.text.primary,
        },
      },
    }}
  >
    {/* Icon bezel */}
    <Box
      className="nav-icon-bezel"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: '50%',
        flexShrink: 0,
        background: isSelected
          ? `linear-gradient(135deg, ${alpha(palette.accent.primary, 0.12)} 0%, transparent 100%)`
          : `linear-gradient(135deg, ${alpha('#fff', 0.03)} 0%, transparent 100%)`,
        border: `1px solid ${isSelected ? alpha(palette.accent.primary, 0.2) : alpha('#fff', 0.06)}`,
        transition: 'all 0.2s ease',
        color: isSelected ? palette.accent.primary : palette.text.tertiary,
      }}
    >
      {item.icon}
    </Box>

    {/* Label */}
    <Typography
      className="nav-label"
      sx={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.75rem',
        fontWeight: isSelected ? 600 : 500,
        letterSpacing: '0.04em',
        color: isSelected ? palette.text.primary : palette.text.tertiary,
        transition: 'color 0.2s ease',
      }}
    >
      {item.label}
    </Typography>
  </Box>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  // Map view names to sidebar IDs
  const currentNavId = activeTab === 'dashboard' || navItems.some((n) => n.id === activeTab) ? activeTab : 'dashboard';

  return (
    <Box
      sx={{
        width: 220,
        minWidth: 220,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, ${palette.bg.surface} 0%, ${alpha(palette.bg.deepest, 0.6)} 100%)`,
        borderRight: `1px solid ${alpha('#fff', 0.04)}`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 0,
          top: '5%',
          bottom: '5%',
          width: 1,
          background: `linear-gradient(180deg, transparent, ${alpha('#fff', 0.06)}, transparent)`,
        },
      }}
    >
      {/* Brand mark */}
      <Box
        sx={{
          px: 2,
          py: 2.5,
          borderBottom: `1px solid ${alpha('#fff', 0.04)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            background: `linear-gradient(135deg, ${alpha(palette.accent.primary, 0.15)} 0%, transparent 100%)`,
            border: `1px solid ${alpha(palette.accent.primary, 0.15)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: `2px solid ${alpha(palette.accent.primary, 0.6)}`,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: palette.accent.primary,
              },
            }}
          />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontSize: '0.8125rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: palette.text.primary,
              lineHeight: 1.2,
            }}
          >
            CIPHERGATE
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.5625rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: palette.text.tertiary,
              textTransform: 'uppercase',
            }}
          >
            Secure Vault Console
          </Typography>
        </Box>
      </Box>

      {/* Navigation items */}
      <Box
        sx={{
          flex: 1,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          overflow: 'auto',
        }}
      >
        {navItems.map((item) => (
          <NavItemComponent key={item.id} item={item} isSelected={currentNavId === item.id} onSelect={onTabChange} />
        ))}
      </Box>

      {/* Bottom status badge */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${alpha('#fff', 0.04)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
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
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.5625rem',
            fontWeight: 500,
            color: palette.text.tertiary,
            letterSpacing: '0.04em',
          }}
        >
          SYSTEM ACTIVE
        </Typography>
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.5rem',
            color: palette.text.disabled,
            ml: 'auto',
          }}
        >
          v0.1.0
        </Typography>
      </Box>
    </Box>
  );
};

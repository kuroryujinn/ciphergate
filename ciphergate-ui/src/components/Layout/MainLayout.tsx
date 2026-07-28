// CipherGate Main Layout — Cryptographic Workstation
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, alpha, Fade } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import StatusBar from './StatusBar';
import { palette } from '../../config/theme';

export interface MainLayoutProps extends React.PropsWithChildren {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

/**
 * Cryptographic workstation layout:
 * - Top header bar (control panel)
 * - Left sidebar (engraved navigation)
 * - Center workspace (modular hardware rack)
 * - Bottom status bar (system monitoring)
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: palette.bg.deepest,
        position: 'relative',
      }}
    >
      {/* Top Header */}
      <Header activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab ?? 'dashboard'} onTabChange={handleTabChange} />

        {/* Main Workspace */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            background: `radial-gradient(ellipse at 30% 40%, ${alpha(palette.accent.primary, 0.015)} 0%, transparent 60%),
                         radial-gradient(ellipse at 70% 60%, ${alpha(palette.accent.success, 0.008)} 0%, transparent 50%),
                         ${palette.bg.deepest}`,
            position: 'relative',
          }}
        >
          <Fade in key={activeTab} timeout={250}>
            <Box
              sx={{
                p: 3,
                minHeight: '100%',
                animation: 'slideInUp 0.3s ease-out',
              }}
            >
              {children}
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Bottom Status Bar */}
      <StatusBar />
    </Box>
  );
};

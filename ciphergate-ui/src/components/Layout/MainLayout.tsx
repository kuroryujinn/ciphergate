// CipherGate Application Layout
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, alpha } from '@mui/material';
import { Header } from './Header';

export interface MainLayoutProps extends React.PropsWithChildren {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

/**
 * Provides layout for the CipherGate application.
 * Features an atmospheric dark background with subtle grid texture.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: (
          t,
        ) => `radial-gradient(ellipse at 20% 50%, ${alpha(t.palette.primary.main, 0.03)} 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, ${alpha(t.palette.secondary.main, 0.04)} 0%, transparent 50%),
                            radial-gradient(ellipse at 50% 80%, ${alpha(t.palette.primary.main, 0.02)} 0%, transparent 50%),
                            ${t.palette.background.default}`,
      }}
    >
      {/* Subtle grid overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.03,
          backgroundImage: (t) =>
            `linear-gradient(${alpha(t.palette.primary.main, 0.3)} 1px, transparent 1px),
             linear-gradient(90deg, ${alpha(t.palette.primary.main, 0.3)} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Header activeTab={activeTab} onTabChange={onTabChange} />

      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

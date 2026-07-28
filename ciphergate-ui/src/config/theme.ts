// CipherGate Theme Configuration
// SPDX-License-Identifier: Apache-2.0

import { createTheme, alpha } from '@mui/material';

// ─── Design Tokens ───────────────────────────────────────────────────────────
// A sophisticated cyber-luxury palette. Deep navy anchors the base,
// cyber-teal pulses as the primary accent, and electric violet provides
// secondary depth — like encrypted data made visible.

const cyberTeal = '#00d4ff';
const electricViolet = '#7c3aed';
const deepNavy = '#0a0e27';
const midnightBlue = '#12162a';
const successGreen = '#10b981';
const warningAmber = '#f59e0b';
const errorRed = '#ef4444';
const surfaceLight = '#1e2240';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    allVariants: {
      color: '#e2e8f0',
    },
    h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', letterSpacing: '0.04em' },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: cyberTeal,
      light: alpha(cyberTeal, 0.5),
      dark: alpha(cyberTeal, 0.9),
    },
    secondary: {
      main: electricViolet,
      light: alpha(electricViolet, 0.5),
      dark: alpha(electricViolet, 0.9),
    },
    success: { main: successGreen },
    warning: { main: warningAmber },
    error: { main: errorRed },
    background: {
      default: deepNavy,
      paper: midnightBlue,
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
    divider: alpha('#e2e8f0', 0.08),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        '@keyframes pulse-glow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateX(-8px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(135deg, ${alpha(midnightBlue, 0.9)} 0%, ${alpha(surfaceLight, 0.6)} 100%)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(cyberTeal, 0.12)}`,
          boxShadow: `0 8px 32px ${alpha(deepNavy, 0.6)}, 0 0 0 1px ${alpha(cyberTeal, 0.06)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(cyberTeal, 0.25),
            boxShadow: `0 12px 48px ${alpha(deepNavy, 0.8)}, 0 0 0 1px ${alpha(cyberTeal, 0.12)}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.625rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha('#000', 0.3),
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: alpha(cyberTeal, 0.15),
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: alpha(cyberTeal, 0.35),
            },
            '&.Mui-focused fieldset': {
              borderColor: cyberTeal,
              borderWidth: 1,
            },
          },
          '& .MuiInputLabel-root': {
            color: alpha('#94a3b8', 0.7),
          },
          '& .MuiInputBase-input': {
            color: '#e2e8f0',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          padding: '6px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: `linear-gradient(135deg, ${alpha(midnightBlue, 0.95)} 0%, ${alpha(deepNavy, 0.98)} 100%)`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${alpha(cyberTeal, 0.12)}`,
          borderRadius: 16,
        },
      },
    },
  },
});

export const colors = {
  cyberTeal,
  electricViolet,
  deepNavy,
  midnightBlue,
  successGreen,
  warningAmber,
  errorRed,
  surfaceLight,
} as const;

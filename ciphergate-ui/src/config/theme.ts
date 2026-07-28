// CipherGate Theme Configuration — Premium Skeuomorphic Design
// SPDX-License-Identifier: Apache-2.0

import { createTheme, alpha } from '@mui/material';

// ─── Design Tokens ───────────────────────────────────────────────────────────
// Inspired by Swiss precision instrumentation, brushed titanium, anodized aluminum,
// and enterprise security hardware. No neon, no glassmorphism — only tactile realism.

const paletteConfig = {
  // Backgrounds
  bg: {
    deepest: '#090B10',
    surface: '#161B24',
    elevated: '#202633',
    card: '#1A1F2E',
    inset: '#0E111A',
  },
  // Accents
  accent: {
    primary: '#3D7BFF',
    purple: '#7C3AED',
    sky: '#7DD3FC',
    success: '#39D98A',
    warning: '#FFB547',
    error: '#FF5B6E',
    info: '#5B8DEF',
  },
  // Text
  text: {
    primary: '#F4F6FA',
    secondary: '#AAB4C8',
    tertiary: '#6B7A99',
    disabled: '#3D4759',
  },
  // Metallic tones
  metal: {
    titanium: '#2A3040',
    aluminum: '#36404F',
    steel: '#4A5568',
    chrome: '#6B7A99',
    obsidian: '#0D0F16',
    carbon: '#12151E',
  },
  // LED colors
  led: {
    green: '#39D98A',
    amber: '#FFB547',
    red: '#FF5B6E',
    blue: '#3D7BFF',
    off: '#2A3040',
  },
} as const;

export const palette = paletteConfig;

// Backward-compat alias for files still importing `colors`
export const colors = {
  cyberTeal: paletteConfig.accent.primary,
  electricViolet: paletteConfig.accent.purple,
  deepNavy: '#0a0e27',
  midnightBlue: '#12162a',
  successGreen: paletteConfig.accent.success,
  warningAmber: paletteConfig.accent.warning,
  errorRed: paletteConfig.accent.error,
  surfaceLight: '#1e2240',
} as const;

// ─── Metallic Gradients ──────────────────────────────────────────────────────

const gradients = {
  brushedTitanium: `linear-gradient(180deg, ${paletteConfig.metal.titanium} 0%, ${paletteConfig.metal.obsidian} 100%)`,
  anodizedAluminum: `linear-gradient(180deg, ${paletteConfig.metal.aluminum} 0%, ${paletteConfig.metal.carbon} 100%)`,
  buttonPrimary: `linear-gradient(180deg, #2A3850 0%, #1A2538 50%, #0F1A2E 100%)`,
  buttonPrimaryHover: `linear-gradient(180deg, #334566 0%, #1E2D48 50%, #142238 100%)`,
  buttonPrimaryPressed: `linear-gradient(180deg, #0F1A2E 0%, #1A2538 50%, #2A3850 100%)`,
  buttonSecondary: `linear-gradient(180deg, ${paletteConfig.metal.aluminum} 0%, ${paletteConfig.metal.carbon} 100%)`,
  panelBorder: `linear-gradient(180deg, ${alpha('#fff', 0.08)} 0%, ${alpha('#fff', 0.02)} 50%, transparent 100%)`,
  insetShadow: `inset 0 1px 0 ${alpha('#fff', 0.06)}, inset 0 -1px 0 ${alpha('#000', 0.4)}`,
} as const;

// ─── Keyframes ───────────────────────────────────────────────────────────────

const keyframeDefinitions = {
  '@keyframes ledPulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  '@keyframes mechanicalFill': {
    '0%': { width: '0%' },
    '100%': { width: 'var(--progress-width, 100%)' },
  },
  '@keyframes buttonPress': {
    '0%': { transform: 'translateY(0)', boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' },
    '50%': {
      transform: 'translateY(1px)',
      boxShadow: '0 0px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
    },
    '100%': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
    },
  },
  '@keyframes slideInLeft': {
    from: { opacity: 0, transform: 'translateX(-12px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  '@keyframes slideInUp': {
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes drawerOpen': {
    from: { opacity: 0, transform: 'scaleY(0.95)' },
    to: { opacity: 1, transform: 'scaleY(1)' },
  },
  '@keyframes knobRotate': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(45deg)' },
  },
  '@keyframes toggleFlip': {
    '0%': { transform: 'translateX(0)' },
    '50%': { transform: 'scaleX(0.8)' },
    '100%': { transform: 'translateX(16px)' },
  },
  '@keyframes ledGlow': {
    '0%, 100%': { boxShadow: '0 0 4px currentColor, 0 0 8px currentColor' },
    '50%': { boxShadow: '0 0 2px currentColor, 0 0 4px currentColor' },
  },
  '@keyframes vaultPanelOpen': {
    from: { opacity: 0, transform: 'perspective(800px) rotateX(5deg)' },
    to: { opacity: 1, transform: 'perspective(800px) rotateX(0deg)' },
  },
};

// ─── Theme ───────────────────────────────────────────────────────────────────

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"IBM Plex Sans", "Inter", sans-serif',
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: paletteConfig.text.primary,
    },
    h2: {
      fontFamily: '"IBM Plex Sans", "Inter", sans-serif',
      fontSize: '1.35rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: paletteConfig.text.primary,
    },
    h3: {
      fontFamily: '"IBM Plex Sans", "Inter", sans-serif',
      fontSize: '1.1rem',
      fontWeight: 600,
      color: paletteConfig.text.primary,
    },
    h4: {
      fontFamily: '"IBM Plex Sans", "Inter", sans-serif',
      fontSize: '0.95rem',
      fontWeight: 600,
      color: paletteConfig.text.primary,
    },
    subtitle1: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      color: paletteConfig.text.secondary,
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      color: paletteConfig.text.secondary,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: paletteConfig.text.primary,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.6,
      color: paletteConfig.text.secondary,
    },
    caption: {
      fontSize: '0.6875rem',
      letterSpacing: '0.05em',
      color: paletteConfig.text.tertiary,
    },
    allVariants: {
      color: paletteConfig.text.primary,
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: paletteConfig.accent.primary,
      light: alpha(paletteConfig.accent.primary, 0.5),
      dark: alpha(paletteConfig.accent.primary, 0.8),
    },
    secondary: {
      main: paletteConfig.metal.chrome,
      light: alpha(paletteConfig.metal.chrome, 0.5),
      dark: alpha(paletteConfig.metal.chrome, 0.8),
    },
    success: { main: paletteConfig.accent.success },
    warning: { main: paletteConfig.accent.warning },
    error: { main: paletteConfig.accent.error },
    info: { main: paletteConfig.accent.info },
    background: {
      default: paletteConfig.bg.deepest,
      paper: paletteConfig.bg.surface,
    },
    text: {
      primary: paletteConfig.text.primary,
      secondary: paletteConfig.text.secondary,
      disabled: paletteConfig.text.disabled,
    },
    divider: alpha('#fff', 0.06),
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: paletteConfig.bg.deepest,
        },
        ...keyframeDefinitions,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: gradients.brushedTitanium,
          border: `1px solid ${alpha('#fff', 0.06)}`,
          borderRadius: 8,
          boxShadow: `0 2px 8px ${alpha('#000', 0.4)}, ${gradients.insetShadow}`,
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.08)}, transparent)`,
            borderRadius: '8px 8px 0 0',
          },
          '&:hover': {
            borderColor: alpha('#fff', 0.1),
            boxShadow: `0 4px 16px ${alpha('#000', 0.5)}, ${gradients.insetShadow}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderRadius: 4,
          padding: '6px 18px',
          position: 'relative',
          transition: 'all 0.15s ease',
          border: `1px solid ${alpha('#fff', 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 4,
            padding: '1px',
            background: `linear-gradient(180deg, ${alpha('#fff', 0.1)} 0%, transparent 100%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          },
          '&.MuiButton-containedPrimary': {
            background: gradients.buttonPrimary,
            color: paletteConfig.text.primary,
            border: `1px solid ${alpha(paletteConfig.accent.primary, 0.3)}`,
            boxShadow: `0 2px 4px ${alpha('#000', 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.08)}`,
            '&:hover': {
              background: gradients.buttonPrimaryHover,
              borderColor: alpha(paletteConfig.accent.primary, 0.5),
              boxShadow: `0 3px 8px ${alpha('#000', 0.5)}, inset 0 1px 0 ${alpha('#fff', 0.1)}`,
            },
            '&:active': {
              background: gradients.buttonPrimaryPressed,
              boxShadow: `inset 0 2px 4px ${alpha('#000', 0.6)}`,
              transform: 'translateY(1px)',
            },
          },
          '&.MuiButton-containedSecondary': {
            background: gradients.buttonSecondary,
            color: paletteConfig.text.secondary,
            border: `1px solid ${alpha('#fff', 0.08)}`,
            boxShadow: `0 2px 4px ${alpha('#000', 0.3)}, inset 0 1px 0 ${alpha('#fff', 0.06)}`,
            '&:hover': {
              borderColor: alpha('#fff', 0.15),
              boxShadow: `0 3px 8px ${alpha('#000', 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.08)}`,
            },
            '&:active': {
              boxShadow: `inset 0 2px 4px ${alpha('#000', 0.5)}`,
              transform: 'translateY(1px)',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: alpha('#fff', 0.1),
            color: paletteConfig.text.secondary,
            background: 'transparent',
            '&:hover': {
              borderColor: alpha('#fff', 0.2),
              background: alpha('#fff', 0.03),
            },
          },
          '&.MuiButton-sizeSmall': {
            fontSize: '0.6875rem',
            padding: '4px 12px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          transition: 'all 0.15s ease',
          '&:hover': {
            background: alpha('#fff', 0.04),
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
            backgroundColor: paletteConfig.bg.inset,
            borderRadius: 4,
            border: `1px solid ${alpha('#fff', 0.06)}`,
            transition: 'all 0.2s ease',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              borderColor: alpha('#fff', 0.12),
            },
            '&.Mui-focused': {
              borderColor: alpha(paletteConfig.accent.primary, 0.4),
              boxShadow: `inset 0 0 0 1px ${alpha(paletteConfig.accent.primary, 0.2)}, 0 0 8px ${alpha(paletteConfig.accent.primary, 0.1)}`,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
          '& .MuiInputLabel-root': {
            color: paletteConfig.text.tertiary,
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          },
          '& .MuiInputBase-input': {
            color: paletteConfig.text.primary,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.8125rem',
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
          borderRadius: 3,
          height: 22,
          border: `1px solid ${alpha('#fff', 0.08)}`,
          background: alpha('#fff', 0.03),
        },
        label: {
          padding: '0 8px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: gradients.brushedTitanium,
          border: `1px solid ${alpha('#fff', 0.08)}`,
          borderRadius: 8,
          boxShadow: `0 8px 32px ${alpha('#000', 0.6)}, ${gradients.insetShadow}`,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#000', 0.6),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: paletteConfig.bg.elevated,
          border: `1px solid ${alpha('#fff', 0.06)}`,
          borderRadius: 4,
          fontSize: '0.6875rem',
          padding: '4px 8px',
          color: paletteConfig.text.secondary,
          fontFamily: '"Inter", sans-serif',
        },
        arrow: {
          color: paletteConfig.bg.elevated,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
          backgroundColor: paletteConfig.accent.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          minHeight: 36,
          padding: '6px 12px',
          color: paletteConfig.text.tertiary,
          '&.Mui-selected': {
            color: paletteConfig.text.primary,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 4,
          borderRadius: 2,
          backgroundColor: alpha('#fff', 0.04),
        },
        bar: {
          borderRadius: 2,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 36,
          height: 20,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 3,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              '& + .MuiSwitch-track': {
                backgroundColor: alpha(paletteConfig.accent.primary, 0.3),
                borderColor: alpha(paletteConfig.accent.primary, 0.4),
              },
              '& .MuiSwitch-thumb': {
                backgroundColor: paletteConfig.accent.primary,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: paletteConfig.metal.chrome,
            boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.2)}, 0 1px 2px ${alpha('#000', 0.4)}`,
          },
          '& .MuiSwitch-track': {
            borderRadius: 3,
            backgroundColor: alpha('#fff', 0.04),
            border: `1px solid ${alpha('#fff', 0.08)}`,
            opacity: 1,
          },
        },
      },
    },
  },
});

// ─── Reusable Utility Styles ────────────────────────────────────────────────

export const hardwareStyles = {
  // OLED-style display panel
  oledDisplay: {
    background: `linear-gradient(180deg, ${alpha(paletteConfig.bg.inset, 0.95)} 0%, ${alpha('#000', 0.98)} 100%)`,
    border: `1px solid ${alpha('#fff', 0.04)}`,
    borderRadius: 4,
    boxShadow: `inset 0 2px 4px ${alpha('#000', 0.6)}`,
    padding: '12px 16px',
  } as const,

  // Engraved label
  engravedLabel: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: paletteConfig.text.tertiary,
    position: 'relative',
    display: 'inline-block',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -2,
      left: 0,
      right: 0,
      height: 1,
      background: `linear-gradient(90deg, ${alpha('#fff', 0.2)} 0%, transparent 100%)`,
    },
  } as const,

  // LED indicator dot
  ledIndicator: (color: string, active: boolean) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: active ? color : paletteConfig.led.off,
    boxShadow: active ? `0 0 4px ${color}, 0 0 8px ${alpha(color, 0.3)}` : 'none',
    transition: 'all 0.3s ease',
    animation: active ? 'ledPulse 2s ease-in-out infinite' : 'none',
  }),

  // Recessed panel
  recessedPanel: {
    background: paletteConfig.bg.inset,
    border: `1px solid ${alpha('#000', 0.4)}`,
    borderRadius: 4,
    boxShadow: `inset 0 2px 4px ${alpha('#000', 0.6)}`,
  } as const,

  // Metallic divider
  metalDivider: {
    height: 1,
    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.08)}, transparent)`,
  } as const,

  // Machined button base
  machinedButton: {
    background: gradients.buttonSecondary,
    border: `1px solid ${alpha('#fff', 0.08)}`,
    borderRadius: 4,
    boxShadow: `0 2px 4px ${alpha('#000', 0.3)}, inset 0 1px 0 ${alpha('#fff', 0.06)}`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      borderColor: alpha('#fff', 0.15),
      boxShadow: `0 3px 8px ${alpha('#000', 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.08)}`,
    },
    '&:active': {
      boxShadow: `inset 0 2px 4px ${alpha('#000', 0.5)}`,
      transform: 'translateY(1px)',
    },
  } as const,

  // Panel with edge highlight
  edgeHighlighted: {
    position: 'relative' as const,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -1,
      left: 20,
      right: 20,
      height: 1,
      background: `linear-gradient(90deg, transparent, ${alpha(paletteConfig.accent.primary, 0.3)}, transparent)`,
    },
  },
} as const;

export { gradients };

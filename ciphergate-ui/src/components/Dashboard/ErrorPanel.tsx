// CipherGate ErrorPanel — Skeuomorphic Hardware Error State
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Typography, alpha, Button, Fade } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import { palette } from '../../config/theme';

export interface ErrorPanelProps {
  /** Error title shown at the top of the panel */
  title?: string;
  /** Detailed error description */
  message: string;
  /** Error severity level */
  severity?: 'error' | 'warning' | 'critical';
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** If true, shows a dismiss button */
  dismissable?: boolean;
  /** If true, shows a retry button */
  retryable?: boolean;
}

const severityConfig = {
  critical: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 20 }} />,
    ledColor: palette.led.red,
    label: 'CRITICAL',
    labelColor: palette.accent.error,
    bgGlow: alpha(palette.accent.error, 0.06),
    borderGlow: alpha(palette.accent.error, 0.15),
  },
  error: {
    icon: <WarningAmberIcon sx={{ fontSize: 20 }} />,
    ledColor: palette.led.red,
    label: 'ERROR',
    labelColor: palette.accent.error,
    bgGlow: alpha(palette.accent.error, 0.04),
    borderGlow: alpha(palette.accent.error, 0.1),
  },
  warning: {
    icon: <WarningAmberIcon sx={{ fontSize: 20 }} />,
    ledColor: palette.led.amber,
    label: 'WARNING',
    labelColor: palette.accent.warning,
    bgGlow: alpha(palette.accent.warning, 0.04),
    borderGlow: alpha(palette.accent.warning, 0.1),
  },
};

/** 
 * Error panel designed as a physical fault-indicator module — 
 * uses LED glow, engraved labels, and metallic hardware styling.
 */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  title,
  message,
  severity = 'error',
  onRetry,
  onDismiss,
  dismissable = false,
  retryable = true,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const config = severityConfig[severity];

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          background: `linear-gradient(180deg, ${config.bgGlow} 0%, ${alpha(palette.bg.surface, 0.3)} 100%)`,
          border: `1px solid ${config.borderGlow}`,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${alpha(config.ledColor, 0.2)}, transparent)`,
          },
        }}
      >
        {/* Top bar with LED and severity label */}
        <Box sx={{ px: 3, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 1,
              background: alpha(config.ledColor, 0.08),
              border: `1px solid ${alpha(config.ledColor, 0.12)}`,
              color: config.labelColor,
            }}
          >
            {config.icon}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* LED indicator */}
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: config.ledColor,
                boxShadow: `0 0 4px ${config.ledColor}`,
                animation: severity === 'critical' ? 'ledPulse 0.8s ease-in-out infinite' : 'ledPulse 2s ease-in-out infinite',
              }}
            />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: config.labelColor,
              }}
            >
              {config.label}
            </Typography>
          </Box>
          {title && (
            <Typography
              sx={{
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: palette.text.primary,
              }}
            >
              {title}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          {dismissable && (
            <Box
              onClick={handleDismiss}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: 1,
                cursor: 'pointer',
                color: palette.text.tertiary,
                '&:hover': {
                  color: palette.text.secondary,
                  background: alpha('#fff', 0.04),
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </Box>
          )}
        </Box>

        {/* Error message */}
        <Box sx={{ px: 3, pb: retryable ? 1 : 2 }}>
          <Box
            sx={{
              background: palette.bg.inset,
              border: `1px solid ${alpha('#000', 0.3)}`,
              borderRadius: 1,
              p: 1.5,
              boxShadow: `inset 0 2px 4px ${alpha('#000', 0.4)}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.6875rem',
                lineHeight: 1.6,
                color: palette.text.secondary,
              }}
            >
              {message}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        {retryable && (
          <Box
            sx={{
              px: 3,
              pb: 2,
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
            }}
          >
            {onRetry && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon sx={{ fontSize: 12 }} />}
                onClick={onRetry}
                sx={{
                  color: palette.text.secondary,
                  borderColor: alpha('#fff', 0.1),
                  fontSize: '0.625rem',
                  '&:hover': {
                    borderColor: alpha(palette.accent.primary, 0.3),
                    color: palette.accent.primary,
                  },
                }}
              >
                Retry
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Fade>
  );
};

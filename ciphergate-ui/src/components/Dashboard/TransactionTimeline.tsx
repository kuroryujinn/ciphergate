// CipherGate Transaction Timeline — Engraved Vertical Timeline
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';
import CallMadeIcon from '@mui/icons-material/CallMadeOutlined';
import FingerprintIcon from '@mui/icons-material/FingerprintOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHighOutlined';
import VerifiedIcon from '@mui/icons-material/VerifiedOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import { palette } from '../../config/theme';

interface TimelineStage {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
}

const stages: TimelineStage[] = [
  {
    id: 'called',
    label: 'Contract Called',
    subtitle: 'Transaction initiated',
    icon: <CallMadeIcon sx={{ fontSize: 12 }} />,
    isCompleted: true,
    isActive: false,
  },
  {
    id: 'witness',
    label: 'Witness Generated',
    subtitle: 'Private inputs assembled',
    icon: <FingerprintIcon sx={{ fontSize: 12 }} />,
    isCompleted: true,
    isActive: false,
  },
  {
    id: 'proof',
    label: 'Proof Created',
    subtitle: 'ZK proof constructed',
    icon: <AutoFixHighIcon sx={{ fontSize: 12 }} />,
    isCompleted: true,
    isActive: false,
  },
  {
    id: 'verified',
    label: 'Verification Successful',
    subtitle: 'Proof validated on-chain',
    icon: <VerifiedIcon sx={{ fontSize: 12 }} />,
    isCompleted: true,
    isActive: false,
  },
  {
    id: 'finalized',
    label: 'Transaction Finalized',
    subtitle: 'State committed to ledger',
    icon: <CheckCircleIcon sx={{ fontSize: 12 }} />,
    isCompleted: false,
    isActive: true,
  },
];

const TimelineNode: React.FC<{
  stage: TimelineStage;
  isLast: boolean;
}> = ({ stage, isLast }) => {
  const isActive = stage.isActive;
  const isCompleted = stage.isCompleted;
  const nodeColor = isCompleted ? palette.led.green : isActive ? palette.led.blue : palette.led.off;

  return (
    <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
      {/* Vertical line connector */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 13,
            top: 28,
            bottom: -8,
            width: 1,
            background: isCompleted
              ? `linear-gradient(180deg, ${alpha(palette.led.green, 0.3)} 0%, ${alpha(palette.led.green, 0.1)} 100%)`
              : `linear-gradient(180deg, ${alpha('#fff', 0.04)} 0%, ${alpha('#fff', 0.02)} 100%)`,
          }}
        />
      )}

      {/* Node indicator */}
      <Box
        sx={{
          width: 28,
          height: 28,
          minWidth: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isCompleted
            ? `linear-gradient(135deg, ${alpha(palette.led.green, 0.12)} 0%, transparent 100%)`
            : isActive
              ? `linear-gradient(135deg, ${alpha(palette.led.blue, 0.12)} 0%, transparent 100%)`
              : alpha('#fff', 0.02),
          border: `1px solid ${
            isCompleted ? alpha(palette.led.green, 0.2) : isActive ? alpha(palette.led.blue, 0.2) : alpha('#fff', 0.04)
          }`,
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Inner LED */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: nodeColor,
            boxShadow: isActive || isCompleted ? `0 0 4px ${nodeColor}, 0 0 8px ${alpha(nodeColor, 0.3)}` : 'none',
            animation: isActive ? 'ledPulse 1.5s ease-in-out infinite' : 'none',
            transition: 'all 0.3s ease',
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          pb: isLast ? 0 : 2,
          pt: 0.25,
          opacity: isActive || isCompleted ? 1 : 0.4,
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 700 : 600,
              color: isCompleted ? palette.accent.success : isActive ? palette.accent.primary : palette.text.disabled,
              letterSpacing: '0.02em',
            }}
          >
            {stage.label}
          </Typography>
          {isCompleted && <CheckCircleIcon sx={{ fontSize: 10, color: palette.accent.success }} />}
          {isActive && (
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 1,
                background: alpha(palette.led.blue, 0.08),
                ml: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  color: palette.accent.primary,
                  letterSpacing: '0.04em',
                }}
              >
                IN PROGRESS
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.5625rem',
            color: palette.text.tertiary,
            mt: 0.25,
          }}
        >
          {stage.subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export const TransactionTimeline: React.FC = () => {
  return (
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
      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 1,
            background: alpha(palette.accent.primary, 0.08),
            border: `1px solid ${alpha(palette.accent.primary, 0.12)}`,
          }}
        >
          <SwapHorizIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
        </Box>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: palette.text.primary,
          }}
        >
          Transaction Timeline
        </Typography>
      </Box>

      {/* Timeline */}
      <Box sx={{ px: 3, pb: 3 }}>
        {stages.map((stage, index) => (
          <TimelineNode key={stage.id} stage={stage} isLast={index === stages.length - 1} />
        ))}
      </Box>
    </Box>
  );
};

// CipherGate Proof Engine — ZK Circuit Execution Panel
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHighOutlined';
import MemoryIcon from '@mui/icons-material/MemoryOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { palette, hardwareStyles } from '../../config/theme';
import { ProofEngineSkeleton } from './LoadingSkeleton';
import { ErrorPanel } from './ErrorPanel';
import type { ErrorPanelProps } from './ErrorPanel';

interface CircuitStage {
  id: string;
  label: string;
  status: 'idle' | 'active' | 'completed' | 'error';
}

const stages: CircuitStage[] = [
  { id: 'witness', label: 'Witness Generation', status: 'idle' },
  { id: 'proof', label: 'Proof Generation', status: 'idle' },
  { id: 'circuit', label: 'Circuit Execution', status: 'idle' },
  { id: 'verify', label: 'Verification', status: 'idle' },
];

const CPUActivityMeter: React.FC = () => {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 24 }, () => 0));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => Math.random()));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', height: 40 }}>
      {bars.map((val, i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: `${Math.max(8, val * 36)}px`,
            borderRadius: '1px 1px 0 0',
            background: `linear-gradient(180deg, ${alpha(palette.accent.primary, 0.5 + val * 0.3)} 0%, ${alpha(palette.accent.primary, 0.2 + val * 0.2)} 100%)`,
            border: `1px solid ${alpha(palette.accent.primary, 0.15)}`,
            transition: 'height 0.15s ease',
          }}
        />
      ))}
    </Box>
  );
};

interface EngravedProgressProps {
  value: number;
  label: string;
  color?: string;
}

const EngravedProgress: React.FC<EngravedProgressProps> = ({
  value,
  label,
  color = palette.accent.primary,
}) => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.5625rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: palette.text.tertiary,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.5625rem',
          fontWeight: 600,
          color: color,
        }}
      >
        {Math.round(value)}%
      </Typography>
    </Box>
    <Box
      sx={{
        height: 6,
        borderRadius: 2,
        background: palette.bg.inset,
        border: `1px solid ${alpha('#fff', 0.04)}`,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          boxShadow: `inset 0 1px 2px ${alpha('#000', 0.4)}`,
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${value}%`,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${alpha(color, 0.6)} 0%, ${color} 100%)`,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: alpha('#fff', 0.15),
            borderRadius: '2px 2px 0 0',
          },
        }}
      />
    </Box>
  </Box>
);

export interface ProofEngineProps {
  isLoading?: boolean;
  error?: ErrorPanelProps | null;
}

export const ProofEngine: React.FC<ProofEngineProps> = ({ isLoading, error }) => {
  if (isLoading) return <ProofEngineSkeleton />;
  if (error) return <ErrorPanel {...error} />;
  const [progress, setProgress] = useState(0);
  const [currentStages, setCurrentStages] = useState<CircuitStage[]>(stages);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(true);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 5;
        if (next >= 100) {
          clearInterval(timer);
          setIsRunning(false);
          return 100;
        }
        return next;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const activeIndex = Math.min(
      Math.floor((progress / 100) * stages.length),
      stages.length - 1,
    );

    setCurrentStages(
      stages.map((stage, i) => ({
        ...stage,
        status: i < activeIndex ? 'completed' : i === activeIndex && progress > 0 ? 'active' : 'idle',
      })) as CircuitStage[],
    );
  }, [progress]);

  const stageColors = {
    idle: { text: palette.text.disabled, dot: palette.led.off, bg: 'transparent' },
    active: { text: palette.accent.primary, dot: palette.led.blue, bg: alpha(palette.accent.primary, 0.04) },
    completed: { text: palette.accent.success, dot: palette.led.green, bg: alpha(palette.accent.success, 0.04) },
    error: { text: palette.accent.error, dot: palette.led.red, bg: alpha(palette.accent.error, 0.04) },
  };

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
          <AutoFixHighIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
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
          Proof Engine
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRunning && (
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: palette.led.blue,
                boxShadow: `0 0 4px ${palette.led.blue}`,
                animation: 'ledPulse 1.5s ease-in-out infinite',
              }}
            />
          )}
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.5625rem',
              fontWeight: 600,
              color: isRunning ? palette.accent.primary : palette.accent.success,
              letterSpacing: '0.04em',
            }}
          >
            {isRunning ? 'PROCESSING' : 'COMPLETED'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Progress bars */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <EngravedProgress
            value={progress}
            label="Overall Progress"
            color={palette.accent.primary}
          />
          <EngravedProgress
            value={Math.min(100, progress * 1.1)}
            label="Circuit Throughput"
            color={palette.accent.success}
          />
        </Box>

        {/* CPU Activity */}
        <Box sx={{ ...hardwareStyles.oledDisplay, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MemoryIcon sx={{ fontSize: 12, color: alpha(palette.accent.primary, 0.4) }} />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.5rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: alpha(palette.accent.primary, 0.5),
              }}
            >
              CPU Activity — Real-time
            </Typography>
          </Box>
          <CPUActivityMeter />
        </Box>

        {/* Circuit Stages */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {currentStages.map((stage) => {
            const colors = stageColors[stage.status];
            return (
              <Box
                key={stage.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.25,
                  borderRadius: 1,
                  background: colors.bg,
                  border: `1px solid ${
                    stage.status === 'active'
                      ? alpha(palette.accent.primary, 0.12)
                      : stage.status === 'completed'
                        ? alpha(palette.accent.success, 0.1)
                        : 'transparent'
                  }`,
                  transition: 'all 0.3s ease',
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: colors.dot,
                    boxShadow: stage.status === 'active'
                      ? `0 0 4px ${palette.led.blue}`
                      : stage.status === 'completed'
                        ? `0 0 4px ${palette.led.green}`
                        : 'none',
                    animation: stage.status === 'active' ? 'ledPulse 1.5s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.625rem',
                    fontWeight: stage.status === 'active' ? 600 : 500,
                    color: colors.text,
                    letterSpacing: '0.02em',
                  }}
                >
                  {stage.label}
                </Typography>
                {stage.status === 'completed' && (
                  <CheckCircleIcon sx={{ fontSize: 10, color: palette.accent.success, ml: 'auto' }} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Estimated completion */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 1,
            borderRadius: 1,
            background: palette.bg.inset,
            border: `1px solid ${alpha('#fff', 0.03)}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.5625rem',
              color: palette.text.tertiary,
              letterSpacing: '0.04em',
            }}
          >
            ESTIMATED COMPLETION
          </Typography>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.625rem',
              fontWeight: 600,
              color: palette.accent.primary,
            }}
          >
            {progress < 100
              ? `${Math.max(1, Math.round((100 - progress) / 5))}s remaining`
              : 'Complete'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

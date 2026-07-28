// CipherGate Circuit Execution Status Component
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha, CircularProgress, Fade } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmptyOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHighOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';
import CloudQueueIcon from '@mui/icons-material/CloudQueueOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import { palette } from '../config/theme';

export type CircuitExecutionStep =
  | 'idle'
  | 'preparing-witness'
  | 'generating-proof'
  | 'preparing-transaction'
  | 'ready-for-deployment'
  | 'waiting-for-deployment'
  | 'deployment-blocked'
  | 'completed'
  | 'error';

export interface CircuitExecutionState {
  readonly step: CircuitExecutionStep;
  readonly message?: string;
  readonly circuitName: string;
}

interface CircuitStepIndicatorProps {
  isActive: boolean;
  isCompleted: boolean;
  label: string;
  icon: React.ReactNode;
}

const stepConfig: Record<CircuitExecutionStep, { label: string; icon: React.ReactNode }> = {
  idle: { label: 'Idle', icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} /> },
  'preparing-witness': { label: 'Preparing Witness', icon: <LockIcon sx={{ fontSize: 14 }} /> },
  'generating-proof': { label: 'Generating ZK Proof', icon: <AutoFixHighIcon sx={{ fontSize: 14 }} /> },
  'preparing-transaction': { label: 'Preparing Transaction', icon: <SendIcon sx={{ fontSize: 14 }} /> },
  'ready-for-deployment': { label: 'Ready for Deployment', icon: <CloudQueueIcon sx={{ fontSize: 14 }} /> },
  'waiting-for-deployment': { label: 'Waiting for Network', icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} /> },
  'deployment-blocked': { label: 'Deployment Blocked', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
  completed: { label: 'Completed', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  error: { label: 'Error', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
};

const allSteps: CircuitExecutionStep[] = [
  'idle',
  'preparing-witness',
  'generating-proof',
  'preparing-transaction',
  'ready-for-deployment',
  'waiting-for-deployment',
  'deployment-blocked',
];

const CircuitStepIndicator: React.FC<CircuitStepIndicatorProps> = ({ isActive, isCompleted, label, icon }) => {
  const color = isCompleted ? palette.accent.success : isActive ? palette.accent.primary : palette.text.disabled;
  const bgColor = isCompleted
    ? alpha(palette.accent.success, 0.08)
    : isActive
      ? alpha(palette.accent.primary, 0.08)
      : alpha(palette.text.disabled, 0.08);
  const borderColor = isCompleted
    ? alpha(palette.accent.success, 0.2)
    : isActive
      ? alpha(palette.accent.primary, 0.2)
      : alpha(palette.text.disabled, 0.1);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1,
        borderRadius: 1,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        opacity: isActive || isCompleted ? 1 : 0.4,
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography
        variant="caption"
        sx={{
          color,
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.7rem',
          letterSpacing: '0.03em',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {label}
      </Typography>
      {isActive && !isCompleted && <CircularProgress size={10} thickness={6} sx={{ color, ml: 'auto' }} />}
      {isCompleted && <CheckCircleIcon sx={{ fontSize: 14, color: palette.accent.success, ml: 'auto' }} />}
    </Box>
  );
};

export interface CircuitExecutionStatusProps {
  executionState: CircuitExecutionState;
}

export const CircuitExecutionStatus: React.FC<CircuitExecutionStatusProps> = ({ executionState }) => {
  const { step, message, circuitName } = executionState;
  const currentIdx = allSteps.indexOf(step);
  const isBlocked = step === 'deployment-blocked';
  const isError = step === 'error';
  const isCompleted = step === 'completed';

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          background: isBlocked ? alpha(palette.accent.error, 0.04) : isError ? alpha(palette.accent.error, 0.06) : alpha(palette.bg.inset, 0.6),
          border: `1px solid ${isBlocked || isError ? alpha(palette.accent.error, 0.15) : alpha(palette.accent.primary, 0.1)}`,
        }}
      >
        {/* Circuit Name Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: palette.accent.primary,
              fontWeight: 700,
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {circuitName}
          </Typography>
          {isBlocked && (
            <Box
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: 1,
                background: alpha(palette.accent.error, 0.1),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: palette.accent.error,
                  fontWeight: 700,
                  fontSize: '0.55rem',
                  letterSpacing: '0.05em',
                }}
              >
                INFRASTRUCTURE BLOCKED
              </Typography>
            </Box>
          )}
          {isCompleted && <CheckCircleIcon sx={{ fontSize: 14, color: palette.accent.success, ml: 'auto' }} />}
        </Box>

        {/* Step Timeline */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {allSteps.map((s, idx) => {
            const stepCfg = stepConfig[s];
            const isStepActive = idx === currentIdx;
            const isStepCompleted = idx < currentIdx;
            return (
              <CircuitStepIndicator
                key={s}
                isActive={isStepActive}
                isCompleted={isStepCompleted}
                label={stepCfg.label}
                icon={stepCfg.icon}
              />
            );
          })}
        </Box>

        {/* Status Message */}
        {message && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              background: alpha('#000', 0.2),
              border: `1px solid ${alpha(isBlocked || isError ? '#ef4444' : palette.accent.primary, 0.08)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isBlocked || isError ? '#ef4444' : '#94a3b8',
                fontSize: '0.65rem',
                lineHeight: 1.5,
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {message}
            </Typography>
          </Box>
        )}

        {/* Infrastructure Notice */}
        {isBlocked && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.25,
              borderRadius: 1,
              background: alpha('#ef4444', 0.06),
              border: `1px solid ${alpha('#ef4444', 0.12)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 14, mt: 0.25 }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.65rem',
                  lineHeight: 1.5,
                }}
              >
                This operation requires the Midnight Preprod network and proof server, which are currently unavailable.
                Once infrastructure is restored, this circuit will execute automatically.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export const useCircuitExecutionState = () => {
  const [executionState, setExecutionState] = React.useState<CircuitExecutionState>({
    step: 'idle',
    circuitName: '',
  });

  const startExecution = React.useCallback((circuitName: string) => {
    setExecutionState({
      step: 'preparing-witness',
      circuitName,
      message: 'Gathering private witness data (localSecretKey)...',
    });

    // Simulate the execution lifecycle
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        setExecutionState((prev) => ({
          ...prev,
          step: 'generating-proof',
          message: 'Generating zero-knowledge proof via proof server...',
        }));
      }, 500),
    );

    timers.push(
      setTimeout(() => {
        setExecutionState((prev) => ({
          ...prev,
          step: 'preparing-transaction',
          message: 'Constructing and balancing transaction...',
        }));
      }, 1000),
    );

    timers.push(
      setTimeout(() => {
        setExecutionState((prev) => ({
          ...prev,
          step: 'ready-for-deployment',
          message: 'Transaction prepared. Ready to submit to network.',
        }));
      }, 1500),
    );

    timers.push(
      setTimeout(() => {
        setExecutionState((prev) => ({
          ...prev,
          step: 'waiting-for-deployment',
          message: 'Awaiting network confirmation...',
        }));
      }, 2000),
    );

    timers.push(
      setTimeout(() => {
        setExecutionState((prev) => ({
          ...prev,
          step: 'deployment-blocked',
          message:
            'Midnight Preprod infrastructure is currently unavailable. The circuit is ready and will execute once the network is reachable.',
        }));
      }, 2500),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const setStep = React.useCallback((step: CircuitExecutionStep, message?: string) => {
    setExecutionState((prev) => ({ ...prev, step, message: message ?? prev.message }));
  }, []);

  const resetExecution = React.useCallback(() => {
    setExecutionState({ step: 'idle', circuitName: '' });
  }, []);

  return { executionState, startExecution, setStep, resetExecution };
};

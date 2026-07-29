// CipherGate Main Dashboard — Modular Hardware Rack Layout
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from 'react';
import { Box, Typography, alpha, Tooltip, Chip } from '@mui/material';

import { HeroDashboard, type HeroDashboardProps } from './HeroDashboard';
import { ProofEngine, type ProofEngineProps } from './ProofEngine';
import { WalletCard, type WalletCardProps } from './WalletCard';
import { ContractModule, type ContractModuleProps } from './ContractModule';
import { TransactionTimeline } from './TransactionTimeline';
import { SecurityStatus } from './SecurityStatus';
import { palette } from '../../config/theme';

type DemoMode = 'live' | 'loading' | 'error';

interface DemoControlProps {
  mode: DemoMode;
  onChange: (mode: DemoMode) => void;
}

// ─── Demo Mode Toggle — Physical Switch Aesthetic ────────────────────────────

const modes: { id: DemoMode; label: string; ledColor: string }[] = [
  { id: 'live', label: 'LIVE', ledColor: palette.led.green },
  { id: 'loading', label: 'LOAD', ledColor: palette.led.blue },
  { id: 'error', label: 'ERR', ledColor: palette.led.red },
];

const DemoControl: React.FC<DemoControlProps> = ({ mode, onChange }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
      background: alpha(palette.bg.inset, 0.6),
      border: `1px solid ${alpha('#fff', 0.04)}`,
    }}
  >
    <Typography
      sx={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.5625rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: palette.text.tertiary,
      }}
    >
      Demo
    </Typography>
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {modes.map((m) => {
        const isActive = mode === m.id;
        return (
          <Tooltip
            key={m.id}
            title={
              m.id === 'live' ? 'Normal operation' : m.id === 'loading' ? 'Show loading skeletons' : 'Show error states'
            }
            arrow
            placement="top"
          >
            <Box
              onClick={() => onChange(m.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.35,
                borderRadius: 1,
                cursor: 'pointer',
                background: isActive
                  ? `linear-gradient(180deg, ${alpha(m.ledColor, 0.1)} 0%, transparent 100%)`
                  : 'transparent',
                border: `1px solid ${isActive ? alpha(m.ledColor, 0.2) : 'transparent'}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: alpha('#fff', 0.03),
                },
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: isActive ? m.ledColor : palette.led.off,
                  boxShadow: isActive ? `0 0 3px ${m.ledColor}` : 'none',
                  animation: isActive && m.id === 'live' ? 'ledPulse 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5rem',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.04em',
                  color: isActive ? m.ledColor : palette.text.disabled,
                  transition: 'color 0.2s ease',
                }}
              >
                {m.label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  </Box>
);

// ─── Dashboard Main Component ────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const [demoMode, setDemoMode] = useState<DemoMode>('live');
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [bootPhase, setBootPhase] = useState<'connecting' | 'synchronizing' | 'ready'>('connecting');

  // Simulate initial boot sequence on mount
  useEffect(() => {
    const phase1 = setTimeout(() => setBootPhase('synchronizing'), 800);
    const phase2 = setTimeout(() => {
      setBootPhase('ready');
      setIsBootLoading(false);
    }, 2000);
    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
    };
  }, []);

  // Error configs defined inside component to access setDemoMode
  const simulatedError = {
    title: 'Connection Timeout',
    message:
      'Failed to reach Midnight Preprod RPC endpoint after 3 retries. The network may be temporarily unavailable. Check your connection and try again.',
    severity: 'error' as const,
    retryable: true,
    dismissable: true,
    onRetry: () => setDemoMode('live'),
  };

  const simulatedCriticalError = {
    title: 'Proof Server Offline',
    message:
      'Zero-knowledge proof server at 127.0.0.1:6300 is not responding. Circuit execution cannot proceed without an active proof server. Start the server with: docker run -p 6300:6300 midnightnetwork/proof-server',
    severity: 'critical' as const,
    retryable: true,
    dismissable: true,
    onRetry: () => setDemoMode('live'),
  };

  // Derive props for each panel based on demo mode
  const isDemoLoading = demoMode === 'loading';
  const isDemoError = demoMode === 'error';

  const heroProps: HeroDashboardProps = {
    isLoading: isBootLoading || isDemoLoading,
    ...(isDemoError ? { error: simulatedError } : {}),
  };

  const proofProps: ProofEngineProps = {
    isLoading: isBootLoading || isDemoLoading,
    ...(isDemoError ? { error: simulatedCriticalError } : {}),
  };

  const walletProps: WalletCardProps = {
    isLoading: isBootLoading || isDemoLoading,
    ...(isDemoError ? { error: simulatedError } : {}),
  };

  const contractProps: ContractModuleProps = {
    isLoading: isBootLoading || isDemoLoading,
    ...(isDemoError ? { error: simulatedError } : {}),
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      {/* Boot Phase Indicator + Demo Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Boot status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isBootLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                background: alpha(palette.bg.inset, 0.6),
                border: `1px solid ${alpha('#fff', 0.03)}`,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: bootPhase === 'connecting' ? palette.led.amber : palette.led.blue,
                  boxShadow: `0 0 3px ${bootPhase === 'connecting' ? palette.led.amber : palette.led.blue}`,
                  animation: 'ledPulse 1s ease-in-out infinite',
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color:
                    bootPhase === 'connecting'
                      ? alpha(palette.accent.warning, 0.8)
                      : alpha(palette.accent.primary, 0.8),
                }}
              >
                {bootPhase === 'connecting' ? 'INITIALIZING...' : 'SYNCHRONIZING...'}
              </Typography>
            </Box>
          )}
          {!isBootLoading && !isDemoError && (
            <Chip
              icon={
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: palette.led.green,
                    boxShadow: `0 0 3px ${palette.led.green}`,
                    ml: 0.5,
                  }}
                />
              }
              label="SYSTEM READY"
              size="small"
              sx={{
                height: 22,
                bgcolor: alpha(palette.accent.success, 0.06),
                color: alpha(palette.accent.success, 0.8),
                borderColor: alpha(palette.accent.success, 0.1),
                '& .MuiChip-label': { fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.04em' },
              }}
            />
          )}
        </Box>

        {/* Demo controls */}
        {!isBootLoading && <DemoControl mode={demoMode} onChange={setDemoMode} />}
      </Box>

      {/* Hero Section — Full Width */}
      <HeroDashboard {...heroProps} />

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <ProofEngine {...proofProps} />
          <SecurityStatus />
        </Box>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <WalletCard {...walletProps} />
          <ContractModule {...contractProps} />
        </Box>
      </Box>

      {/* Transaction Timeline — Full Width */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <TransactionTimeline />
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
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                <Typography sx={{ fontSize: 12, color: alpha(palette.accent.primary, 0.7), fontWeight: 700 }}>
                  {'</>'}
                </Typography>
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
                System Console
              </Typography>
            </Box>

            {/* Console output */}
            <Box
              sx={{
                ...{
                  background: alpha('#000', 0.4),
                  border: `1px solid ${alpha('#fff', 0.03)}`,
                  borderRadius: 1,
                  p: 1.5,
                  fontFamily: '"JetBrains Mono", monospace',
                },
              }}
            >
              {isDemoError
                ? // Error console output
                  [
                    {
                      time: '14:32:01',
                      level: 'INFO',
                      msg: 'Wallet connected: 0x1a2b...9f8e',
                      color: palette.accent.info,
                    },
                    {
                      time: '14:32:02',
                      level: 'INFO',
                      msg: 'Proof server handshake initiated...',
                      color: palette.accent.info,
                    },
                    {
                      time: '14:32:05',
                      level: 'ERROR',
                      msg: 'Connection refused: port 6300',
                      color: palette.accent.error,
                    },
                    { time: '14:32:06', level: 'WARN', msg: 'Retry attempt 1/3...', color: palette.accent.warning },
                    { time: '14:32:09', level: 'WARN', msg: 'Retry attempt 2/3...', color: palette.accent.warning },
                    {
                      time: '14:32:12',
                      level: 'ERROR',
                      msg: 'Max retries exceeded. Circuit execution aborted.',
                      color: palette.accent.error,
                    },
                    {
                      time: '14:32:13',
                      level: 'CRIT',
                      msg: 'System degraded — proof server unavailable',
                      color: palette.accent.error,
                    },
                  ].map((line, i) => (
                    <Typography
                      key={i}
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.5625rem',
                        lineHeight: 1.8,
                        color: alpha('#fff', 0.4),
                        '& .level': { color: line.color, fontWeight: 600 },
                        '& .msg': { color: alpha('#fff', 0.65) },
                      }}
                    >
                      <span style={{ color: alpha('#fff', 0.2) }}>{line.time}</span>{' '}
                      <span className="level">[{line.level}]</span> <span className="msg">{line.msg}</span>
                    </Typography>
                  ))
                : isBootLoading || isDemoLoading
                  ? // Loading console output
                    [
                      {
                        time: '14:32:01',
                        level: 'INFO',
                        msg: 'Initializing wallet connection...',
                        color: palette.accent.info,
                      },
                      {
                        time: '14:32:02',
                        level: 'INFO',
                        msg: 'Establishing RPC session...',
                        color: palette.accent.info,
                      },
                      {
                        time: '14:32:05',
                        level: 'ZK',
                        msg: 'Loading circuit parameters...',
                        color: palette.accent.primary,
                      },
                      {
                        time: '14:32:08',
                        level: 'INFO',
                        msg: 'Synchronizing proof server state...',
                        color: palette.accent.info,
                      },
                    ].map((line, i) => (
                      <Typography
                        key={i}
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.5625rem',
                          lineHeight: 1.8,
                          color: alpha('#fff', 0.4),
                          '& .level': { color: line.color, fontWeight: 600 },
                          '& .msg': { color: alpha('#fff', 0.65) },
                        }}
                      >
                        <span style={{ color: alpha('#fff', 0.2) }}>{line.time}</span>{' '}
                        <span className="level">[{line.level}]</span> <span className="msg">{line.msg}</span>
                      </Typography>
                    ))
                  : // Normal console output
                    [
                      {
                        time: '14:32:01',
                        level: 'INFO',
                        msg: 'Wallet connected: 0x1a2b...9f8e',
                        color: palette.accent.info,
                      },
                      {
                        time: '14:32:02',
                        level: 'INFO',
                        msg: 'Proof server handshake complete',
                        color: palette.accent.info,
                      },
                      {
                        time: '14:32:05',
                        level: 'ZK',
                        msg: 'uploadVault circuit verified',
                        color: palette.accent.success,
                      },
                      {
                        time: '14:32:08',
                        level: 'ZK',
                        msg: 'shareVault circuit verified',
                        color: palette.accent.success,
                      },
                      {
                        time: '14:32:12',
                        level: 'INFO',
                        msg: 'Access audit logged to ledger',
                        color: palette.accent.info,
                      },
                      {
                        time: '14:32:15',
                        level: 'WARN',
                        msg: 'Proof server: 85% memory utilization',
                        color: palette.accent.warning,
                      },
                      {
                        time: '14:32:18',
                        level: 'INFO',
                        msg: 'All circuits nominal. System secure.',
                        color: palette.accent.success,
                      },
                    ].map((line, i) => (
                      <Typography
                        key={i}
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.5625rem',
                          lineHeight: 1.8,
                          color: alpha('#fff', 0.4),
                          '& .level': { color: line.color, fontWeight: 600 },
                          '& .msg': { color: alpha('#fff', 0.65) },
                        }}
                      >
                        <span style={{ color: alpha('#fff', 0.2) }}>{line.time}</span>{' '}
                        <span className="level">[{line.level}]</span> <span className="msg">{line.msg}</span>
                      </Typography>
                    ))}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 1,
                  pt: 1,
                  borderTop: `1px solid ${alpha('#fff', 0.03)}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: isDemoError ? palette.accent.error : palette.accent.success,
                    boxShadow: `0 0 4px ${isDemoError ? palette.accent.error : palette.accent.success}`,
                    animation: isDemoError ? 'none' : 'ledPulse 2s ease-in-out infinite',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.5625rem',
                    color: isDemoError ? alpha(palette.accent.error, 0.6) : alpha(palette.accent.success, 0.6),
                  }}
                >
                  {isDemoError ? 'DEGRADED' : isBootLoading || isDemoLoading ? 'Initializing...' : 'Monitoring...'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

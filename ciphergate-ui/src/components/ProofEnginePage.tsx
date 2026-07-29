// CipherGate Proof Engine Page — ZK Circuit Execution Console
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHighOutlined';
import { ProofEngine } from './Dashboard/ProofEngine';
import { CircuitExecutionStatus, useCircuitExecutionState } from './CircuitExecutionStatus';
import { palette } from '../config/theme';

export const ProofEnginePage: React.FC = () => {
  const { executionState, startExecution } = useCircuitExecutionState();

  useEffect(() => {
    const cleanup = startExecution('uploadVault');
    return () => cleanup?.();
  }, [startExecution]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        maxWidth: 1200,
        mx: 'auto',
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 1,
            background: alpha(palette.accent.primary, 0.1),
            border: `1px solid ${alpha(palette.accent.primary, 0.15)}`,
          }}
        >
          <AutoFixHighIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: palette.text.primary,
            }}
          >
            Proof Engine
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.6875rem',
              color: palette.text.tertiary,
              letterSpacing: '0.04em',
            }}
          >
            Zero-knowledge proof generation and circuit execution
          </Typography>
        </Box>
      </Box>

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: 2.5,
        }}
      >
        <ProofEngine />
        <CircuitExecutionStatus executionState={executionState} />
      </Box>
    </Box>
  );
};

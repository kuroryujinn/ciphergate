// CipherGate Contract Module — Industrial Server Blade Cards
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Typography, alpha, Button, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrowOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { palette } from '../../config/theme';
import { ContractModuleSkeleton } from './LoadingSkeleton';
import { ErrorPanel } from './ErrorPanel';
import type { ErrorPanelProps } from './ErrorPanel';

interface ContractData {
  name: string;
  status: 'active' | 'paused' | 'error';
  privacyEnabled: boolean;
  lastExecution: string;
  latency: string;
}

const sampleContracts: ContractData[] = [
  { name: 'uploadVault', status: 'active', privacyEnabled: true, lastExecution: '2 min ago', latency: '1.2s' },
  { name: 'shareVault', status: 'active', privacyEnabled: true, lastExecution: '5 min ago', latency: '0.9s' },
  { name: 'accessVault', status: 'active', privacyEnabled: true, lastExecution: '1 min ago', latency: '2.1s' },
  { name: 'revokeVault', status: 'paused', privacyEnabled: true, lastExecution: '1 hr ago', latency: '0.8s' },
];

const statusConfig = {
  active: { label: 'Active', color: palette.led.green },
  paused: { label: 'Paused', color: palette.led.amber },
  error: { label: 'Error', color: palette.led.red },
};

interface BladeCardProps {
  contract: ContractData;
}

const BladeCard: React.FC<BladeCardProps> = ({ contract }) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = statusConfig[contract.status];

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.5)} 0%, ${alpha(palette.bg.inset, 0.3)} 100%)`,
        border: `1px solid ${isHovered ? alpha(palette.accent.primary, 0.15) : alpha('#fff', 0.04)}`,
        borderRadius: 1,
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(palette.accent.primary, 0.2),
          boxShadow: `0 2px 12px ${alpha('#000', 0.3)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 8,
          bottom: 8,
          width: 2,
          borderRadius: 1,
          background: status.color,
          boxShadow: contract.status === 'active' ? `0 0 4px ${status.color}` : 'none',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <Box sx={{ pl: 2.5, pr: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 1,
              background: alpha(palette.accent.primary, 0.06),
              border: `1px solid ${alpha(palette.accent.primary, 0.08)}`,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.6) }} />
          </Box>

          {/* Contract info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: palette.text.primary,
                letterSpacing: '0.02em',
              }}
            >
              {contract.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: status.color,
                    boxShadow: contract.status === 'active' ? `0 0 2px ${status.color}` : 'none',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.5625rem',
                    fontWeight: 500,
                    color: palette.text.tertiary,
                  }}
                >
                  {status.label}
                </Typography>
              </Box>
              {contract.privacyEnabled && (
                <Chip
                  icon={<LockIcon sx={{ fontSize: 8, color: `${palette.accent.success} !important` }} />}
                  label="PRIVATE"
                  size="small"
                  sx={{
                    height: 14,
                    bgcolor: alpha(palette.accent.success, 0.06),
                    color: alpha(palette.accent.success, 0.7),
                    borderColor: alpha(palette.accent.success, 0.1),
                    '& .MuiChip-label': { fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.04em', px: 0.5 },
                    '& .MuiChip-icon': { ml: 0.25 },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.5rem',
                color: palette.text.tertiary,
                letterSpacing: '0.04em',
              }}
            >
              Last: {contract.lastExecution}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.5rem',
                color: palette.text.tertiary,
                letterSpacing: '0.04em',
                mt: 0.25,
              }}
            >
              Latency: {contract.latency}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5, pt: 1, borderTop: `1px solid ${alpha('#fff', 0.03)}` }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PlayArrowIcon sx={{ fontSize: 10 }} />}
            sx={{
              fontSize: '0.5625rem',
              py: 0.25,
              px: 1,
              color: palette.text.tertiary,
              borderColor: alpha('#fff', 0.06),
              '&:hover': {
                borderColor: alpha(palette.accent.primary, 0.2),
                color: palette.accent.primary,
              },
            }}
          >
            Execute
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon sx={{ fontSize: 10 }} />}
            sx={{
              fontSize: '0.5625rem',
              py: 0.25,
              px: 1,
              color: palette.text.tertiary,
              borderColor: alpha('#fff', 0.06),
              '&:hover': {
                borderColor: alpha(palette.accent.info, 0.2),
                color: palette.accent.info,
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export interface ContractModuleProps {
  isLoading?: boolean;
  error?: ErrorPanelProps | null;
}

export const ContractModule: React.FC<ContractModuleProps> = ({ isLoading, error }) => {
  if (isLoading) return <ContractModuleSkeleton />;
  if (error) return <ErrorPanel {...error} />;
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
          <DescriptionIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
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
          Contract Rack
        </Typography>
        <Chip
          label={`${sampleContracts.length} Deployed`}
          size="small"
          sx={{
            ml: 1,
            bgcolor: alpha(palette.accent.primary, 0.06),
            color: alpha(palette.accent.primary, 0.7),
            borderColor: alpha(palette.accent.primary, 0.1),
            height: 18,
            '& .MuiChip-label': { fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.04em' },
          }}
        />
      </Box>

      {/* Blade rack */}
      <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sampleContracts.map((contract) => (
          <BladeCard key={contract.name} contract={contract} />
        ))}
      </Box>
    </Box>
  );
};

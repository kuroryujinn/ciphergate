// CipherGate LoadingSkeleton — Skeuomorphic Hardware Loading States
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, alpha, Skeleton } from '@mui/material';
import { palette } from '../../config/theme';

// ─── Panel Wrapper ───────────────────────────────────────────────────────────

interface PanelSkeletonProps {
  children: React.ReactNode;
}

const PanelWrapper: React.FC<PanelSkeletonProps> = ({ children }) => (
  <Box
    sx={{
      background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.4)} 0%, transparent 100%)`,
      border: `1px solid ${alpha('#fff', 0.04)}`,
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
        background: `linear-gradient(90deg, transparent, ${alpha(palette.accent.primary, 0.08)}, transparent)`,
      },
    }}
  >
    {children}
  </Box>
);

// ─── Hardware Skeleton Element ───────────────────────────────────────────────

interface HardwareSkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
}

const HardwareSkeleton: React.FC<HardwareSkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'rounded',
}) => (
  <Skeleton
    variant={variant}
    width={width}
    height={height}
    sx={{
      bgcolor: alpha(palette.metal.titanium, 0.5),
      borderRadius: variant === 'rounded' ? 1 : variant === 'circular' ? '50%' : 0,
      transform: 'none',
      border: `1px solid ${alpha('#fff', 0.03)}`,
      '&::after': {
        background: `linear-gradient(90deg, transparent, ${alpha(palette.metal.aluminum, 0.3)}, transparent)`,
      },
    }}
  />
);

// ─── OLED Display Skeleton ───────────────────────────────────────────────────

export const OLEDSkeleton: React.FC = () => (
  <Box
    sx={{
      background: `linear-gradient(180deg, ${alpha(palette.bg.inset, 0.9)} 0%, ${alpha('#000', 0.95)} 100%)`,
      border: `1px solid ${alpha('#fff', 0.03)}`,
      borderRadius: 1,
      boxShadow: `inset 0 2px 4px ${alpha('#000', 0.5)}`,
      padding: '14px 16px',
      minWidth: 160,
    }}
  >
    <HardwareSkeleton width="70%" height={8} />
    <Box sx={{ mt: 1.5 }} />
    <HardwareSkeleton width="90%" height={14} />
  </Box>
);

// ─── HeroDashboard Skeleton ──────────────────────────────────────────────────

export const HeroDashboardSkeleton: React.FC = () => (
  <PanelWrapper>
    <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <HardwareSkeleton width={24} height={24} variant="rounded" />
      <HardwareSkeleton width={180} height={14} />
      <HardwareSkeleton width={120} height={18} variant="rounded" />
    </Box>
    <Box
      sx={{
        px: 3,
        pb: 3,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 1.5,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <OLEDSkeleton key={i} />
      ))}
    </Box>
  </PanelWrapper>
);

// ─── ProofEngine Skeleton ────────────────────────────────────────────────────

/** Deterministic bar heights that don't change on re-render */
const cpuBarHeights = Array.from({ length: 24 }, (_, i) => ((i * 7 + 13) % 28) + 10);

export const ProofEngineSkeleton: React.FC = () => (
  <PanelWrapper>
    <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <HardwareSkeleton width={24} height={24} variant="rounded" />
      <HardwareSkeleton width={120} height={14} />
      <Box sx={{ ml: 'auto' }} />
      <HardwareSkeleton width={100} height={14} />
    </Box>
    <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Progress bars */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[0, 1].map((i) => (
          <Box key={i}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <HardwareSkeleton width={120} height={8} />
              <HardwareSkeleton width={40} height={8} />
            </Box>
            <HardwareSkeleton height={6} variant="rounded" />
          </Box>
        ))}
      </Box>
      {/* CPU Activity */}
      <Box
        sx={{
          background: `linear-gradient(180deg, ${alpha(palette.bg.inset, 0.9)} 0%, ${alpha('#000', 0.95)} 100%)`,
          border: `1px solid ${alpha('#fff', 0.03)}`,
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <HardwareSkeleton width={180} height={8} />
        <Box sx={{ mt: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end', height: 40 }}>
          {cpuBarHeights.map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: `${h}px`,
                borderRadius: '1px 1px 0 0',
                bgcolor: alpha(palette.metal.titanium, 0.5),
                border: `1px solid ${alpha('#fff', 0.03)}`,
              }}
            />
          ))}
        </Box>
      </Box>
      {/* Circuit stages */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              borderRadius: 1,
              bgcolor: alpha(palette.metal.titanium, 0.3),
            }}
          >
            <HardwareSkeleton width={6} height={6} variant="circular" />
            <HardwareSkeleton width={100} height={10} />
          </Box>
        ))}
      </Box>
      {/* Estimated completion */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: palette.bg.inset,
        }}
      >
        <HardwareSkeleton width={140} height={8} />
        <HardwareSkeleton width={80} height={8} />
      </Box>
    </Box>
  </PanelWrapper>
);

// ─── WalletCard Skeleton ─────────────────────────────────────────────────────

export const WalletCardSkeleton: React.FC = () => (
  <PanelWrapper>
    <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <HardwareSkeleton width={24} height={24} variant="rounded" />
      <HardwareSkeleton width={160} height={14} />
    </Box>
    <Box sx={{ px: 3, pb: 2 }}>
      <Box
        sx={{
          background: `linear-gradient(180deg, ${alpha(palette.bg.inset, 0.9)} 0%, ${alpha('#000', 0.95)} 100%)`,
          border: `1px solid ${alpha('#fff', 0.03)}`,
          borderRadius: 1,
          p: 2,
        }}
      >
        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <HardwareSkeleton width={5} height={5} variant="circular" />
          <Box sx={{ ml: 'auto' }}>
            <HardwareSkeleton width={80} height={8} />
          </Box>
        </Box>
        {/* Address */}
        <HardwareSkeleton width={60} height={8} />
        <Box sx={{ mt: 0.5 }} />
        <HardwareSkeleton width={180} height={14} />
        <Box sx={{ mt: 1.5 }} />
        {/* Balance + Network */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Box>
            <HardwareSkeleton width={50} height={8} />
            <Box sx={{ mt: 0.25 }} />
            <HardwareSkeleton width={90} height={12} />
          </Box>
          <Box>
            <HardwareSkeleton width={50} height={8} />
            <Box sx={{ mt: 0.25 }} />
            <HardwareSkeleton width={110} height={12} />
          </Box>
        </Box>
        {/* Fingerprint */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: `1px solid ${alpha('#fff', 0.03)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <HardwareSkeleton width={14} height={14} variant="rounded" />
          <HardwareSkeleton width={110} height={8} />
          <Box sx={{ flex: 1 }} />
          <HardwareSkeleton width={50} height={14} variant="rounded" />
        </Box>
      </Box>
    </Box>
  </PanelWrapper>
);

// ─── ContractModule Skeleton ─────────────────────────────────────────────────

export const ContractModuleSkeleton: React.FC = () => (
  <PanelWrapper>
    <Box sx={{ px: 3, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <HardwareSkeleton width={24} height={24} variant="rounded" />
      <HardwareSkeleton width={120} height={14} />
      <HardwareSkeleton width={80} height={18} variant="rounded" />
    </Box>
    <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            background: `linear-gradient(180deg, ${alpha(palette.bg.surface, 0.5)} 0%, ${alpha(palette.bg.inset, 0.3)} 100%)`,
            border: `1px solid ${alpha('#fff', 0.04)}`,
            borderRadius: 1,
            pl: 2.5,
            pr: 2,
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HardwareSkeleton width={28} height={28} variant="rounded" />
            <Box sx={{ flex: 1 }}>
              <HardwareSkeleton width={120} height={12} />
              <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                <HardwareSkeleton width={50} height={8} />
                <HardwareSkeleton width={60} height={8} />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <HardwareSkeleton width={70} height={7} />
              <Box sx={{ mt: 0.25 }} />
              <HardwareSkeleton width={70} height={7} />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              mt: 1.5,
              pt: 1,
              borderTop: `1px solid ${alpha('#fff', 0.03)}`,
            }}
          >
            <HardwareSkeleton width={70} height={18} variant="rounded" />
            <HardwareSkeleton width={80} height={18} variant="rounded" />
          </Box>
        </Box>
      ))}
    </Box>
  </PanelWrapper>
);

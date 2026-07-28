// CipherGate Architecture Visualization Page
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, Card, CardContent, alpha } from '@mui/material';
import DevicesIcon from '@mui/icons-material/DevicesOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';
import MemoryIcon from '@mui/icons-material/MemoryOutlined';
import DnsIcon from '@mui/icons-material/DnsOutlined';
import CloudIcon from '@mui/icons-material/CloudOutlined';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import { palette } from '../config/theme';

interface LayerProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  available: boolean;
}

const LayerCard: React.FC<LayerProps> = ({ icon, title, description, accent, available }) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, ${alpha('#12162a', 0.95)} 0%, ${alpha('#1e2240', 0.6)} 100%)`,
      border: `1px solid ${available ? alpha(accent, 0.2) : alpha('#ef4444', 0.2)}`,
      borderRadius: 2,
      opacity: available ? 1 : 0.6,
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: available ? alpha(accent, 0.4) : alpha('#ef4444', 0.3),
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -1,
        left: 24,
        right: 24,
        height: 2,
        borderRadius: 1,
        background: available
          ? `linear-gradient(90deg, ${alpha(accent, 0.3)}, ${alpha(accent, 0.8)}, ${alpha(accent, 0.3)})`
          : `linear-gradient(90deg, ${alpha('#ef4444', 0.3)}, ${alpha('#ef4444', 0.8)}, ${alpha('#ef4444', 0.3)})`,
      }}
    />
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            minWidth: 40,
            background: alpha(accent, 0.1),
            border: `1px solid ${alpha(accent, 0.2)}`,
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: accent,
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </Typography>
            {!available && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.15,
                  borderRadius: 1,
                  background: alpha('#ef4444', 0.1),
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 10, color: '#ef4444' }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#ef4444', fontWeight: 600, fontSize: '0.55rem', letterSpacing: '0.05em' }}
                >
                  UNAVAILABLE
                </Typography>
              </Box>
            )}
            {available && <CheckCircleIcon sx={{ fontSize: 14, color: palette.accent.success }} />}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontSize: '0.7rem',
              lineHeight: 1.5,
              display: 'block',
              mt: 0.25,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const FlowArrow: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
    <ArrowDownwardIcon sx={{ color: alpha('#fff', 0.15), fontSize: 20 }} />
  </Box>
);

export const ArchitecturePage: React.FC = () => {
  const layers: LayerProps[] = [
    {
      icon: <DevicesIcon sx={{ fontSize: 20 }} />,
      title: '1. Frontend (React 19 + MUI 9)',
      description:
        'React 19 single-page application with Material UI 9. Built with Vite 8. Communicates with the Midnight SDK through the CipherGate API layer.',
      accent: palette.accent.primary,
      available: true,
    },
    {
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />,
      title: '2. Midnight 1AM Wallet',
      description:
        'Browser extension wallet (dapp-connector-api 4.x). Manages keys, signs transactions, and provides the connection to Midnight Network.',
      accent: palette.accent.primary,
      available: true,
    },
    {
      icon: <CodeIcon sx={{ fontSize: 20 }} />,
      title: '3. Midnight SDK (Compact Runtime)',
      description:
        'Midnight.js SDK provides providers for proof generation, indexer queries, ZK config, and contract deployment. The CipherGateAPI class wraps all SDK interactions.',
      accent: palette.accent.primary,
      available: true,
    },
    {
      icon: <MemoryIcon sx={{ fontSize: 20 }} />,
      title: '4. Circuit Bindings (TypeScript)',
      description:
        'Compiled Compact contracts produce TypeScript bindings with typed circuit calls. Four circuits: uploadVault, shareVault, accessVault, revokeVault.',
      accent: '#7dd3fc',
      available: true,
    },
    {
      icon: <DnsIcon sx={{ fontSize: 20 }} />,
      title: '5. Compact Circuits (Zero-Knowledge)',
      description:
        'Custom Compact language smart contracts that define the vault state machine and ZK proof logic. Circuits assert authorization without revealing secrets.',
      accent: palette.accent.info,
      available: true,
    },
    {
      icon: <CloudIcon sx={{ fontSize: 20 }} />,
      title: '6. Proof Server (Docker)',
      description:
        'Midnight proof server generates zero-knowledge proofs for each circuit call. Required for all contract transactions. Run locally via docker: midnightnetwork/proof-server.',
      accent: palette.accent.info,
      available: true,
    },
    {
      icon: <StorageIcon sx={{ fontSize: 20 }} />,
      title: '7. Midnight Preprod Network',
      description:
        'The target network for contract deployment. Provides indexer (GraphQL), RPC node, and WebSocket endpoints. Currently the Preprod RPC and proof server infrastructure are unavailable.',
      accent: '#ef4444',
      available: false,
    },
    {
      icon: <StorageIcon sx={{ fontSize: 20 }} />,
      title: '8. Midnight Ledger',
      description:
        'The distributed ledger stores public contract state: vault lifecycle, public key commitments, and opaque encrypted payloads. Verifies ZK proofs without learning private inputs.',
      accent: '#ef4444',
      available: false,
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', md: '2rem' },
            letterSpacing: '-0.02em',
            mb: 1,
            background: `linear-gradient(135deg, ${palette.accent.primary}, ${palette.accent.info})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Architecture
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 600, lineHeight: 1.7 }}>
          The full technology stack powering CipherGate — from the React frontend down to the Midnight ledger.
          Components marked as unavailable depend on infrastructure that is currently offline.
        </Typography>
      </Box>

      {/* Layer Stack */}
      <Box>
        {layers.map((layer, index) => (
          <React.Fragment key={layer.title}>
            <LayerCard {...layer} />
            {index < layers.length - 1 && <FlowArrow />}
          </React.Fragment>
        ))}
      </Box>

      {/* Unavailable Notice */}
      <Card
        sx={{
          mt: 4,
          background: `linear-gradient(135deg, ${alpha('#ef4444', 0.06)} 0%, transparent 100%)`,
          border: `1px solid ${alpha('#ef4444', 0.15)}`,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 20 }} />
            <Typography
              variant="subtitle2"
              sx={{
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.05em',
              }}
            >
              Deployment Infrastructure Unavailable
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              fontSize: '0.8125rem',
              lineHeight: 1.7,
            }}
          >
            The Midnight Preprod RPC and proof server are currently unavailable, making live deployment impossible. All
            deployment scripts are implemented and ready. Deployment will be completed once the infrastructure becomes
            available. The frontend, wallet integration, circuit bindings, and testing pipeline are fully functional and
            have been verified locally.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

// CipherGate Empty Vault Card
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { CardActions, CardContent, IconButton, Tooltip, Typography, Box, alpha, Zoom } from '@mui/material';
import VaultAddIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import CreateVaultIcon from '@mui/icons-material/AddCircleOutlined';
import JoinVaultIcon from '@mui/icons-material/AddLinkOutlined';
import { TextPromptDialog } from './TextPromptDialog';
import { colors } from '../config/theme';

export interface EmptyVaultCardContentProps {
  onCreateVaultCallback: () => void;
  onJoinVaultCallback: (contractAddress: ContractAddress) => void;
}

export const EmptyVaultCardContent: React.FC<Readonly<EmptyVaultCardContentProps>> = ({
  onCreateVaultCallback,
  onJoinVaultCallback,
}) => {
  const [textPromptOpen, setTextPromptOpen] = useState(false);

  return (
    <React.Fragment>
      <CardContent sx={{ pb: 0 }}>
        {/* Animated icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
            mt: 1,
          }}
        >
          <Zoom in timeout={500}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(colors.cyberTeal, 0.12)} 0%, ${alpha(colors.electricViolet, 0.08)} 100%)`,
                border: `1px solid ${alpha(colors.cyberTeal, 0.15)}`,
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              <VaultAddIcon sx={{ color: colors.cyberTeal, fontSize: 32 }} />
            </Box>
          </Zoom>
        </Box>

        <Typography
          data-testid="vault-empty-message"
          align="center"
          variant="body2"
          sx={{
            color: '#94a3b8',
            fontWeight: 400,
            maxWidth: 220,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Deploy a new encrypted vault or join an existing one to get started.
        </Typography>
      </CardContent>

      <CardActions disableSpacing sx={{ justifyContent: 'center', gap: 1, pt: 1.5, pb: 2.5 }}>
        <Tooltip title="Deploy new vault" arrow placement="top">
          <IconButton
            data-testid="vault-deploy-btn"
            onClick={onCreateVaultCallback}
            size="small"
            sx={{
              color: colors.cyberTeal,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.primary.main, 0.15),
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                transform: 'scale(1.05)',
              },
            }}
          >
            <CreateVaultIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Join existing vault" arrow placement="top">
          <IconButton
            data-testid="vault-join-btn"
            onClick={() => setTextPromptOpen(true)}
            size="small"
            sx={{
              color: colors.electricViolet,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.08),
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.secondary.main, 0.15),
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.15),
                transform: 'scale(1.05)',
              },
            }}
          >
            <JoinVaultIcon />
          </IconButton>
        </Tooltip>
      </CardActions>

      <TextPromptDialog
        prompt="Enter contract address"
        isOpen={textPromptOpen}
        onCancel={() => setTextPromptOpen(false)}
        onSubmit={(text) => {
          setTextPromptOpen(false);
          onJoinVaultCallback(text);
        }}
      />
    </React.Fragment>
  );
};

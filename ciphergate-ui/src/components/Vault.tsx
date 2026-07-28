// CipherGate Vault Card Component
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Backdrop,
  CircularProgress,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Typography,
  TextField,
  Chip,
  Box,
  alpha,
  Tooltip,
  Zoom,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import UploadIcon from '@mui/icons-material/CloudUploadOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import RevokeIcon from '@mui/icons-material/BlockOutlined';
import CopyIcon from '@mui/icons-material/ContentPasteOutlined';
import VaultIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import KeyIcon from '@mui/icons-material/VpnKeyOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import { type CipherGateDerivedState, type DeployedCipherGateAPI } from '../../../api/src/index';
import { useDeployedVaultContext } from '../hooks';
import { type VaultDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { State } from '../../../contract/src/index';
import { EmptyVaultCardContent } from './Vault.EmptyCardContent';
import { CircuitExecutionStatus, useCircuitExecutionState } from './CircuitExecutionStatus';
import { palette } from '../config/theme';

export interface VaultProps {
  vaultDeployment$?: Observable<VaultDeployment>;
}

export const Vault: React.FC<Readonly<VaultProps>> = ({ vaultDeployment$ }) => {
  const vaultApiProvider = useDeployedVaultContext();
  const [vaultDeployment, setVaultDeployment] = useState<VaultDeployment>();
  const [deployedVaultAPI, setDeployedVaultAPI] = useState<DeployedCipherGateAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [vaultState, setVaultState] = useState<CipherGateDerivedState>();
  const [payloadPrompt, setPayloadPrompt] = useState<string>();
  const [recipientPrompt, setRecipientPrompt] = useState<string>();
  const [sharingKeyPrompt, setSharingKeyPrompt] = useState<string>();
  const [accessResult, setAccessResult] = useState<string>();
  const [isWorking, setIsWorking] = useState(!!vaultDeployment$);
  const [copied, setCopied] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);
  const [showExecStatus, setShowExecStatus] = useState<string | undefined>();
  const { executionState, startExecution, resetExecution } = useCircuitExecutionState();

  const onCreateVault = useCallback(() => vaultApiProvider.resolve(), [vaultApiProvider]);
  const onJoinVault = useCallback(
    (contractAddress: ContractAddress) => vaultApiProvider.resolve(contractAddress),
    [vaultApiProvider],
  );

  const withCircuitStatus = async (circuitName: string, operation: () => Promise<void>) => {
    setShowExecStatus(circuitName);
    const cleanup = startExecution(circuitName);
    setIsWorking(true);
    try {
      await operation();
      setIsWorking(false);
      cleanup();
      resetExecution();
      setShowExecStatus(undefined);
    } catch (error: unknown) {
      setIsWorking(false);
      cleanup();
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const onUploadVault = useCallback(async () => {
    if (!payloadPrompt || !deployedVaultAPI) return;
    await withCircuitStatus('uploadVault', async () => {
      await deployedVaultAPI.uploadVault(payloadPrompt);
      setPayloadPrompt('');
    });
  }, [deployedVaultAPI, payloadPrompt, withCircuitStatus]);

  const onShareVault = useCallback(async () => {
    if (!recipientPrompt || !sharingKeyPrompt || !deployedVaultAPI) return;
    await withCircuitStatus('shareVault', async () => {
      await deployedVaultAPI.shareVault(recipientPrompt, sharingKeyPrompt);
      setRecipientPrompt('');
      setSharingKeyPrompt('');
    });
  }, [deployedVaultAPI, recipientPrompt, sharingKeyPrompt, withCircuitStatus]);

  const onAccessVault = useCallback(async () => {
    if (!deployedVaultAPI) return;
    await withCircuitStatus('accessVault', async () => {
      const key = await deployedVaultAPI.accessVault();
      setAccessResult(key);
    });
  }, [deployedVaultAPI, withCircuitStatus]);

  const onRevokeVault = useCallback(async () => {
    if (!deployedVaultAPI) return;
    setShowConfirmRevoke(false);
    await withCircuitStatus('revokeVault', async () => {
      await deployedVaultAPI.revokeVault();
      setAccessResult(undefined);
    });
  }, [deployedVaultAPI, withCircuitStatus]);

  const handleRevokeClick = useCallback(() => {
    setShowConfirmRevoke(true);
  }, []);

  const handleCancelRevoke = useCallback(() => {
    setShowConfirmRevoke(false);
  }, []);

  const onCopyContractAddress = useCallback(async () => {
    if (deployedVaultAPI) {
      await navigator.clipboard.writeText(deployedVaultAPI.deployedContractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [deployedVaultAPI]);

  useEffect(() => {
    if (!vaultDeployment$) return;
    const subscription = vaultDeployment$.subscribe(setVaultDeployment);
    return () => subscription.unsubscribe();
  }, [vaultDeployment$]);

  useEffect(() => {
    if (!vaultDeployment) return;
    if (vaultDeployment.status === 'in-progress') return;

    setIsWorking(false);

    if (vaultDeployment.status === 'failed') {
      setErrorMessage(
        vaultDeployment.error.message.length ? vaultDeployment.error.message : 'Encountered an unexpected error.',
      );
      return;
    }

    setDeployedVaultAPI(vaultDeployment.api);
    const subscription = vaultDeployment.api.state$.subscribe(setVaultState);
    return () => subscription.unsubscribe();
  }, [vaultDeployment]);

  const stateLabel =
    vaultState?.state === State.VACANT ? 'Empty' : vaultState?.state === State.PRIVATE ? 'Private' : 'Shared';

  const roleLabel = vaultState?.isOwner ? 'Owner' : vaultState?.isRecipient ? 'Recipient' : 'Viewer';

  /**
   * Returns the accent colour for the current vault state.
   */
  const stateAccent = (opacity = 1) => {
    if (!vaultState) return alpha(palette.accent.primary, 0.3 * opacity);
    switch (vaultState.state) {
      case State.SHARED:
        return alpha(palette.accent.primary, opacity);
      case State.PRIVATE:
        return alpha(palette.accent.success, opacity);
      default:
        return alpha(palette.accent.warning, opacity);
    }
  };

  return (
    <Fade in timeout={400}>
      <Card
        sx={{
          position: 'relative',
          width: 360,
          minWidth: 360,
          overflow: 'visible',
          animation: vaultDeployment$ ? 'fadeInUp 0.4s ease-out' : 'none',
        }}
      >
        {/* State indicator bar across top */}
        {vaultState && (
          <Box
            sx={{
              position: 'absolute',
              top: -1,
              left: 24,
              right: 24,
              height: 2,
              borderRadius: 1,
              background: `linear-gradient(90deg, ${stateAccent(0.4)}, ${stateAccent(0.8)}, ${stateAccent(0.4)})`,
              opacity: 0.8,
            }}
          />
        )}

        {!vaultDeployment$ && (
          <EmptyVaultCardContent onCreateVaultCallback={onCreateVault} onJoinVaultCallback={onJoinVault} />
        )}

        {vaultDeployment$ && (
          <React.Fragment>
            {/* Working spinner overlay */}
            <Backdrop
              sx={{
                position: 'absolute',
                zIndex: (t) => t.zIndex.drawer + 1,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
              open={isWorking}
            >
              {showExecStatus ? (
                <Box sx={{ minWidth: 280, maxWidth: 320 }}>
                  <CircuitExecutionStatus executionState={executionState} />
                </Box>
              ) : (
                <React.Fragment>
                  <CircularProgress
                    data-testid="vault-working-indicator"
                    size={32}
                    thickness={3}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.main', fontWeight: 500, letterSpacing: '0.05em' }}
                  >
                    Processing...
                  </Typography>
                </React.Fragment>
              )}
            </Backdrop>

            {/* Error overlay */}
            <Backdrop
              sx={{
                position: 'absolute',
                zIndex: (t) => t.zIndex.drawer + 2,
                borderRadius: 3,
                flexDirection: 'column',
                gap: 1,
                cursor: 'pointer',
              }}
              open={!!errorMessage}
              onClick={() => setErrorMessage(undefined)}
            >
              <Typography
                variant="body2"
                data-testid="vault-error-message"
                sx={{ color: palette.accent.error, textAlign: 'center', px: 2, fontFamily: 'monospace', fontSize: 11 }}
              >
                {errorMessage}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha(palette.accent.error, 0.5), mt: 0.5 }}>
                Tap to dismiss
              </Typography>
            </Backdrop>

            <CardHeader
              avatar={
                <Zoom in={!!vaultState}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: (t) => alpha(t.palette.primary.main, 0.1),
                      border: '1px solid',
                      borderColor: (t) => alpha(t.palette.primary.main, 0.15),
                    }}
                  >
                    {vaultState ? (
                      vaultState.state === State.SHARED ? (
                        <LockOpenIcon data-testid="vault-shared-icon" sx={{ color: palette.accent.primary, fontSize: 18 }} />
                      ) : (
                        <LockIcon data-testid="vault-locked-icon" sx={{ color: palette.accent.primary, fontSize: 18 }} />
                      )
                    ) : (
                      <Skeleton variant="circular" width={20} height={20} />
                    )}
                  </Box>
                </Zoom>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <VaultIcon sx={{ fontSize: 14, color: (t) => alpha(t.palette.primary.main, 0.5) }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: (t) => alpha(t.palette.primary.main, 0.8),
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {toShortFormatContractAddress(deployedVaultAPI?.deployedContractAddress) ?? 'Loading...'}
                  </Typography>
                </Box>
              }
              subheader={
                vaultState ? (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      icon={
                        vaultState.state === State.SHARED ? (
                          <LockOpenIcon sx={{ fontSize: 10, color: `${palette.accent.primary} !important` }} />
                        ) : vaultState.state === State.PRIVATE ? (
                          <LockIcon sx={{ fontSize: 10, color: `${palette.accent.success} !important` }} />
                        ) : (
                          <VaultIcon sx={{ fontSize: 10, color: `${palette.accent.warning} !important` }} />
                        )
                      }
                      label={stateLabel}
                      size="small"
                      sx={{
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        color: stateAccent(0.9),
                        border: '1px solid',
                        borderColor: (t) => alpha(t.palette.primary.main, 0.1),
                        height: 20,
                        '& .MuiChip-icon': { ml: 0.5 },
                      }}
                    />
                    <Chip
                      icon={<PersonIcon sx={{ fontSize: 10, color: `${palette.accent.info} !important` }} />}
                      label={roleLabel}
                      size="small"
                      sx={{
                        bgcolor: (t) => alpha(t.palette.secondary.main, 0.08),
                        color: (t) => alpha(t.palette.secondary.main, 0.9),
                        border: '1px solid',
                        borderColor: (t) => alpha(t.palette.secondary.main, 0.1),
                        height: 20,
                        '& .MuiChip-icon': { ml: 0.5 },
                      }}
                    />
                    <Chip
                      icon={<KeyIcon sx={{ fontSize: 10, color: `${palette.accent.warning} !important` }} />}
                      label={`Audit: ${vaultState.accessCount.toString()}`}
                      size="small"
                      sx={{
                        bgcolor: alpha(palette.accent.warning, 0.08),
                        color: alpha(palette.accent.warning, 0.9),
                        border: '1px solid',
                        borderColor: alpha(palette.accent.warning, 0.1),
                        height: 20,
                        '& .MuiChip-icon': { ml: 0.5 },
                      }}
                    />
                  </Box>
                ) : undefined
              }
              action={
                deployedVaultAPI?.deployedContractAddress ? (
                  <Tooltip title={copied ? 'Copied!' : 'Copy contract address'} arrow>
                    <IconButton
                      onClick={onCopyContractAddress}
                      size="small"
                      sx={{
                        color: copied ? palette.accent.success : (t) => alpha(t.palette.primary.main, 0.5),
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circular" width={24} height={24} />
                )
              }
              sx={{ pb: 0 }}
            />

            <CardContent sx={{ minHeight: 180, pt: 2 }}>
              {vaultState ? (
                <Box sx={{ animation: 'fadeInUp 0.3s ease-out' }}>
                  {/* VACANT — upload form */}
                  {vaultState.state === State.VACANT && vaultState.isOwner !== false && (
                    <TextField
                      id="payload-prompt"
                      data-testid="vault-payload-prompt"
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Paste encrypted file metadata here..."
                      size="small"
                      value={payloadPrompt ?? ''}
                      onChange={(e) => setPayloadPrompt(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 11,
                          color: '#cbd5e1',
                        },
                      }}
                    />
                  )}

                  {/* PRIVATE / SHARED — payload display */}
                  {(vaultState.state === State.PRIVATE || vaultState.state === State.SHARED) && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha('#000', 0.25),
                        border: '1px solid',
                        borderColor: (t) => alpha(t.palette.divider, 0.5),
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          fontSize: 10,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        Encrypted Payload
                      </Typography>
                      <Typography
                        data-testid="vault-encrypted-payload"
                        sx={{
                          color: '#94a3b8',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 11,
                          wordBreak: 'break-all',
                          lineHeight: 1.5,
                        }}
                      >
                        {vaultState.encryptedPayload ?? (
                          <Box component="span" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                            No payload stored
                          </Box>
                        )}
                      </Typography>
                    </Box>
                  )}

                  {/* PRIVATE + OWNER — sharing form */}
                  {vaultState.state === State.PRIVATE && vaultState.isOwner && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          fontSize: 10,
                        }}
                      >
                        Share Vault
                      </Typography>
                      <TextField
                        id="recipient-prompt"
                        data-testid="vault-recipient-prompt"
                        variant="outlined"
                        fullWidth
                        size="small"
                        placeholder="Recipient public key (hex)"
                        value={recipientPrompt ?? ''}
                        onChange={(e) => setRecipientPrompt(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 11,
                            color: '#cbd5e1',
                          },
                        }}
                      />
                      <TextField
                        id="sharing-key-prompt"
                        data-testid="vault-sharing-key-prompt"
                        variant="outlined"
                        fullWidth
                        size="small"
                        placeholder="Encrypted sharing key (symmetric)"
                        value={sharingKeyPrompt ?? ''}
                        onChange={(e) => setSharingKeyPrompt(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 11,
                            color: '#cbd5e1',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* SHARED — access result display */}
                  {vaultState.state === State.SHARED && accessResult && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: (t) => alpha(t.palette.success.main, 0.06),
                        border: '1px solid',
                        borderColor: (t) => alpha(t.palette.success.main, 0.12),
                        animation: 'fadeInUp 0.3s ease-out',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'success.main',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          fontSize: 10,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        Sharing Key Retrieved
                      </Typography>
                      <Typography
                        data-testid="vault-access-result"
                        sx={{
                          color: '#86efac',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 11,
                          wordBreak: 'break-all',
                          lineHeight: 1.5,
                        }}
                      >
                        {accessResult}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ px: 1 }}>
                  <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: 2 }} />
                </Box>
              )}
            </CardContent>

            <CardActions sx={{ justifyContent: 'center', gap: 0.5, pb: 2, pt: 0 }}>
              {deployedVaultAPI && vaultState ? (
                <React.Fragment>
                  {vaultState.state === State.VACANT && (
                    <Tooltip title="Upload encrypted vault" arrow placement="top">
                      <span>
                        <IconButton
                          data-testid="vault-upload-btn"
                          disabled={!payloadPrompt?.length}
                          onClick={onUploadVault}
                          size="small"
                          sx={{
                            color: palette.accent.primary,
                            bgcolor: (t) =>
                              payloadPrompt?.length ? alpha(t.palette.primary.main, 0.08) : 'transparent',
                            '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.15) },
                            '&.Mui-disabled': { opacity: 0.2 },
                          }}
                        >
                          <UploadIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {vaultState.state === State.PRIVATE && vaultState.isOwner && (
                    <Tooltip title="Share vault with recipient" arrow placement="top">
                      <span>
                        <IconButton
                          data-testid="vault-share-btn"
                          disabled={!recipientPrompt?.length || !sharingKeyPrompt?.length}
                          onClick={onShareVault}
                          size="small"
                          sx={{
                            color: palette.accent.info,
                            bgcolor: (t) =>
                              recipientPrompt?.length && sharingKeyPrompt?.length
                                ? alpha(t.palette.secondary.main, 0.08)
                                : 'transparent',
                            '&:hover': { bgcolor: (t) => alpha(t.palette.secondary.main, 0.15) },
                            '&.Mui-disabled': { opacity: 0.2 },
                          }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {vaultState.state === State.SHARED && (vaultState.isOwner || vaultState.isRecipient) && (
                    <Tooltip title="Access vault (creates audit entry)" arrow placement="top">
                      <IconButton
                        data-testid="vault-access-btn"
                        onClick={onAccessVault}
                        size="small"
                        sx={{
                          color: palette.accent.success,
                          bgcolor: (t) => alpha(t.palette.success.main, 0.08),
                          '&:hover': { bgcolor: (t) => alpha(t.palette.success.main, 0.15) },
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {(vaultState.state === State.SHARED || vaultState.state === State.PRIVATE) && vaultState.isOwner && (
                    <Tooltip
                      title={vaultState.state === State.PRIVATE ? 'Already private' : 'Revoke sharing access'}
                      arrow
                      placement="top"
                    >
                      <span>
                        <IconButton
                          data-testid="vault-revoke-btn"
                          disabled={vaultState.state === State.PRIVATE}
                          onClick={handleRevokeClick}
                          size="small"
                          sx={{
                            color: palette.accent.error,
                            bgcolor: (t) =>
                              vaultState.state === State.SHARED ? alpha(t.palette.error.main, 0.08) : 'transparent',
                            '&:hover': { bgcolor: (t) => alpha(t.palette.error.main, 0.15) },
                            '&.Mui-disabled': { opacity: 0.2 },
                          }}
                        >
                          <RevokeIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </React.Fragment>
              ) : (
                <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: 2 }} />
              )}
            </CardActions>
          </React.Fragment>
        )}

        {/* Revoke Confirmation Dialog */}
        <Dialog
          open={showConfirmRevoke}
          onClose={handleCancelRevoke}
          maxWidth="xs"
          slotProps={{
            transition: { timeout: 300 },
            paper: {
              sx: {
                borderRadius: 3,
                backgroundImage: `linear-gradient(135deg, ${alpha('#12162a', 0.95)} 0%, ${alpha('#0a0e27', 0.98)} 100%)`,
                backdropFilter: 'blur(24px)',
                border: `1px solid ${alpha(palette.accent.error, 0.15)}`,
                boxShadow: `0 24px 80px ${alpha('#000', 0.6)}`,
              },
            },
          }}
        >
          <DialogTitle sx={{ pb: 0.5 }}>
            <Typography variant="body1" sx={{ color: palette.accent.error, fontWeight: 600, fontSize: '0.9375rem' }}>
              Confirm Revoke Access
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              This will clear the recipient and encrypted sharing key from the vault, returning it to the PRIVATE state.
              The recipient will no longer be able to access the vault. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              disableElevation
              onClick={handleCancelRevoke}
              sx={{
                color: '#94a3b8',
                borderColor: alpha('#94a3b8', 0.2),
                '&:hover': { borderColor: alpha('#94a3b8', 0.4), bgcolor: alpha('#94a3b8', 0.04) },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={onRevokeVault}
              sx={{
                bgcolor: palette.accent.error,
                color: '#fff',
                fontWeight: 700,
                '&:hover': { bgcolor: alpha(palette.accent.error, 0.85) },
              }}
            >
              Confirm Revoke
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Fade>
  );
};

const toShortFormatContractAddress = (contractAddress: ContractAddress | undefined): React.ReactElement | undefined =>
  contractAddress ? (
    <span data-testid="vault-address">
      0x{contractAddress?.replace(/^[A-Fa-f0-9]{6}([A-Fa-f0-9]{8}).*([A-Fa-f0-9]{8})$/g, '$1...$2')}
    </span>
  ) : undefined;

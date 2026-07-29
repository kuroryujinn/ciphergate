// CipherGate Audit Logs Page — Security Audit Trail Console
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, alpha, Chip, IconButton, Tooltip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import PauseIcon from '@mui/icons-material/PauseOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrowOutlined';
import ClearAllIcon from '@mui/icons-material/ClearAllOutlined';
import { useAuditLogs, type AuditLogEntry } from '../hooks';
import { palette, hardwareStyles } from '../config/theme';

const statusConfig = {
  success: { color: palette.led.green, label: 'Success' },
  warning: { color: palette.led.amber, label: 'Warning' },
  error: { color: palette.led.red, label: 'Error' },
};

const LogEntryRow: React.FC<{ entry: AuditLogEntry }> = ({ entry }) => {
  const cfg = statusConfig[entry.status];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        transition: 'all 0.2s ease',
        '&:hover': { background: alpha('#fff', 0.02) },
        borderBottom: `1px solid ${alpha('#fff', 0.03)}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      {/* Status LED */}
      <Box
        sx={{
          width: 6,
          height: 6,
          minWidth: 6,
          borderRadius: '50%',
          backgroundColor: cfg.color,
          boxShadow: `0 0 3px ${cfg.color}`,
          mt: 0.5,
        }}
      />

      {/* Timestamp */}
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.5rem',
          color: alpha('#fff', 0.25),
          minWidth: 56,
          mt: 0.25,
        }}
      >
        {entry.timestamp}
      </Typography>

      {/* Action */}
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.5625rem',
          fontWeight: 600,
          color: alpha(palette.accent.primary, 0.8),
          minWidth: 110,
          letterSpacing: '0.02em',
        }}
      >
        [{entry.action}]
      </Typography>

      {/* Detail */}
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.5625rem',
          color: alpha('#fff', 0.55),
          flex: 1,
          lineHeight: 1.5,
        }}
      >
        {entry.detail}
      </Typography>

      {/* Circuit tag */}
      <Box
        sx={{
          px: 0.75,
          py: 0.15,
          borderRadius: 1,
          background: alpha(palette.accent.primary, 0.06),
          border: `1px solid ${alpha(palette.accent.primary, 0.08)}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.45rem',
            fontWeight: 600,
            color: alpha(palette.accent.primary, 0.5),
            letterSpacing: '0.04em',
          }}
        >
          {entry.circuit}
        </Typography>
      </Box>
    </Box>
  );
};

export const AuditLogsPage: React.FC = () => {
  const { entries, totalCount, isActive, pause, resume, clear } = useAuditLogs();

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
          <HistoryIcon sx={{ fontSize: 18, color: alpha(palette.accent.primary, 0.8) }} />
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
            Audit Logs
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.6875rem',
              color: palette.text.tertiary,
              letterSpacing: '0.04em',
            }}
          >
            Security audit trail and event history
          </Typography>
        </Box>
      </Box>

      {/* Audit Log Table */}
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
        {/* Header with live controls */}
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
            <HistoryIcon sx={{ fontSize: 14, color: alpha(palette.accent.primary, 0.7) }} />
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
            Event Log
          </Typography>

          {/* Live indicator */}
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: isActive ? palette.led.green : palette.led.off,
              boxShadow: isActive ? `0 0 4px ${palette.led.green}` : 'none',
              animation: isActive ? 'ledPulse 1.5s ease-in-out infinite' : 'none',
              transition: 'all 0.3s ease',
            }}
          />

          {/* Event count */}
          <Chip
            label={`${entries.length} Events`}
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

          {/* Total counter */}
          <Chip
            label={`${totalCount} Total`}
            size="small"
            sx={{
              bgcolor: alpha(palette.accent.success, 0.06),
              color: alpha(palette.accent.success, 0.7),
              borderColor: alpha(palette.accent.success, 0.1),
              height: 18,
              '& .MuiChip-label': { fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.04em' },
            }}
          />

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Pause / Resume */}
          <Tooltip title={isActive ? 'Pause live feed' : 'Resume live feed'} arrow>
            <IconButton
              onClick={isActive ? pause : resume}
              size="small"
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                color: palette.text.tertiary,
                '&:hover': { color: isActive ? palette.accent.warning : palette.accent.success },
              }}
            >
              {isActive ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>

          {/* Clear */}
          <Tooltip title="Clear log" arrow>
            <IconButton
              onClick={clear}
              size="small"
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                color: palette.text.tertiary,
                '&:hover': { color: palette.accent.error },
              }}
            >
              <ClearAllIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Log entries */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ ...hardwareStyles.oledDisplay }}>
            {entries.map((entry) => (
              <LogEntryRow key={entry.id} entry={entry} />
            ))}
            {entries.length === 0 && (
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.625rem',
                  color: palette.text.disabled,
                  textAlign: 'center',
                  py: 3,
                }}
              >
                No log entries to display.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

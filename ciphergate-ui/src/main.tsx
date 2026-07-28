// CipherGate SPA Entry Point
// SPDX-License-Identifier: Apache-2.0

import './globals';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, Box, Typography, alpha } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import App from './App';
import { theme, palette } from './config/theme';
import '@midnight-ntwrk/dapp-connector-api';
import * as pino from 'pino';
import { DeployedVaultProvider } from './contexts';
import { envResult, validateEnv } from './utils/env-validation';

// ─── Environment Variable Error Component ────────────────────────────────────

const EnvErrorDisplay: React.FC<{ errors: string[] }> = ({ errors }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0e27',
      p: 4,
    }}
  >
    <Box
      sx={{
        maxWidth: 520,
        width: '100%',
        p: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha('#12162a', 0.95)} 0%, ${alpha('#1e2240', 0.6)} 100%)`,
        border: `1px solid ${alpha('#ef4444', 0.2)}`,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          fontSize: '1.25rem',
          color: '#ef4444',
          mb: 2,
          letterSpacing: '-0.01em',
        }}
      >
        Configuration Error
      </Typography>
      {errors.map((error, i) => (
        <Typography
          key={i}
          variant="body2"
          sx={{
            color: '#94a3b8',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            mb: 1.5,
            fontFamily: '"JetBrains Mono", monospace',
            textAlign: 'left',
            p: 1.5,
            borderRadius: 1,
            background: alpha('#000', 0.3),
            border: `1px solid ${alpha('#ef4444', 0.1)}`,
          }}
        >
          {error}
        </Typography>
      ))}
      <Typography
        variant="caption"
        sx={{
          color: '#64748b',
          fontSize: '0.7rem',
          display: 'block',
          mt: 2,
          lineHeight: 1.5,
        }}
      >
        Set the required environment variables in your Vercel project dashboard, or in a{' '}
        <code style={{ color: palette.accent.primary }}>.env</code> file for local development.
      </Typography>
    </Box>
  </Box>
);

// ─── Application Bootstrap ───────────────────────────────────────────────────

if (envResult.valid) {
  setNetworkId(envResult.networkId);
}

export const logger = envResult.valid
  ? pino.pino({
      level: import.meta.env.VITE_LOGGING_LEVEL as string,
    })
  : pino.pino({ level: 'silent' });

logger.trace(`networkId = ${envResult.networkId}`);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      {envResult.valid ? (
        <DeployedVaultProvider logger={logger}>
          <App />
        </DeployedVaultProvider>
      ) : (
        <EnvErrorDisplay errors={envResult.errors} />
      )}
    </ThemeProvider>
  </React.StrictMode>,
);

// Re-export for programmatic health checks
export { validateEnv, envResult };

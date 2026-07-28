// CipherGate Environment Validation & Health Status
// SPDX-License-Identifier: Apache-2.0

export const VALID_NETWORK_IDS = ['preprod', 'preview', 'undeployed'] as const;

export interface EnvValidationResult {
  valid: boolean;
  networkId: string;
  errors: string[];
}

export interface EnvVarStatus {
  name: string;
  value: string | undefined;
  configured: boolean;
  required: boolean;
  valid: boolean;
}

export interface HealthStatus {
  application: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: {
    networkId: string;
    networkIdValid: boolean;
    loggingLevel: string;
  };
  variables: EnvVarStatus[];
  errors: string[];
}

const APP_VERSION = '0.1.0';

/** Validate required environment variables at runtime. */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const networkId = import.meta.env.VITE_NETWORK_ID as string | undefined;

  if (!networkId) {
    errors.push(
      'VITE_NETWORK_ID is not set. This environment variable is required. ' +
        'Set it to one of: ' +
        VALID_NETWORK_IDS.join(', ') +
        '.',
    );
  } else if (!VALID_NETWORK_IDS.includes(networkId as (typeof VALID_NETWORK_IDS)[number])) {
    errors.push(`Invalid VITE_NETWORK_ID: '${networkId}'. Expected one of: ${VALID_NETWORK_IDS.join(', ')}.`);
  }

  return {
    valid: errors.length === 0,
    networkId: networkId ?? '',
    errors,
  };
}

export const envResult = validateEnv();

/** Generate a comprehensive health status object (JSON-serializable). */
export function getHealthStatus(): HealthStatus {
  const vars: EnvVarStatus[] = [
    {
      name: 'VITE_NETWORK_ID',
      value: import.meta.env.VITE_NETWORK_ID as string | undefined,
      configured: !!import.meta.env.VITE_NETWORK_ID,
      required: true,
      valid: envResult.valid,
    },
    {
      name: 'VITE_LOGGING_LEVEL',
      value: import.meta.env.VITE_LOGGING_LEVEL as string | undefined,
      configured: !!import.meta.env.VITE_LOGGING_LEVEL,
      required: false,
      valid: true,
    },
  ];

  const hasErrors = envResult.errors.length > 0;
  const status: HealthStatus['status'] = hasErrors ? 'unhealthy' : 'healthy';

  return {
    application: 'CipherGate',
    version: APP_VERSION,
    status,
    timestamp: new Date().toISOString(),
    environment: {
      networkId: envResult.networkId,
      networkIdValid: envResult.valid,
      loggingLevel: (import.meta.env.VITE_LOGGING_LEVEL as string) ?? 'info',
    },
    variables: vars,
    errors: envResult.errors,
  };
}

/** Expose health status on the global object for debugging/browser console access. */
if (typeof window !== 'undefined') {
  // Use a getter so every access returns a fresh timestamp. No polling needed.
  Object.defineProperty(window, '__CIPHERGATE_HEALTH__', {
    get: () => getHealthStatus(),
    configurable: true,
  });
}

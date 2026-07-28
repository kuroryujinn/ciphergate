// CipherGate Deployed Vault Hook
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';
import { DeployedVaultContext, type DeployedVaultAPIProvider } from '../contexts';

export const useDeployedVaultContext = (): DeployedVaultAPIProvider => {
  const context = useContext(DeployedVaultContext);
  if (!context) {
    throw new Error('A <DeployedVaultProvider /> is required.');
  }
  return context;
};

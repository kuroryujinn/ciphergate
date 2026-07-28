// CipherGate Deployed Vault Context
// SPDX-License-Identifier: Apache-2.0

import React, { type PropsWithChildren, createContext } from 'react';
import { type DeployedVaultAPIProvider, BrowserDeployedVaultManager } from './BrowserDeployedBoardManager';
import { type Logger } from 'pino';

export const DeployedVaultContext = createContext<DeployedVaultAPIProvider | undefined>(undefined);

export type DeployedVaultProviderProps = PropsWithChildren<{
  logger: Logger;
}>;

export const DeployedVaultProvider: React.FC<Readonly<DeployedVaultProviderProps>> = ({ logger, children }) => (
  <DeployedVaultContext.Provider value={new BrowserDeployedVaultManager(logger)}>
    {children}
  </DeployedVaultContext.Provider>
);

/** @deprecated Use DeployedVaultContext */
export const DeployedBoardContext = DeployedVaultContext;

/** @deprecated Use DeployedVaultProvider */
export const DeployedBoardProvider = DeployedVaultProvider;

// CipherGate Root Application
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { Box, Fade } from '@mui/material';
import { MainLayout, Vault } from './components';
import { PrivacyPage } from './components/PrivacyPage';
import { ArchitecturePage } from './components/ArchitecturePage';
import { DeploymentDashboard } from './components/DeploymentDashboard';
import { useDeployedVaultContext } from './hooks';
import { type VaultDeployment } from './contexts';
import { type Observable } from 'rxjs';

const VIEW_KEY = 'ciphergate-active-view';

const getPersistedView = (): string => {
  try {
    return sessionStorage.getItem(VIEW_KEY) ?? 'dashboard';
  } catch {
    return 'dashboard';
  }
};

const setPersistedView = (view: string): void => {
  try {
    sessionStorage.setItem(VIEW_KEY, view);
  } catch {
    // Silently fail
  }
};

const App: React.FC = () => {
  const vaultApiProvider = useDeployedVaultContext();
  const [vaultDeployments, setVaultDeployments] = useState<Array<Observable<VaultDeployment>>>([]);
  const [activeView, setActiveView] = useState<string>(getPersistedView);

  useEffect(() => {
    const subscription = vaultApiProvider.vaultDeployments$.subscribe(setVaultDeployments);
    return () => subscription.unsubscribe();
  }, [vaultApiProvider]);

  const handleTabChange = (tab: string) => {
    setActiveView(tab);
    setPersistedView(tab);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'privacy':
        return <PrivacyPage />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'deployment':
        return <DeploymentDashboard />;
      default:
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', p: 3 }}>
            {vaultDeployments.map((vaultDeployment, idx) => (
              <div data-testid={`vault-${idx}`} key={`vault-${idx}`}>
                <Vault vaultDeployment$={vaultDeployment} />
              </div>
            ))}
            <div data-testid="vault-start">
              <Vault />
            </div>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ background: '#000', minHeight: '100vh' }}>
      <MainLayout activeTab={activeView} onTabChange={handleTabChange}>
        <Fade in key={activeView} timeout={300}>
          <Box sx={{ width: '100%' }}>{renderActiveView()}</Box>
        </Fade>
      </MainLayout>
    </Box>
  );
};

export default App;

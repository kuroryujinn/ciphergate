// CipherGate Root Application
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { Box, Fade } from '@mui/material';
import { MainLayout, Vault, Dashboard, PrivacyPage, ArchitecturePage, DeploymentDashboard } from './components';
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
      case 'wallet':
      case 'contracts':
      case 'proof-engine':
      case 'transactions':
      case 'audit-logs':
      case 'settings':
        // Sidebar navigation items all route to main dashboard for now
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ background: '#000', minHeight: '100vh' }}>
      <MainLayout activeTab={activeView} onTabChange={handleTabChange}>
        {renderActiveView()}
      </MainLayout>
    </Box>
  );
};

export default App;

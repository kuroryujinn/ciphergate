// CipherGate Root Application
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  MainLayout,
  Dashboard,
  PrivacyPage,
  ArchitecturePage,
  DeploymentDashboard,
  WalletPage,
  ContractsPage,
  ProofEnginePage,
  TransactionsPage,
  AuditLogsPage,
  SettingsPage,
} from './components';

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
  const [activeView, setActiveView] = useState<string>(getPersistedView);

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
        return <WalletPage />;
      case 'contracts':
        return <ContractsPage />;
      case 'proof-engine':
        return <ProofEnginePage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
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

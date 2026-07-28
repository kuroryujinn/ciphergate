// CipherGate Root Application
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { MainLayout, Vault } from './components';
import { useDeployedVaultContext } from './hooks';
import { type VaultDeployment } from './contexts';
import { type Observable } from 'rxjs';

const App: React.FC = () => {
  const vaultApiProvider = useDeployedVaultContext();
  const [vaultDeployments, setVaultDeployments] = useState<Array<Observable<VaultDeployment>>>([]);

  useEffect(() => {
    const subscription = vaultApiProvider.vaultDeployments$.subscribe(setVaultDeployments);
    return () => subscription.unsubscribe();
  }, [vaultApiProvider]);

  return (
    <Box sx={{ background: '#000', minHeight: '100vh' }}>
      <MainLayout>
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
      </MainLayout>
    </Box>
  );
};

export default App;

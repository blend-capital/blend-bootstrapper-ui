import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WalletProvider } from './hooks/wallet';
import { BootstrapProvider } from './hooks/bootstrapContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <BootstrapProvider>
        <App />
      </BootstrapProvider>
    </WalletProvider>
  </React.StrictMode>
);

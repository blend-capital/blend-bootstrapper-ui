import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import { BootstrapProvider } from './hooks/bootstrapContext.tsx';
import { WalletProvider } from './hooks/wallet';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <BootstrapProvider>
        <Router>
          <App />
        </Router>
      </BootstrapProvider>
    </WalletProvider>
  </React.StrictMode>
);

import './App.css';
import { TxStatus, useWallet } from './hooks/wallet';
import { ActionOptions, ActionProvider, DisplayAction } from './components/actions';
import { TxStatusOverlay } from './components/TxStatusOverlay';

function App() {
  const { connect } = useWallet();
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => connect()}>Connect</button>
        </div>
        <h1>Backstop Bootstrapper</h1>

        <ActionProvider>
          <ActionOptions />
          <DisplayAction />
          <TxStatusOverlay />
        </ActionProvider>
      </div>
    </>
  );
}

export default App;

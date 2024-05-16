import './App.css';
import { useWallet } from './hooks/wallet';
import { ActionOptions, DisplayAction } from './components/Actions';
import { TxStatusOverlay } from './components/TxStatusOverlay';

function App() {
  const { connect } = useWallet();
  return (
    <div
      style={{
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button
        style={{ display: 'flex', width: '100px', alignSelf: 'flex-end' }}
        onClick={() => connect()}
      >
        Connect
      </button>
      <h1>Backstop Bootstrapper</h1>

      <ActionOptions />
      <DisplayAction />
      <TxStatusOverlay />
    </div>
  );
}

export default App;

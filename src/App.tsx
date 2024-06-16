import './App.css';
import { useWallet } from './hooks/wallet';
import { ActionOptions, DisplayAction } from './components/Actions';
import { TxStatusOverlay } from './components/TxStatusOverlay';
import Container from './components/common/Container';

function App() {
  const { connect, connected, disconnect } = useWallet();
  return (
    <Container
      sx={{
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {connected ? (
        <button
          style={{
            color: '#00994F',
            display: 'flex',
            justifyContent: 'center',
            width: '150px',
            alignSelf: 'flex-end',
          }}
          onClick={() => disconnect()}
        >
          Connected
        </button>
      ) : (
        <button
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '150px',
            alignSelf: 'flex-end',
          }}
          onClick={() => connect()}
        >
          Connect
        </button>
      )}
      <h1>Backstop Bootstrapper</h1>

      <ActionOptions />
      <DisplayAction />
      <TxStatusOverlay />
    </Container>
  );
}

export default App;

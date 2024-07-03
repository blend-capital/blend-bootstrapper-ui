import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, displayBootstrapStatus } from '../utils/bootstrapper';
import { default as Paper } from './common/Paper';

export function CloseBootstrap({ id }: BootstrapProps) {
  const { bootstraps, loadBootstrap } = useBootstrapper();
  const { submitCloseBootstrap, connect, connected } = useWallet();

  const bootstrap = bootstraps.get(id);

  if (bootstrap === undefined) {
    loadBootstrap(id, true);
    return <>Loading...</>;
  }

  if (bootstrap.status !== BootstrapStatus.Closing) {
    return (
      <Paper
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '15px',
        }}
      >
        <h2 style={{ marginBottom: '0px' }}>Close Bootstrap</h2>
        <p>{`Bootstrap status must be Closing to Close. Current status is ${displayBootstrapStatus(bootstrap.status)}.`}</p>
      </Paper>
    );
  }

  function submitTx() {
    if (id != undefined && connected) {
      submitCloseBootstrap(id).then((success) => {
        if (success) {
          loadBootstrap(id, true);
        }
      });
    }
  }

  return (
    <Paper
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '15px',
      }}
    >
      <h2 style={{ marginBottom: '0px' }}>Close Bootstrap</h2>
      <button
        onClick={() => submitTx()}
        disabled={!bootstrap || bootstrap.status != BootstrapStatus.Closing}
      >
        Submit
      </button>
      {connected ? (
        <button onClick={() => submitTx()}>Submit</button>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </Paper>
  );
}

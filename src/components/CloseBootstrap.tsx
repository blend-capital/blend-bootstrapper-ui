import { rpc } from '@stellar/stellar-sdk';
import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, displayBootstrapStatus } from '../utils/bootstrapper';
import { default as Paper } from './common/Paper';

export function CloseBootstrap({ id }: BootstrapProps) {
  const { bootstraps, loadBootstrap } = useBootstrapper();
  const { submitCloseBootstrap, simCloseBootstrap, restore, connect, connected } = useWallet();

  const [restoreResult, setRestoreResult] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(undefined);

  const bootstrap = bootstraps.get(id);
  const isValidBootstrap = !!bootstrap && bootstrap.status === BootstrapStatus.Closing;

  useEffect(() => {
    const simExit = async () => {
      if (isValidBootstrap && connected) {
        const simResult = await simCloseBootstrap(id);
        if (rpc.Api.isSimulationRestore(simResult)) {
          setRestoreResult(simResult);
        } else {
          setRestoreResult(undefined);
        }
      } else {
        setRestoreResult(undefined);
      }
    };
    simExit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, bootstrap]);

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

  function submitRestoreTx() {
    if (restoreResult != undefined && connected) {
      restore(restoreResult).then(() => {
        loadBootstrap(id, true);
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
      <h2>Close Bootstrap</h2>
      {connected ? (
        restoreResult === undefined ? (
          <button onClick={() => submitTx()}>Submit</button>
        ) : (
          <button className={'restore-button'} onClick={() => submitRestoreTx()}>
            Restore Data
          </button>
        )
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </Paper>
  );
}

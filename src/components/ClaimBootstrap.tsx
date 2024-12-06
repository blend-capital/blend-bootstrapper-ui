import { rpc } from '@stellar/stellar-sdk';
import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, calculateOutput, displayBootstrapStatus } from '../utils/bootstrapper';
import Container from './common/Container';
import { default as Paper } from './common/Paper';

export function ClaimBootstrap({ id }: BootstrapProps) {
  const { bootstraps, loadBootstrap, backstopToken } = useBootstrapper();
  const { submitClaimBootstrap, simClaimBootstrap, restore, connect, walletAddress, connected } =
    useWallet();

  const [restoreResult, setRestoreResult] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(undefined);

  const bootstrap = bootstraps.get(id);

  const isValidBootstrap =
    !!bootstrap &&
    (bootstrap.status === BootstrapStatus.Completed ||
      bootstrap.status == BootstrapStatus.Cancelled);

  useEffect(() => {
    const simExit = async () => {
      if (
        isValidBootstrap &&
        connected &&
        walletAddress !== '' &&
        bootstrap.userDeposit.amount > BigInt(0)
      ) {
        const simResult = await simClaimBootstrap(id);
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
  }, [walletAddress, connected, bootstrap]);

  if (bootstrap === undefined) {
    loadBootstrap(id, true);
    return <>Loading...</>;
  }

  if (
    bootstrap.status !== BootstrapStatus.Completed &&
    bootstrap.status !== BootstrapStatus.Cancelled
  ) {
    return (
      <Paper
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '15px',
        }}
      >
        <h2 style={{ marginBottom: '0px' }}>Claim Bootstrap</h2>
        <p>{`Bootstrap status must be Completed or Cancelled to Claim. Current status is ${displayBootstrapStatus(bootstrap.status)}.`}</p>
      </Paper>
    );
  }

  function submitTx() {
    if (id != undefined && connected) {
      submitClaimBootstrap(id).then((success) => {
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

  const estOutput = calculateOutput(
    bootstrap,
    backstopToken,
    0,
    bootstrap.config.bootstrapper === walletAddress
  );

  let claimMessage = '';
  if (bootstrap.userDeposit.claimed === true) {
    claimMessage = 'Already claimed.';
  } else if (bootstrap.userDeposit.amount === BigInt(0)) {
    claimMessage = 'No deposit recorded in this bootstrap.';
  } else if (Number.isFinite(estOutput.claimAmount)) {
    claimMessage = estOutput.claimAmount.toFixed(4);
  } else {
    claimMessage = 'Failed to determine claim amount.';
  }
  const isClaimMessageNumber = claimMessage !== undefined && !isNaN(Number(claimMessage));

  return (
    <Paper
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '15px',
      }}
    >
      <h2 style={{ marginBottom: '0px' }}>Claim Bootstrap</h2>
      {isClaimMessageNumber ? (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center' }}>
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            {`Claimable Backstop Deposit: ${claimMessage} BLND-USDC LP`}
          </p>
          <p
            style={{
              wordBreak: 'break-word',
              marginTop: '-5px',
              color: '#FDDC5C',
            }}
          >
            Claimed tokens will be deposited directly into the pool's backstop.
          </p>
        </Container>
      ) : (
        <>
          <p>{claimMessage}</p>
        </>
      )}
      {connected ? (
        restoreResult === undefined ? (
          <button onClick={() => submitTx()} disabled={!isClaimMessageNumber}>
            Submit
          </button>
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

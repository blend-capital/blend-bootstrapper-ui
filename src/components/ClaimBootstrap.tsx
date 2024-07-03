import { SorobanRpc, scValToNative } from '@stellar/stellar-sdk';
import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, displayBootstrapStatus } from '../utils/bootstrapper';
import { formatNumber } from '../utils/formatter';
import { ContractErrorType, parseError } from '../utils/responseParser';
import Container from './common/Container';
import { default as Paper } from './common/Paper';

export function ClaimBootstrap({ id }: BootstrapProps) {
  const { bootstraps, loadBootstrap } = useBootstrapper();
  const { submitClaimBootstrap, simClaimBootstrap, connect, walletAddress, connected } =
    useWallet();

  const bootstrap = bootstraps.get(id);

  const [claimMessage, setClaimMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (
      bootstrap !== undefined &&
      walletAddress !== '' &&
      claimMessage === undefined &&
      (bootstrap.status === BootstrapStatus.Completed ||
        bootstrap.status === BootstrapStatus.Cancelled) &&
      bootstrap.userDeposit.amount !== BigInt(0) &&
      bootstrap.userDeposit.claimed === false
    ) {
      console.log('Sim Claim bootstrap');
      simClaimBootstrap(id).then((result) => {
        if (SorobanRpc.Api.isSimulationSuccess(result)) {
          if (result.result?.retval !== undefined) {
            const as_bigint = scValToNative(result.result.retval) as bigint;
            const as_string = formatNumber(as_bigint, 7);
            setClaimMessage(as_string);
          } else {
            setClaimMessage('Failed to calculate claim amount.');
          }
        } else {
          const error = parseError(result);
          if (error.type === ContractErrorType.AlreadyClaimedError) {
            setClaimMessage('Already claimed.');
          } else if (error.type === ContractErrorType.InvalidBootstrapStatus) {
            setClaimMessage('Unable to claim .');
          } else {
            setClaimMessage(`Claim failed: ${error.type}`);
          }
        }
      });
    } else if (bootstrap !== undefined) {
      if (bootstrap.userDeposit.claimed === true) {
        setClaimMessage('Already claimed.');
      } else if (bootstrap.userDeposit.amount === BigInt(0)) {
        setClaimMessage('No deposit recorded in this bootstrap.');
      }
    }
  }, [walletAddress, bootstrap, claimMessage, id, simClaimBootstrap]);

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
            The backstop deposit is an estimate and is subject to change with the amount of pair
            tokens deposited. Tokens will be claimable after the bootstrap period ends. Claimed
            tokens will be deposited directly into the pool's backstop.
          </p>
        </Container>
      ) : (
        <>
          <p>{claimMessage}</p>
        </>
      )}
      {connected ? (
        <button onClick={() => submitTx()} disabled={!isClaimMessageNumber}>
          Submit
        </button>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </Paper>
  );
}

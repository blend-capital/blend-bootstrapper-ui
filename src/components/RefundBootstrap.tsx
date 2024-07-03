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

export function RefundBootstrap({ id }: BootstrapProps) {
  const { bootstraps, loadBootstrap } = useBootstrapper();

  const { submitRefundBootstrap, simRefundBootstrap, connect, connected, walletAddress } =
    useWallet();

  const bootstrap = bootstraps.get(id);

  const [refundMessage, setRefundMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (
      bootstrap !== undefined &&
      walletAddress !== '' &&
      refundMessage === undefined &&
      bootstrap.status === BootstrapStatus.Cancelled &&
      bootstrap.userDeposit.amount !== BigInt(0) &&
      bootstrap.userDeposit.refunded === false
    ) {
      console.log('Sim refund bootstrap');
      simRefundBootstrap(id).then((result) => {
        if (SorobanRpc.Api.isSimulationSuccess(result)) {
          if (result.result?.retval !== undefined) {
            const as_bigint = scValToNative(result.result.retval) as bigint;
            const as_string = formatNumber(as_bigint, 7);
            setRefundMessage(as_string);
          } else {
            setRefundMessage('Failed to calculate refund amount.');
          }
        } else {
          const error = parseError(result);
          if (error.type === ContractErrorType.AlreadyRefundedError) {
            setRefundMessage('Already refunded.');
          } else if (error.type === ContractErrorType.InvalidBootstrapStatus) {
            setRefundMessage('Unable to refund.');
          } else {
            setRefundMessage(`Refund failed: ${error.type}`);
          }
        }
      });
    } else if (bootstrap !== undefined) {
      if (bootstrap.userDeposit.refunded === true) {
        setRefundMessage('Already refunded.');
      } else if (bootstrap.userDeposit.amount === BigInt(0)) {
        setRefundMessage('No deposit recorded in this bootstrap.');
      }
    }
  }, [walletAddress, bootstrap, refundMessage, id, simRefundBootstrap]);

  if (bootstrap === undefined) {
    return <>Loading...</>;
  }

  if (bootstrap.status !== BootstrapStatus.Cancelled) {
    return (
      <Paper
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '15px',
        }}
      >
        <h2 style={{ marginBottom: '0px' }}>Refund Bootstrap</h2>
        <p>{`Bootstrap status must be Cancelled to Refund. Current status is ${displayBootstrapStatus(bootstrap.status)}.`}</p>
      </Paper>
    );
  }

  function submitTx() {
    if (id != undefined && connected) {
      submitRefundBootstrap(id).then((success) => {
        if (success) {
          loadBootstrap(id, true);
        }
      });
    }
  }

  const pairTokenSymbol = bootstrap.config.token_index === 1 ? 'BLND' : 'USDC';
  const isRefundMessageNumber = refundMessage !== undefined && !isNaN(Number(refundMessage));

  return (
    <Paper
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '15px',
      }}
    >
      <h2 style={{ marginBottom: '0px' }}>Refund Bootstrap</h2>
      {isRefundMessageNumber ? (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center' }}>
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            {`Refunded Deposit: ${refundMessage} ${pairTokenSymbol}`}
          </p>
        </Container>
      ) : (
        <>
          <p>{refundMessage}</p>
        </>
      )}
      {connected ? (
        <button onClick={() => submitTx()} disabled={!isRefundMessageNumber}>
          Submit
        </button>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </Paper>
  );
}

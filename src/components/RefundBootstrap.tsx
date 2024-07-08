import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, calculateOutput, displayBootstrapStatus } from '../utils/bootstrapper';
import Container from './common/Container';
import { default as Paper } from './common/Paper';

export function RefundBootstrap({ id }: BootstrapProps) {
  const { bootstraps, backstopToken, loadBootstrap } = useBootstrapper();

  const { submitRefundBootstrap, connect, connected, walletAddress } = useWallet();

  const bootstrap = bootstraps.get(id);

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

  const estOutput = calculateOutput(
    bootstrap,
    backstopToken,
    0,
    bootstrap.config.bootstrapper === walletAddress
  );

  let refundMessage = '';
  if (bootstrap.userDeposit.claimed === true) {
    refundMessage = 'Already refunded.';
  } else if (bootstrap.userDeposit.amount === BigInt(0)) {
    refundMessage = 'No deposit recorded in this bootstrap.';
  } else if (Number.isFinite(estOutput.refundAmount)) {
    refundMessage = estOutput.refundAmount.toFixed(4);
  } else {
    refundMessage = 'Failed to determine refund amount.';
  }

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

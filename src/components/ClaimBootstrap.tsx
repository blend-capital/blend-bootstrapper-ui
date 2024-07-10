import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, calculateOutput, displayBootstrapStatus } from '../utils/bootstrapper';
import Container from './common/Container';
import { default as Paper } from './common/Paper';

export function ClaimBootstrap({ id }: BootstrapProps) {
  const { bootstraps, loadBootstrap, backstopToken } = useBootstrapper();
  const { submitClaimBootstrap, connect, walletAddress, connected } = useWallet();

  const bootstrap = bootstraps.get(id);

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
        <button onClick={() => submitTx()} disabled={!isClaimMessageNumber}>
          Submit
        </button>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </Paper>
  );
}

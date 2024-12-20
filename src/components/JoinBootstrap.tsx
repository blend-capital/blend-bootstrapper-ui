import { rpc } from '@stellar/stellar-sdk';
import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { BootstrapStatus, calculateOutput, displayBootstrapStatus } from '../utils/bootstrapper';
import { formatNumber, scaleNumber } from '../utils/formatter';
import Container from './common/Container';
import LabeledInput from './common/LabeledInput';
import { default as Paper } from './common/Paper';

export function JoinBootstrap({ id }: BootstrapProps) {
  const { bootstraps, backstopToken, loadBootstrap } = useBootstrapper();
  const { submitJoinBootstrap, simJoinBootstrap, restore, connected, connect, walletAddress } =
    useWallet();

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [restoreResult, setRestoreResult] = useState<
    rpc.Api.SimulateTransactionRestoreResponse | undefined
  >(undefined);

  const bootstrap = bootstraps.get(id);
  const isValidBootstrap = !!bootstrap && bootstrap.status === BootstrapStatus.Active;

  useEffect(() => {
    const simExit = async () => {
      if (
        isValidBootstrap &&
        connected &&
        walletAddress !== '' &&
        bootstrap.userPairTokenBalance > BigInt(0)
      ) {
        const simResult = await simJoinBootstrap(id, BigInt(1));
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

  if (bootstrap === undefined || backstopToken === undefined) {
    loadBootstrap(id, true);
    return <>Loading...</>;
  }

  function submitTx() {
    if (id != undefined && amount && connected) {
      submitJoinBootstrap(id, BigInt(scaleNumber(amount))).then((success) => {
        if (success) {
          loadBootstrap(id, true);
        }
      });
    }
  }

  function submitRestoreTx() {
    if (restoreResult != undefined && amount && connected) {
      restore(restoreResult).then(() => {
        loadBootstrap(id, true);
      });
    }
  }

  if (bootstrap.status !== BootstrapStatus.Active) {
    return (
      <Paper
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '15px',
        }}
      >
        <h2 style={{ marginBottom: '0px' }}>Join Bootstrap</h2>
        <p>{`Bootstrap status must be Active to Join. Current status is ${displayBootstrapStatus(bootstrap.status)}.`}</p>
      </Paper>
    );
  }

  const isAmountValidDecimals = amount !== undefined && (amount.split('.')[1]?.length ?? 0) <= 7;
  const scaledAmount =
    amount !== undefined && isAmountValidDecimals ? Number(scaleNumber(amount)) : 0;
  const isValidAmountSize =
    amount !== undefined && bootstrap.userPairTokenBalance >= BigInt(scaledAmount);
  const isValidAmount = amount !== undefined && isValidAmountSize && isAmountValidDecimals;
  const errorMessage = isAmountValidDecimals
    ? 'Amount exceeds wallet balance'
    : 'Amount cannot have more than 7 decimals';

  const pairTokenSymbol = bootstrap.config.token_index === 1 ? 'BLND' : 'USDC';
  const pairIndex = bootstrap.config.token_index ^ 1;
  const bootstrapIndex = bootstrap.config.token_index;

  const cometWeights = [0.8, 0.2];

  const newUserDeposit = isAmountValidDecimals
    ? bootstrap.userDeposit.amount + BigInt(scaledAmount)
    : bootstrap.userDeposit.amount;
  const newBootstrapSpotPrice =
    (Number(bootstrap.data.pair_amount) + scaledAmount) /
    cometWeights[pairIndex] /
    (Number(bootstrap.data.bootstrap_amount) / cometWeights[bootstrapIndex]);

  const newEstOutput = calculateOutput(
    bootstrap,
    backstopToken,
    scaledAmount / 1e7,
    walletAddress === bootstrap.config.bootstrapper
  );

  return (
    <Paper
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '15px',
      }}
    >
      <h2 style={{ marginBottom: '0px' }}>Join Bootstrap</h2>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{ paddingLeft: '10px', paddingRight: '10px' }}
        >{`Your Balance: ${formatNumber(bootstrap.userPairTokenBalance)} ${pairTokenSymbol}`}</p>
        <p
          style={{ paddingLeft: '10px', paddingRight: '10px' }}
        >{`Current Deposit: ${formatNumber(bootstrap.userDeposit.amount)} ${pairTokenSymbol}`}</p>
      </Container>
      <LabeledInput
        label={'Amount'}
        placeHolder={'Enter Amount'}
        value={amount}
        type="number"
        onChange={function (input: string): void {
          setAmount(input);
        }}
        disabled={amount ? !isValidAmount : false}
        errorMessage={errorMessage}
      />

      {isValidAmount && (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center', width: '60%' }}>
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            {`New Deposit Amount: ${formatNumber(newUserDeposit, 7)} ${pairTokenSymbol}`}
          </p>
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            {`New Bootstrap BLND Spot Price: ${newBootstrapSpotPrice} ${pairTokenSymbol}`}
          </p>
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            {`Est. Backstop Deposit: ${newEstOutput.claimAmount.toFixed(4)} BLND-USDC LP`}
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
      )}
      {connected ? (
        restoreResult === undefined ? (
          <button onClick={() => submitTx()} disabled={!isValidAmount || !isValidBootstrap}>
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

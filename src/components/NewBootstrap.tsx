import { ChangeEvent, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import Box from './common/Box';
import Container from './common/Container';
import StackedText from './common/StackedText';
import LabeledInput from './common/LabeledInput';

export function NewBootstrap() {
  const { bootstrapperId, bootstrapperConfig } = useBootstrapper();
  const [poolId, setPoolId] = useState<string | undefined>(undefined);

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [pairMinimumAmount, setPairMinimumAmount] = useState<string | undefined>(undefined);
  const [closeLedger, setCloseLedger] = useState<string | undefined>(undefined);
  const { createBootstrap, walletAddress } = useWallet();
  const [tokenIndex, setTokenIndex] = useState<number | undefined>(undefined);

  function displayConfig() {
    if (bootstrapperConfig) {
      return (
        <Container sx={{ justifyContent: 'center', flexDirection: 'column' }}>
          <h3>Bootstrap Config</h3>
          <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
            <StackedText
              title="Backstop Id: "
              text={bootstrapperConfig.backstopId}
              sx={{ justifyContent: 'center', flexDirection: 'column' }}
            />
            <StackedText
              title="Backstop Token Id: "
              text={bootstrapperConfig.backstopTokenId}
              sx={{ justifyContent: 'center', flexDirection: 'column' }}
            />

            <h4 style={{ marginBottom: '-10px' }}>Comet Token Data: </h4>

            {bootstrapperConfig.cometTokenData.map((tokenData) => {
              return (
                <div>
                  <StackedText
                    title="Address:"
                    text={tokenData.address}
                    sx={{ justifyContent: 'center', flexDirection: 'column' }}
                  />
                  <p style={{ marginTop: '-10px' }}>Weight: {tokenData.weight}%</p>
                </div>
              );
            })}
          </Box>
        </Container>
      );
    }
    return <></>;
  }

  function SubmitTx() {
    if (
      walletAddress &&
      bootstrapperId &&
      poolId &&
      amount &&
      pairMinimumAmount &&
      closeLedger &&
      tokenIndex !== undefined
    ) {
      createBootstrap(bootstrapperId, {
        amount: BigInt(amount),
        bootstrapper: walletAddress,
        close_ledger: parseInt(closeLedger),
        pair_min: BigInt(pairMinimumAmount),
        pool: poolId,
        token_index: tokenIndex,
      });
    }
  }

  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CEDCFB',
      }}
    >
      <h2>New Bootstrap</h2>
      {displayConfig()}
      <LabeledInput
        label={'Pool Id'}
        placeHolder={'Enter Pool Address'}
        value={poolId}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          setPoolId(e.target.value);
        }}
      />
      <LabeledInput
        label={'Token Index'}
        placeHolder={'Enter Token Index'}
        value={tokenIndex}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          setTokenIndex(parseInt(e.target.value));
        }}
      />
      <LabeledInput
        label={'Amount'}
        placeHolder={'Enter Bootstrap Amount'}
        value={amount}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          setAmount(e.target.value);
        }}
      />
      <LabeledInput
        label={'Pair Minimum Amount'}
        placeHolder={'Enter Pair Minimum Amount'}
        value={pairMinimumAmount}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          setPairMinimumAmount(e.target.value);
        }}
      />
      <LabeledInput
        label={'Close Ledger'}
        placeHolder={'Enter Ledger to Close Bootstrap'}
        value={closeLedger}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          setCloseLedger(e.target.value);
        }}
      />
      <button onClick={() => SubmitTx()}>Submit</button>
    </Box>
  );
}

import { useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import Box from './common/Box';
import Container from './common/Container';
import StackedText from './common/StackedText';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>New Bootstrap</h2>
      {displayConfig()}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Pool Id: </label>
        <input
          type="text"
          placeholder="Enter Pool Address"
          style={{ flexGrow: 1 }}
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Token Index
        </label>
        <input
          type="text"
          placeholder="Enter Token Index"
          style={{ flexGrow: 1 }}
          value={tokenIndex}
          onChange={(e) => setTokenIndex(parseInt(e.target.value))}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Amount</label>
        <input
          type="text"
          placeholder="Enter Amount"
          style={{ flexGrow: 1 }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Pair Minimum Amount
        </label>
        <input
          type="text"
          placeholder="Enter Pair Minimum Amount"
          style={{ flexGrow: 1 }}
          value={pairMinimumAmount}
          onChange={(e) => setPairMinimumAmount(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Close Ledger
        </label>
        <input
          type="text"
          style={{ flexGrow: 1 }}
          placeholder="Enter the Ledger to Close the Bootstrap"
          value={closeLedger}
          onChange={(e) => setCloseLedger(e.target.value)}
        />
      </div>
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

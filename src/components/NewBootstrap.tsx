import { useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import Box from './Box';

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
        <div>
          <h3>Bootstrap Config</h3>
          <Box sx={{ flexDirection: 'column' }}>
            <p>Backstop Id: {bootstrapperConfig.backstopId}</p>
            <p>Backstop Token Id: {bootstrapperConfig.backstopTokenId}</p>
            <p>Comet Token Data:</p>

            {bootstrapperConfig.cometTokenData.map((tokenData) => {
              return (
                <div>
                  <p>Address: {tokenData.address} </p>
                  <p>Weight: {tokenData.weight}%</p>
                </div>
              );
            })}
          </Box>
        </div>
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
          width: '50%',
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
          width: '50%',
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
          width: '50%',
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
          width: '50%',
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
          width: '50%',
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

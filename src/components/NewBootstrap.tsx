import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import Box from './common/Box';
import Container from './common/Container';
import StackedText from './common/StackedText';
import LabeledInput from './common/LabeledInput';
import { scaleNumber } from '../utils/numberFormatter';
import { isValidAddress } from '../utils/validation';
import { nativeToScVal } from '@stellar/stellar-sdk';

export function NewBootstrap() {
  const { bootstrapperId, bootstrapperConfig } = useBootstrapper();
  const [poolId, setPoolId] = useState<string | undefined>(undefined);

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [pairMinimumAmount, setPairMinimumAmount] = useState<string | undefined>(undefined);
  const [closeLedger, setCloseLedger] = useState<string | undefined>(undefined);
  const { createBootstrap, walletAddress, fetchBalance, connected } = useWallet();
  const [tokenIndex, setTokenIndex] = useState<number | undefined>(undefined);
  const [bootstrapWalletBalance, setBootstrapWalletBalance] = useState<bigint | undefined>(
    undefined
  );
  useEffect(() => {
    if (
      tokenIndex !== undefined &&
      (tokenIndex == 0 || tokenIndex == 1) &&
      bootstrapperConfig &&
      connected
    ) {
      let tokenAddress = bootstrapperConfig?.cometTokenData[tokenIndex].address;
      fetchBalance(tokenAddress, walletAddress).then((balance) => {
        setBootstrapWalletBalance(balance);
      });
    }
  }, [bootstrapperConfig, tokenIndex, connected, walletAddress]);

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
        amount: BigInt(scaleNumber(amount)),
        bootstrapper: walletAddress,
        close_ledger: parseInt(closeLedger),
        pair_min: BigInt(scaleNumber(pairMinimumAmount)),
        pool: poolId,
        token_index: tokenIndex,
      });
    }
  }
  const isValidBootstrapAmount =
    !!bootstrapWalletBalance && !!amount ? bootstrapWalletBalance > BigInt(amount) : true;
  const isValidPoolId = !!poolId && isValidAddress(poolId);
  const isValidTokenIndex = tokenIndex !== undefined && (tokenIndex == 0 || tokenIndex == 1);
  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2>New Bootstrap</h2>
      {displayConfig()}
      <LabeledInput
        label={'Pool Id'}
        placeHolder={'Enter Pool Address'}
        value={poolId}
        onChange={function (id: string): void {
          setPoolId(id);
        }}
        disabled={poolId ? !isValidPoolId : false}
        errorMessage="Invalid Pool Address"
      />
      <LabeledInput
        label={'Token Index'}
        placeHolder={'Enter Token Index'}
        value={tokenIndex}
        type="number"
        onChange={function (value: string): void {
          const tokenId = parseInt(value);
          if (!isNaN(tokenId)) setTokenIndex(tokenId);
          else setTokenIndex(undefined);
        }}
        disabled={tokenIndex !== undefined ? !isValidTokenIndex : false}
        errorMessage="Invalid Token Index (0 or 1)"
      />
      <LabeledInput
        label={'Amount'}
        placeHolder={'Enter Bootstrap Amount'}
        type="number"
        value={amount}
        onChange={function (newAmount: string): void {
          setAmount(newAmount);
        }}
        disabled={!isValidBootstrapAmount}
        errorMessage="Amount exceeds wallet balance"
      />
      <LabeledInput
        label={'Pair Minimum Amount'}
        placeHolder={'Enter Pair Minimum Amount'}
        type="number"
        value={pairMinimumAmount}
        onChange={function (input: string): void {
          setPairMinimumAmount(input);
        }}
      />
      <LabeledInput
        label={'Close Ledger'}
        placeHolder={'Enter Ledger to Close Bootstrap'}
        type="number"
        value={closeLedger}
        onChange={function (input: string): void {
          setCloseLedger(input);
        }}
      />
      <button
        onClick={() => SubmitTx()}
        disabled={
          !isValidPoolId ||
          !isValidTokenIndex ||
          !isValidBootstrapAmount ||
          !pairMinimumAmount ||
          !closeLedger
        }
      >
        Submit
      </button>
    </Box>
  );
}

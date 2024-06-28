import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import Box from './common/Box';
import Container from './common/Container';
import StackedText from './common/StackedText';
import LabeledInput from './common/LabeledInput';
import { scaleNumber } from '../utils/numberFormatter';
import { isValidAddress } from '../utils/validation';

export function NewBootstrap() {
  const { bootstrapperId, bootstrapperConfig } = useBootstrapper();
  const { createBootstrap, walletAddress, fetchBalance, connected, getLatestLedger } = useWallet();

  const [poolId, setPoolId] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [pairMinimumAmount, setPairMinimumAmount] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<string | undefined>(undefined);
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
      connected &&
      poolId &&
      amount &&
      pairMinimumAmount &&
      duration &&
      tokenIndex !== undefined
    ) {
      getLatestLedger().then((ledger) => {
        createBootstrap(bootstrapperId, {
          amount: BigInt(scaleNumber(amount)),
          bootstrapper: walletAddress,
          close_ledger: parseInt(duration) + ledger,
          pair_min: BigInt(scaleNumber(pairMinimumAmount)),
          pool: poolId,
          token_index: tokenIndex,
        });
      });
    }
  }
  const isValidBootstrapAmount =
    !!bootstrapWalletBalance && !!amount
      ? bootstrapWalletBalance > BigInt(scaleNumber(amount))
      : true;
  const isValidPoolId = !!poolId && isValidAddress(poolId);
  const isValidTokenIndex = tokenIndex !== undefined && (tokenIndex == 0 || tokenIndex == 1);
  const isValidBootstrapDuration =
    !!duration && parseInt(duration) >= 17280 && parseInt(duration) <= 241920;
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
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'row',
          width: '50%',
          margin: '0px 0',
          alignItems: 'center',
        }}
      >
        <label style={{ width: '110px', textAlign: 'left', marginRight: '10px' }}>
          {'Bootstrap Token'}
        </label>
        <Container
          sx={{
            flexDirection: 'row',
            padding: 0,
            justifyContent: 'flex-start',
            flexGrow: 1,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => {
              setTokenIndex(1);
            }}
            style={{
              background:
                tokenIndex === 1
                  ? 'linear-gradient(45deg, #FDDC5C, #FDDC5C 50%, #FDDC5C 50%, #FDDC5C)'
                  : '#242424',

              border: '1px solid',
              color: tokenIndex === 1 ? '#242424' : '#FDDC5C',
              borderRadius: '4px',
              marginRight: '10px',
              borderColor: '#FDDC5C',
            }}
          >
            USDC
          </button>
          <button
            onClick={() => setTokenIndex(0)}
            style={{
              background:
                tokenIndex === 0
                  ? 'linear-gradient(45deg, #FDDC5C, #FDDC5C 50%, #FDDC5C 50%, #FDDC5C)'
                  : '#242424',
              color: tokenIndex === 0 ? '#242424' : '#FDDC5C',
              border: '1px solid',
              borderRadius: '4px',
              borderColor: '#FDDC5C',
            }}
          >
            BLND
          </button>
        </Container>
      </Container>
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
        label={'Bootstrap Duration'}
        placeHolder={'Enter length of bootstrap in ledgers'}
        type="number"
        value={duration}
        onChange={function (input: string): void {
          setDuration(input);
        }}
        disabled={duration !== undefined && duration !== '' ? !isValidBootstrapDuration : false}
        errorMessage="Duration must be between 17280-241920 ledgers"
      />
      <button
        onClick={() => SubmitTx()}
        disabled={
          !isValidPoolId ||
          !isValidTokenIndex ||
          !isValidBootstrapAmount ||
          !pairMinimumAmount ||
          !duration
        }
      >
        Submit
      </button>
    </Box>
  );
}

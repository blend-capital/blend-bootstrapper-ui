import { ChangeEvent, useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import { UserBalances } from './UserBalances';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';
import Container from './common/Container';
import { CometBalances } from './SpotPrice';

export function ExitBootstrap() {
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [newSpotPrice, setNewSpotPrice] = useState<number | undefined>(undefined);
  const [claimAmount, setClaimAmount] = useState<number | undefined>(undefined);
  const {
    bootstrapperId,
    bootstrap,
    id,
    setId,
    bootstrapperConfig,
    cometBalances,
    cometTotalSupply,
    calculateClaimAmount,
  } = useBootstrapper();

  const { exitBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined && amount) {
      exitBootstrap(bootstrapperId, id, BigInt(amount));
    }
  }

  useEffect(() => {
    if (bootstrap && bootstrapperConfig && amount && cometBalances && cometTotalSupply) {
      const bootstrapIndex = bootstrap.config.token_index;
      const pairTokenIndex = 1 ^ bootstrapIndex;
      const bootstrapTokenData = bootstrapperConfig.cometTokenData[bootstrapIndex];
      const pairTokenData = bootstrapperConfig.cometTokenData[pairTokenIndex];

      const newPairAmount = Number(bootstrap.data.pair_amount) - parseInt(amount);

      const newSpotPrice =
        newPairAmount /
        (pairTokenData.weight / 100) /
        (Number(bootstrap.data.bootstrap_amount) / (bootstrapTokenData.weight / 100));
      setNewSpotPrice(newSpotPrice);

      setClaimAmount(calculateClaimAmount(parseInt(amount) * -1));
    }
  }, [cometBalances, bootstrap, id, amount, cometTotalSupply, bootstrapperConfig]);

  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#CEDCFB',
      }}
    >
      <h2>Exit Bootstrap</h2>
      <BootstrapData />
      <Container sx={{ flexDirection: 'row', justifyContent: 'center' }}>
        <CometBalances />
        <UserBalances />
      </Container>
      <LabeledInput
        label={'Bootstrap Id'}
        placeHolder={'Enter Bootstrap Id'}
        value={id}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          const id = parseInt(e.target.value);
          if (!isNaN(id)) setId(id);
          else setId(undefined);
        }}
      />
      <LabeledInput
        label={'Amount'}
        placeHolder={'Enter Amount'}
        value={amount}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          setAmount(e.target.value);
        }}
      />
      {claimAmount != undefined ? (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center' }}>
          {amount && parseInt(amount) > 0 ? (
            <p
              style={{
                marginTop: '-5px',
              }}
            >
              New Bootstrap Spot Price: {newSpotPrice}
            </p>
          ) : (
            <></>
          )}
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            BLND-USDC LP To Claim: {claimAmount}
          </p>
          <p
            style={{
              wordBreak: 'break-word',
              marginTop: '-5px',
              color: '#FDDC5C',
            }}
          >
            The claim amount is an estimate and is subject to change with the amount of pair tokens
            deposited
          </p>
        </Container>
      ) : (
        <></>
      )}
      <button onClick={() => SubmitTx()}>Submit</button>
    </Box>
  );
}

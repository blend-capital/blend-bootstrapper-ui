import { ChangeEvent, useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';
import Container from './common/Container';

export function ClaimBootstrap() {
  const [claimAmount, setClaimAmount] = useState<number | undefined>(undefined);
  const {
    bootstrapperId,
    bootstrap,
    id,
    setId,
    calculateClaimAmount,
    bootstrapperConfig,
    cometBalances,
    cometTotalSupply,
  } = useBootstrapper();

  const { claimBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined) {
      claimBootstrap(bootstrapperId, id);
    }
  }
  useEffect(() => {
    setClaimAmount(calculateClaimAmount(0));
  }, [bootstrap, bootstrapperConfig, cometBalances, cometTotalSupply, id]);

  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>Claim Bootstrap</h2>
      <BootstrapData />
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
      {claimAmount != undefined && id != undefined ? (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center' }}>
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

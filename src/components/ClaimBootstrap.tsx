import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';
import Container from './common/Container';
import { BootstrapStatus } from '../types';
import { formatNumber } from '../utils/numberFormatter';
import { CometBalances } from './SpotPrice';
import { UserBalances } from './UserBalances';

export function ClaimBootstrap() {
  const [claimAmount, setClaimAmount] = useState<string | undefined>(undefined);
  const {
    bootstrapperId,
    bootstrap,
    id,
    setId,
    calculateClaimAmount,
    bootstrapperConfig,
    cometBalances,
    cometTotalSupply,
    fetchBootstrap,
    fetchUserDeposit,
    userDeposit,
  } = useBootstrapper();

  const { claimBootstrap, walletAddress, connected } = useWallet();

  function SubmitTx() {
    if (id != undefined && connected) {
      claimBootstrap(bootstrapperId, id).then((success) => {
        if (success) {
          fetchBootstrap(id);
          fetchUserDeposit(id, walletAddress);
        }
      });
    }
  }
  useEffect(() => {
    const amountToClaim = calculateClaimAmount(0);
    setClaimAmount(amountToClaim !== undefined ? formatNumber(amountToClaim) : undefined);
  }, [bootstrap, bootstrapperConfig, cometBalances, cometTotalSupply, id, userDeposit]);

  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>Claim Bootstrap</h2>
      <BootstrapData />
      <Container sx={{ flexDirection: 'row', justifyContent: 'center', marginTop: '-20px' }}>
        <CometBalances />
        <UserBalances />
      </Container>
      <LabeledInput
        label={'Bootstrap Id'}
        placeHolder={'Enter Bootstrap Id'}
        type="number"
        value={id}
        onChange={function (value: string): void {
          const new_id = parseInt(value);
          if (!isNaN(new_id)) setId(new_id);
          else setId(undefined);
        }}
        disabled={id !== undefined ? !bootstrap : false}
        errorMessage="Invalid Bootstrap Id"
      />
      {claimAmount != undefined && id != undefined ? (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center' }}>
          <p
            style={{
              marginTop: '-5px',
            }}
          >
            Estimated BLND-USDC LP To Claim: {claimAmount}
          </p>
          <p
            style={{
              wordBreak: 'break-word',
              marginTop: '-5px',
              color: '#FDDC5C',
            }}
          >
            The claim amount is an estimate and is subject to change with the amount of pair tokens
            deposited. Tokens will be claimable after the bootstrap period ends.
          </p>
        </Container>
      ) : (
        <></>
      )}
      <button
        onClick={() => SubmitTx()}
        disabled={!bootstrap || bootstrap.status != BootstrapStatus.Completed}
      >
        Submit
      </button>
    </Box>
  );
}

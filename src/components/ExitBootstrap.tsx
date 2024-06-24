import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import { UserBalances } from './UserBalances';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';
import Container from './common/Container';
import { CometBalances } from './SpotPrice';
import { scaleNumber, formatNumber } from '../utils/numberFormatter';
import { BootstrapStatus } from '../types';

export function ExitBootstrap() {
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [newSpotPrice, setNewSpotPrice] = useState<number | undefined>(undefined);
  const [claimAmount, setClaimAmount] = useState<string | undefined>(undefined);
  const {
    bootstrapperId,
    bootstrap,
    id,
    setId,
    bootstrapperConfig,
    cometBalances,
    cometTotalSupply,
    userDeposit,
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
      const scaledAmount = parseInt(scaleNumber(amount));
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

      let amountToClaim = calculateClaimAmount(scaledAmount * -1);
      setClaimAmount(amountToClaim ? formatNumber(amountToClaim) : undefined);
    }
  }, [cometBalances, bootstrap, id, amount, cometTotalSupply, bootstrapperConfig]);

  const isValidBootstrap = !!bootstrap && bootstrap.status === BootstrapStatus.Active;
  const isValidAmount = !!userDeposit && !!amount && userDeposit.amount > BigInt(amount);
  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
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
        type="number"
        value={id}
        onChange={function (value: string): void {
          const newId = parseInt(value);
          if (!isNaN(newId)) setId(newId);
          else setId(undefined);
        }}
        disabled={id !== undefined ? !bootstrap : false}
        errorMessage="Invalid Bootstrap Id"
      />
      <LabeledInput
        label={'Amount'}
        placeHolder={'Enter Amount'}
        type="number"
        value={amount}
        onChange={function (newAmount: string): void {
          setAmount(newAmount);
        }}
        disabled={
          amount !== undefined ? !userDeposit || userDeposit.amount > BigInt(amount) : false
        }
        errorMessage="Amount exceeds user deposit"
      />
      {claimAmount != undefined && bootstrap && (
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
      )}
      <button onClick={() => SubmitTx()} disabled={!isValidAmount || !isValidBootstrap}>
        Submit
      </button>
    </Box>
  );
}

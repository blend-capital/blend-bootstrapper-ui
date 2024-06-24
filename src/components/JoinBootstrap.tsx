import { useEffect, useState } from 'react';
import { BootstrapData } from './BootstrapData';
import { UserBalances } from './UserBalances';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { CometBalances } from './SpotPrice';
import Box from './common/Box';
import Container from './common/Container';
import LabeledInput from './common/LabeledInput';
import { formatNumber, scaleNumber } from '../utils/numberFormatter';
import { BootstrapStatus } from '../types';
export function JoinBootstrap() {
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [newSpotPrice, setNewSpotPrice] = useState<number | undefined>(undefined);
  const [claimAmount, setClaimAmount] = useState<string | undefined>(undefined);
  const {
    bootstrapperId,
    bootstrap,
    id,
    setId,
    cometBalances,
    bootstrapperConfig,
    cometTotalSupply,
    pairWalletBalance,
    calculateClaimAmount,
  } = useBootstrapper();
  const { joinBootstrap } = useWallet();

  useEffect(() => {
    if (bootstrap && bootstrapperConfig && amount && cometBalances && cometTotalSupply) {
      const scaledAmount = parseInt(scaleNumber(amount));
      const bootstrapIndex = bootstrap.config.token_index;
      const pairTokenIndex = 1 ^ bootstrapIndex;
      const bootstrapTokenData = bootstrapperConfig.cometTokenData[bootstrapIndex];
      const pairTokenData = bootstrapperConfig.cometTokenData[pairTokenIndex];

      const newPairAmount = Number(bootstrap.data.pair_amount) + scaledAmount;

      const newSpotPrice =
        newPairAmount /
        (pairTokenData.weight / 100) /
        (Number(bootstrap.data.bootstrap_amount) / (bootstrapTokenData.weight / 100));
      setNewSpotPrice(newSpotPrice);

      let amountToClaim = calculateClaimAmount(scaledAmount);
      setClaimAmount(amountToClaim ? formatNumber(amountToClaim) : undefined);
    }
  }, [cometBalances, bootstrap, id, amount, cometTotalSupply, bootstrapperConfig]);

  function SubmitTx() {
    if (bootstrapperId && id != undefined && amount) {
      joinBootstrap(bootstrapperId, id, BigInt(scaleNumber(amount)));
    }
  }

  const isValidBootstrap = !!bootstrap && bootstrap.status === BootstrapStatus.Active;
  const isValidAmount = !!pairWalletBalance && !!amount && pairWalletBalance < BigInt(amount);
  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>Join Bootstrap</h2>
      <BootstrapData />
      <Container sx={{ flexDirection: 'row', justifyContent: 'center' }}>
        <CometBalances />
        <UserBalances />
      </Container>

      <LabeledInput
        label={'Bootstrap Id'}
        placeHolder={'Enter Bootstrap Id'}
        value={id}
        type="number"
        onChange={function (value: string): void {
          const newId = parseInt(value);
          if (!isNaN(newId)) setId(newId);
          else setId(undefined);
        }}
        disabled={id !== undefined ? !isValidBootstrap : false}
        errorMessage="Invalid Bootstrap Id"
      />
      <LabeledInput
        label={'Amount'}
        placeHolder={'Enter Amount'}
        value={amount}
        type="number"
        onChange={function (input: string): void {
          setAmount(input);
        }}
        disabled={amount ? isValidAmount : false}
      />

      {claimAmount != undefined && bootstrap && (
        <Container sx={{ flexDirection: 'column', justifyContent: 'center', width: '60%' }}>
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

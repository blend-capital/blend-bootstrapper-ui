import { useBootstrapper } from '../hooks/bootstrapContext';
import Box from './Box';
import { useWallet } from '../hooks/wallet';

export const CometBalances = () => {
  const { connected } = useWallet();
  const { cometBalances, bootstrap, bootstrapperConfig } = useBootstrapper();

  if (
    !connected ||
    cometBalances == undefined ||
    bootstrapperConfig == undefined ||
    bootstrap == undefined
  ) {
    return <></>;
  }
  const bootstrapIndex = bootstrap.config.token_index;
  const pairTokenIndex = 1 ^ bootstrapIndex;
  const bootstrapTokenData = bootstrapperConfig.cometTokenData[bootstrapIndex];
  const pairTokenData = bootstrapperConfig.cometTokenData[pairTokenIndex];

  const bootstrapSpotPrice =
    Number(bootstrap.data.pair_amount) /
    (pairTokenData.weight / 100) /
    (Number(bootstrap.data.bootstrap_amount) / (bootstrapTokenData.weight / 100));

  const cometSpotPrice =
    Number(cometBalances[1]) /
    (pairTokenData.weight / 100) /
    Number(cometBalances[0]) /
    (bootstrapTokenData.weight / 100);

  return (
    <>
      <h3>Spot Prices</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ marginRight: '10px' }}>Comet Spot Price:</p> {cometSpotPrice.toString()}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ marginRight: '10px' }}>Bootstrap Spot Price:</p>{' '}
          {bootstrapSpotPrice.toFixed(7)}
        </Box>
      </div>
    </>
  );
};

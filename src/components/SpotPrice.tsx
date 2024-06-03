import { useBootstrapper } from '../hooks/bootstrapContext';
import Box from './common/Box';
import Container from './common/Container';
import StackedText from './common/StackedText';

export const CometBalances = () => {
  const { cometBalances, bootstrap, bootstrapperConfig, id } = useBootstrapper();

  if (
    cometBalances == undefined ||
    bootstrapperConfig == undefined ||
    bootstrap == undefined ||
    id == undefined
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
    <Container sx={{ justifyContent: 'center', flexDirection: 'column' }}>
      <h3>Spot Prices</h3>
      <Box
        sx={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StackedText
          title="Comet Spot Price"
          text={cometSpotPrice.toFixed(7)}
          sx={{ flexDirection: 'column' }}
        />
        <StackedText
          title="Bootstrap Spot Price"
          text={bootstrapSpotPrice.toFixed(7)}
          sx={{ flexDirection: 'column' }}
        />
      </Box>
    </Container>
  );
};

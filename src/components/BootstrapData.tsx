import { useBootstrapper } from '../hooks/bootstrapContext';
import { BootstrapStatus } from '../types';
import { formatNumber } from '../utils/numberFormatter';
import Box from './common/Box';
import Container from './common/Container';
import StackedText from './common/StackedText';

export function BootstrapData() {
  const { id, bootstrap, bootstrapperConfig } = useBootstrapper();
  if (!bootstrap || !bootstrapperConfig || id == undefined) {
    return <></>;
  }
  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
      <h3>Bootstrap Data</h3>
      <Box sx={{ flexDirection: 'column' }}>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '-15px',
          }}
        >
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Status: {BootstrapStatus[bootstrap.status]}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Close Ledger: {Number(bootstrap.config.close_ledger)}
          </p>
        </Container>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Pair Token Amount: {formatNumber(bootstrap.data.pair_amount)}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Bootstrap Amount: {formatNumber(bootstrap.data.bootstrap_amount)}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Pair Minimum Amount: {formatNumber(bootstrap.config.pair_min)}
          </p>
        </Container>
      </Box>

      <h3>Bootstrap Config</h3>
      <Box sx={{ flexWrap: 'wrap', overflowWrap: 'break-word', flexDirection: 'column' }}>
        <StackedText
          title="Pool Id:"
          text={bootstrap.config.pool}
          sx={{ justifyContent: 'center', flexDirection: 'column' }}
        />
        <StackedText
          title="Bootstrap Token Address"
          text={bootstrapperConfig.cometTokenData[bootstrap.config.token_index].address}
          sx={{ justifyContent: 'center', flexDirection: 'column' }}
        />
        <StackedText
          title="Pair Token Address"
          text={bootstrapperConfig.cometTokenData[1 ^ bootstrap.config.token_index].address}
          sx={{ justifyContent: 'center', flexDirection: 'column' }}
        />
      </Box>
    </Container>
  );
}

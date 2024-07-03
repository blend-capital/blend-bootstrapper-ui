import { useSearchParams } from 'react-router-dom';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { BootstrapProps } from '../types';
import { displayBootstrapStatus } from '../utils/bootstrapper';
import Container from './common/Container';
import Paper from './common/Paper';

export function BootstrapPreview({ id }: BootstrapProps) {
  const { bootstraps, backstopToken, loadBootstrap } = useBootstrapper();

  const [, setSearchParams] = useSearchParams();

  const bootstrap = bootstraps.get(id);
  if (bootstrap === undefined || backstopToken === undefined) {
    loadBootstrap(id, false);
    return <>Loading...</>;
  }
  const pairTokenSymbol = bootstrap.config.token_index === 1 ? 'BLND' : 'USDC';

  return (
    <Paper
      sx={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Container
        sx={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h3>Bootstrap {id}</h3>
        <p>{`Status: ${displayBootstrapStatus(bootstrap.status)}`}</p>
        <p>{`Pair Token: ${pairTokenSymbol}`}</p>
      </Container>
      <button
        style={{ marginRight: '12px' }}
        onClick={() => setSearchParams({ id: id.toString() })}
      >
        Select
      </button>
    </Paper>
  );
}

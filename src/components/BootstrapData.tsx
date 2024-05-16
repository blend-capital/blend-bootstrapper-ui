import { useBootstrapper } from '../hooks/bootstrapContext';
import { Bootstrap, BootstrapStatus } from '../types';
import Box from './Box';

type BootstrapDataProps = {
  bootstrap: Bootstrap;
};

export function BootstrapData({ bootstrap }: BootstrapDataProps) {
  const { bootstrapperId, bootstrapperConfig, id } = useBootstrapper();
  if (bootstrapperId) {
    if (bootstrap && bootstrapperConfig && id) {
      return (
        <div>
          <h3>Bootstrap Data</h3>
          <Box>
            <p>Status: {BootstrapStatus[bootstrap.status]}</p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                Pair Token Amount: {bootstrap.data.pair_amount.toString()}
              </p>
              <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                Bootstrap Amount: {bootstrap.data.bootstrap_amount.toString()}
              </p>
              <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                Pair Minimum Amount: {Number(bootstrap.config.pair_min)}
              </p>
            </div>
            <p>Close Ledger: {Number(bootstrap.config.close_ledger)}</p>
          </Box>

          <h3>Bootstrap Config</h3>
          <Box>
            <div>
              <p>Pool Id: {bootstrap.config.pool}</p>
              <p>
                Bootstrap Token Address:{' '}
                {bootstrapperConfig.cometTokenData[bootstrap.config.token_index].address}
              </p>
              <p>
                Pair Token Address:{' '}
                {bootstrapperConfig.cometTokenData[1 ^ bootstrap.config.token_index].address}
              </p>
            </div>
          </Box>
        </div>
      );
    }
    return <></>;
  }
  return <></>;
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapProps } from '../types';
import { calculateOutput, displayBootstrapStatus } from '../utils/bootstrapper';
import { buildStellarExpertLink, formatAddress, formatNumber } from '../utils/formatter';
import { getRpc } from '../utils/rpc';
import Container from './common/Container';
import { LinkedText } from './common/LinkedText';
import Paper from './common/Paper';

export function BootstrapData({ id }: BootstrapProps) {
  const { bootstraps, backstopToken, backstopDepositLPTokens, loadBootstrap } = useBootstrapper();
  const { walletAddress } = useWallet();

  const bootstrapAddress = import.meta.env.VITE_BOOTSTRAPPER_ADDRESS;

  const [, setSearchParams] = useSearchParams();

  const [currentLedger, setCurrentLedger] = useState<number>(0);

  useEffect(() => {
    const update = async () => {
      const resp = await getRpc().getLatestLedger();
      setCurrentLedger(resp.sequence);
    };
    update();
    const refreshInterval = setInterval(async () => {
      await update();
    }, 4 * 1000);
    return () => clearInterval(refreshInterval);
  }, [setCurrentLedger]);

  const bootstrap = bootstraps.get(id);
  if (bootstrap === undefined || backstopToken === undefined) {
    return <>Loading...</>;
  }

  const bootstrapTokenSymbol = bootstrap.config.token_index === 0 ? 'BLND' : 'USDC';
  const pairTokenSymbol = bootstrap.config.token_index === 1 ? 'BLND' : 'USDC';

  const cometBalances = [backstopToken.blnd, backstopToken.usdc];
  const cometWeights = [0.8, 0.2];
  const pairIndex = bootstrap.config.token_index ^ 1;
  const bootstrapIndex = bootstrap.config.token_index;

  // spot price is pair tokens per bootstrap token
  const bootstrapSpotPrice =
    Number(bootstrap.data.pair_amount) /
    cometWeights[pairIndex] /
    (Number(bootstrap.data.bootstrap_amount) / cometWeights[bootstrapIndex]);

  const cometSpotPrice =
    Number(cometBalances[pairIndex]) /
    cometWeights[pairIndex] /
    (Number(cometBalances[bootstrapIndex]) / cometWeights[bootstrapIndex]);

  // estimate claim amount
  const estOutput = calculateOutput(
    bootstrap,
    backstopToken,
    0,
    walletAddress === bootstrap.config.bootstrapper
  );

  // find backstop deposit values
  const backstopDeposit = backstopDepositLPTokens.get(bootstrap.config.pool) ?? 0;
  const estBackstopDeposit = backstopDeposit + estOutput.claimAmount;

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
      <Container
        sx={{ gap: '12px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
      >
        <button onClick={() => setSearchParams()}>←</button>
        <button onClick={() => loadBootstrap(id, true)}>Refresh</button>
        <Paper sx={{ margin: '0px', alignItems: 'center', height: '28px', boxShadow: 'none' }}>
          Data ledger: {bootstrap.fetchLedger}
        </Paper>
        <Paper sx={{ margin: '0px', alignItems: 'center', height: '28px', boxShadow: 'none' }}>
          Current ledger: {currentLedger}
        </Paper>
        <Paper sx={{ margin: '0px', alignItems: 'center', height: '28px', boxShadow: 'none' }}>
          <LinkedText
            text={``}
            link={buildStellarExpertLink(bootstrapAddress)}
            sx={{
              marginTop: '0px',
              marginBottom: '0px',
            }}
          />
        </Paper>
      </Container>
      <h3>Bootstrap Config</h3>
      <Paper
        sx={{
          flexWrap: 'wrap',
          overflowWrap: 'break-word',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container sx={{ display: 'flex', flexDirection: 'row', marginBottom: '-12px' }}>
          <LinkedText
            text={`Pool: ${formatAddress(bootstrap.config.pool)}`}
            link={buildStellarExpertLink(bootstrap.config.pool)}
            sx={{
              marginTop: '0px',
              marginBottom: '0px',
            }}
          />
          <LinkedText
            text={`BLND-USDC LP: ${formatAddress(backstopToken.id)}`}
            link={buildStellarExpertLink(backstopToken.id)}
            sx={{
              marginTop: '0px',
              marginBottom: '0px',
            }}
          />
        </Container>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: '-12px',
          }}
        >
          <LinkedText
            text={`Creator: ${formatAddress(bootstrap.config.bootstrapper)}`}
            link={buildStellarExpertLink(bootstrap.config.bootstrapper)}
            sx={{
              marginTop: '0px',
              marginBottom: '0px',
            }}
          />
          <LinkedText
            text={`Bootstrap Token: ${bootstrapTokenSymbol}`}
            link={buildStellarExpertLink(bootstrap.bootstrapTokenId)}
            sx={{
              marginTop: '0px',
              marginBottom: '0px',
            }}
          />
          <LinkedText
            text={`Pair Token: ${pairTokenSymbol}`}
            link={buildStellarExpertLink(bootstrap.pairTokenId)}
            sx={{
              marginTop: '0px',
              marginBottom: '0px',
            }}
          />
        </Container>
      </Paper>

      <h3>Bootstrap Data</h3>
      <Paper sx={{ flexDirection: 'column' }}>
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
            Status: {displayBootstrapStatus(bootstrap.status)}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Close Ledger: {Number(bootstrap.config.close_ledger)}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Min. Pair Amount: {formatNumber(bootstrap.config.pair_min)} {pairTokenSymbol}
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
            Bootstrap Amount: {formatNumber(bootstrap.data.bootstrap_amount)} {bootstrapTokenSymbol}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Pair Token Amount: {formatNumber(bootstrap.data.pair_amount)} {pairTokenSymbol}
          </p>
        </Container>
      </Paper>
      <h3>{`Spot Price: ${bootstrapTokenSymbol}`}</h3>
      <Paper sx={{ flexDirection: 'column' }}>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            BLND-USDC LP: {Number.isFinite(cometSpotPrice) ? cometSpotPrice.toFixed(4) : '--'}{' '}
            {pairTokenSymbol}
          </p>
          <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            Bootstrap: {Number.isFinite(bootstrapSpotPrice) ? bootstrapSpotPrice.toFixed(4) : '--'}{' '}
            {pairTokenSymbol}
          </p>
        </Container>
      </Paper>
      {bootstrap.userDeposit.amount > BigInt(0) && (
        <>
          <h3>{`Your Deposit`}</h3>
          <Paper sx={{ flexDirection: 'column' }}>
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
                Amount: {formatNumber(bootstrap.userDeposit.amount)} {pairTokenSymbol}
              </p>
            </Container>
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
                Current Backstop Balance: {backstopDeposit.toFixed(4)} BLND-USDC LP
              </p>
            </Container>
            {bootstrap.userDeposit.claimed ? (
              <Container
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                  {`Claimed Backstop Deposit: ${
                    Number.isFinite(estOutput.claimAmount) ? estOutput.claimAmount.toFixed(4) : '--'
                  } BLND-USDC LP ${
                    Number.isFinite(estOutput.claimInUSDC)
                      ? '(~' + estOutput.claimInUSDC.toFixed(2) + ' USDC)'
                      : ''
                  }`}
                </p>
              </Container>
            ) : (
              <>
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
                    {`Est. Claim Backstop Deposit: ${
                      Number.isFinite(estOutput.claimAmount)
                        ? estOutput.claimAmount.toFixed(4)
                        : '--'
                    } BLND-USDC LP ${
                      Number.isFinite(estOutput.claimInUSDC)
                        ? '(~' + estOutput.claimInUSDC.toFixed(2) + ' USDC)'
                        : ''
                    }`}
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
                    Est. Final Backstop Balance:{' '}
                    {isFinite(estBackstopDeposit) ? estBackstopDeposit.toFixed(4) : '--'} BLND-USDC
                    LP
                  </p>
                </Container>
              </>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
}

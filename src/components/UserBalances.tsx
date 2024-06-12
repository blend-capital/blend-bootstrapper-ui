import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import Box from './common/Box';
import { useWallet } from '../hooks/wallet';
import Container from './common/Container';
import StackedText from './common/StackedText';

export const UserBalances = () => {
  const { fetchBalance, walletAddress, connected } = useWallet();
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined);
  const { bootstrap, bootstrapperConfig, userDeposit, id } = useBootstrapper();
  useEffect(() => {
    if (connected && bootstrap && bootstrapperConfig) {
      let pairTokenId = bootstrapperConfig.cometTokenData[1 ^ bootstrap.config.token_index].address;
      fetchBalance(pairTokenId, walletAddress)
        .then((balance) => {
          setWalletBalance(Number(balance));
        })
        .catch((error) => console.error(error));
    } else {
      setWalletBalance(undefined);
    }
  }, [connected, bootstrap, bootstrapperConfig, id, walletAddress]);

  if (!connected || bootstrapperConfig == undefined || id == undefined) {
    return <></>;
  }
  return (
    <Container sx={{ flexDirection: 'column', justifyContent: 'center' }}>
      <h3>User Balances</h3>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StackedText
          title="Deposit Amount"
          text={userDeposit ? userDeposit.amount.toString() : '0'}
          sx={{ flexDirection: 'column' }}
        />
        <StackedText
          title="Pair Token Wallet Balance"
          text={walletBalance ? walletBalance.toString() : '0'}
          sx={{ flexDirection: 'column' }}
        />
      </Box>
    </Container>
  );
};

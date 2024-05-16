import { useEffect, useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import Box from './Box';
import { useWallet } from '../hooks/wallet';

export const UserBalances = () => {
  const { fetchBalance, walletAddress, connected } = useWallet();
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined);
  const { bootstrap, bootstrapperConfig, userDeposit, id } = useBootstrapper();
  useEffect(() => {
    if (connected && bootstrap && bootstrapperConfig) {
      let pairTokenId = bootstrapperConfig.cometTokenData[1 ^ bootstrap.config.token_index].address;
      fetchBalance(pairTokenId, walletAddress)
        .then((balance) => setWalletBalance(Number(balance)))
        .catch((error) => console.error(error));
    } else {
      setWalletBalance(undefined);
    }
  }, [connected, bootstrap, bootstrapperConfig, id]);

  if (
    !connected ||
    walletBalance == undefined ||
    userDeposit == undefined ||
    bootstrapperConfig == undefined ||
    id == undefined
  ) {
    return <></>;
  }
  return (
    <div style={{ flexDirection: 'column', justifyContent: 'center', width: '400px' }}>
      <h3>User Data</h3>
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
          <p style={{ marginRight: '10px' }}>Deposit Amount:</p> {Number(userDeposit.amount)}
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
          <p style={{ marginRight: '10px' }}>Pair Token Wallet Balance:</p> {Number(walletBalance)}
        </Box>
      </div>
    </div>
  );
};

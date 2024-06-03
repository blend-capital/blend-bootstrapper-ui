import { useEffect, useState } from 'react';
import { BootstrapData } from './BootstrapData';
import { UserBalances } from './UserBalances';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { CometBalances } from './SpotPrice';
import Container from './common/Container';
export function JoinBootstrap() {
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [newSpotPrice, setNewSpotPrice] = useState<number | undefined>(undefined);
  const { bootstrapperId, bootstrap, id, setId, cometBalances, bootstrapperConfig } =
    useBootstrapper();
  const { joinBootstrap } = useWallet();

  useEffect(() => {
    if (bootstrap && bootstrapperConfig && amount) {
      const bootstrapIndex = bootstrap.config.token_index;
      const pairTokenIndex = 1 ^ bootstrapIndex;
      const bootstrapTokenData = bootstrapperConfig.cometTokenData[bootstrapIndex];
      const pairTokenData = bootstrapperConfig.cometTokenData[pairTokenIndex];

      const newSpotPrice =
        (Number(bootstrap.data.pair_amount) + parseInt(amount)) /
        (pairTokenData.weight / 100) /
        (Number(bootstrap.data.bootstrap_amount) / (bootstrapTokenData.weight / 100));
      setNewSpotPrice(newSpotPrice);
    }
  }, [cometBalances, bootstrap, id, amount]);
  function SubmitTx() {
    if (bootstrapperId && id != undefined && amount) {
      joinBootstrap(bootstrapperId, id, BigInt(amount));
    }
  }

  return (
    <Container
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <h2>Join Bootstrap</h2>
      <BootstrapData />
      <CometBalances />
      <UserBalances />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Bootstrap Id
        </label>
        <input
          type="text"
          placeholder="Enter Bootstrap Id"
          value={id}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            if (!isNaN(id)) setId(id);
            else setId(undefined);
          }}
          style={{ flexGrow: 1 }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Amount</label>
        <input
          type="text"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flexGrow: 1 }}
        />
      </div>
      {amount && parseInt(amount) > 0 ? <p>New Bootstrap Spot Price: {newSpotPrice}</p> : <></>}
      <button onClick={() => SubmitTx()}>Submit</button>
    </Container>
  );
}

import { useState } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import { UserBalances } from './UserBalances';

export function ExitBootstrap() {
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const { bootstrapperId, bootstrap, id, setId } = useBootstrapper();

  const { exitBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined && amount) {
      exitBootstrap(bootstrapperId, id, BigInt(amount));
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>Exit Bootstrap</h2>
      {bootstrap ? <BootstrapData bootstrap={bootstrap} /> : <></>}
      <UserBalances />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
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
          width: '50%',
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
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';

export function ClaimBootstrap() {
  const { bootstrapperId, bootstrap, id, setId } = useBootstrapper();

  const { claimBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined) {
      claimBootstrap(bootstrapperId, id);
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
      <h2>Claim Bootstrap</h2>
      {bootstrap ? <BootstrapData /> : <></>}

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
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

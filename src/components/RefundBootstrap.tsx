import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';

export function RefundBootstrap() {
  const { bootstrapperId, bootstrap, userDeposit, id, setId, bootstrapperConfig } =
    useBootstrapper();

  const { refundBootstrap, connected } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined) {
      refundBootstrap(bootstrapperId, id);
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
      <h2>Refund Bootstrap</h2>
      <BootstrapData />
      {userDeposit && id != undefined && connected ? (
        <Box>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
              Refund Status: {userDeposit.refunded.toString()}
            </p>
          </div>
        </Box>
      ) : (
        <></>
      )}

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

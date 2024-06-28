import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapStatus } from '../types';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';

export function RefundBootstrap() {
  const { bootstrapperId, userDeposit, id, setId, bootstrap, fetchBootstrap, fetchUserDeposit } =
    useBootstrapper();

  const { refundBootstrap, connected, walletAddress } = useWallet();

  function SubmitTx() {
    if (id != undefined && connected) {
      refundBootstrap(bootstrapperId, id).then((success) => {
        if (success) {
          fetchBootstrap(id);
          fetchUserDeposit(id, walletAddress);
        }
      });
    }
  }

  const isValidBootstrap = !!bootstrap && bootstrap.status === BootstrapStatus.Cancelled;

  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
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

      <LabeledInput
        label={'Bootstrap Id'}
        placeHolder={'Enter Bootstrap Id'}
        type="number"
        value={id}
        onChange={function (value: string): void {
          const newId = parseInt(value);
          if (!isNaN(newId)) setId(newId);
          else setId(undefined);
        }}
        disabled={id !== undefined ? isValidBootstrap : false}
        errorMessage="Invalid Bootstrap Id"
      />
      <button onClick={() => SubmitTx()} disabled={!isValidBootstrap}>
        Submit
      </button>
    </Box>
  );
}

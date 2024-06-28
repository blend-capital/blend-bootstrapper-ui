import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapStatus } from '../types';
import { formatNumber } from '../utils/numberFormatter';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import Container from './common/Container';
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
  const hasRefund =
    userDeposit !== undefined && !userDeposit?.refunded && userDeposit?.amount > BigInt(0);
  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>Refund Bootstrap</h2>
      <BootstrapData />

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
        disabled={id !== undefined ? !isValidBootstrap : false}
        errorMessage="Invalid Bootstrap Id"
      />
      {userDeposit && id != undefined && connected && (
        <Container>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
              Refund Status: {userDeposit.refunded ? 'Refunded' : 'Not Refunded'}
            </p>
            {userDeposit.refunded ? (
              <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                Refunded Amount: {formatNumber(userDeposit.amount)}
              </p>
            ) : (
              <p style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                Refund Amount: {formatNumber(userDeposit.amount)}
              </p>
            )}
          </div>
        </Container>
      )}
      <button onClick={() => SubmitTx()} disabled={!isValidBootstrap || !hasRefund}>
        Submit
      </button>
    </Box>
  );
}

import { ChangeEvent } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';

export function RefundBootstrap() {
  const { bootstrapperId, userDeposit, id, setId } = useBootstrapper();

  const { refundBootstrap, connected } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined) {
      refundBootstrap(bootstrapperId, id);
    }
  }
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
        value={id}
        onChange={function (e: ChangeEvent<HTMLInputElement>): void {
          const id = parseInt(e.target.value);
          if (!isNaN(id)) setId(id);
          else setId(undefined);
        }}
      />
      <button onClick={() => SubmitTx()}>Submit</button>
    </Box>
  );
}

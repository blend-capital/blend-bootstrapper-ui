import { ChangeEvent } from 'react';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';

export function CloseBootstrap() {
  const { bootstrapperId, id, setId } = useBootstrapper();
  const { closeBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && id != undefined) {
      closeBootstrap(bootstrapperId, id);
    }
  }
  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#CEDCFB',
      }}
    >
      <h2>Close Bootstrap</h2>
      <BootstrapData />
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

import { useBootstrapper } from '../hooks/bootstrapContext';
import { useWallet } from '../hooks/wallet';
import { BootstrapStatus } from '../types';
import { BootstrapData } from './BootstrapData';
import Box from './common/Box';
import LabeledInput from './common/LabeledInput';

export function CloseBootstrap() {
  const { bootstrapperId, id, setId, bootstrap, fetchBootstrap } = useBootstrapper();
  const { closeBootstrap, connected } = useWallet();
  function SubmitTx() {
    if (id != undefined && connected) {
      closeBootstrap(bootstrapperId, id).then((success) => {
        if (success) {
          fetchBootstrap(id);
        }
      });
    }
  }
  return (
    <Box
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>Close Bootstrap</h2>
      <BootstrapData />
      <LabeledInput
        label={'Bootstrap Id'}
        placeHolder={'Enter Bootstrap Id'}
        type="number"
        value={id}
        onChange={function (value: string): void {
          const id = parseInt(value);
          if (!isNaN(id)) setId(id);
          else setId(undefined);
        }}
        disabled={id !== undefined ? !bootstrap : false}
        errorMessage="Invalid Bootstrap Id"
      />
      <button
        onClick={() => SubmitTx()}
        disabled={!bootstrap || bootstrap.status != BootstrapStatus.Closing}
      >
        Submit
      </button>
    </Box>
  );
}

import { TxStatus, useWallet } from '../hooks/wallet';
import { Loader } from './common/Loader';
import Paper from './common/Paper';

export const TxStatusOverlay: React.FC = () => {
  const { txStatus, clearLastTx, lastTxFailure } = useWallet();

  if (txStatus === TxStatus.NONE) {
    return <></>;
  }
  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '2em',
        gap: '12px',
      }}
    >
      {TxStatus[txStatus]}
      {txStatus === TxStatus.FAIL ? `: ${lastTxFailure}` : ''}
      {(txStatus === TxStatus.BUILDING ||
        txStatus === TxStatus.SIGNING ||
        txStatus === TxStatus.SUBMITTING) && <Loader />}
      <button
        onClick={clearLastTx}
        style={{ fontSize: '1.5em', background: 'none', border: 'none' }}
      >
        X
      </button>
    </Paper>
  );
};

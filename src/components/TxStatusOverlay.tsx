import { TxStatus, useWallet } from '../hooks/wallet';

export const TxStatusOverlay: React.FC = () => {
  const { txStatus, clearLastTx, lastTxFailure } = useWallet();

  if (txStatus === TxStatus.NONE) {
    return <></>;
  }
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '2em',
      }}
    >
      {TxStatus[txStatus]}
      {txStatus === TxStatus.FAIL ? `: ${lastTxFailure}` : ''}
      <button
        onClick={clearLastTx}
        style={{ fontSize: '1.5em', background: 'none', border: 'none' }}
      >
        X
      </button>
    </div>
  );
};

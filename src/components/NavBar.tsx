import { useWallet } from '../hooks/wallet';

export const NavBar = () => {
  const { walletAddress, connect, disconnect, connected } = useWallet();

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '24px',
        }}
      >
        <a href="https://blend.capital" target="_blank" rel="noreferrer">
          <img src="/blend_logo.svg" alt="Logo" height={'40px'} width={'40px'} />
        </a>
        <a
          href="https://docs.blend.capital/pool-creators/backstop-bootstrapping"
          target="_blank"
          rel="noreferrer"
        >
          <h4>Docs</h4>
        </a>
        <a
          href="https://github.com/blend-capital/backstop-bootstrapper"
          target="_blank"
          rel="noreferrer"
        >
          <h4>GitHub</h4>
        </a>
      </div>

      {!connected ? (
        <button
          onClick={() => {
            connect();
          }}
        >
          Connect wallet
        </button>
      ) : (
        <div>
          <button
            style={{
              marginRight: '6px',
            }}
            disabled={true}
          >
            {walletAddress.substring(0, 4).concat('...').concat(walletAddress.slice(-4))}
          </button>
          <button
            className="disconnect-button"
            onClick={() => {
              disconnect();
            }}
          >
            X
          </button>
        </div>
      )}
    </nav>
  );
};

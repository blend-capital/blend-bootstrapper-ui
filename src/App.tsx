import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Actions } from './components/Actions';
import { BootstrapData } from './components/BootstrapData';
import { BootstrapPreview } from './components/BootstrapPreview';
import { NavBar } from './components/NavBar';
import { TxStatusOverlay } from './components/TxStatusOverlay';
import Container from './components/common/Container';
import { useBootstrapper } from './hooks/bootstrapContext';
import { useWallet } from './hooks/wallet';

function App() {
  const { loadBootstrap, loadLastId, bootstraps } = useBootstrapper();
  const { walletAddress } = useWallet();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const num_id = id ? parseInt(id) : undefined;

  const [idsToRender, setIdsToRender] = useState<number[]>([]);

  useEffect(() => {
    if (num_id !== undefined) {
      loadBootstrap(num_id, bootstraps.size === 0);
    } else if (idsToRender.length === 0) {
      loadLastId().then((id) => {
        const ids = Array.from({ length: id + 1 }, (_, i) => id - i);
        if (ids.length > 3) {
          setIdsToRender(ids.slice(0, 3));
        } else {
          setIdsToRender(ids);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, num_id]);

  const handleShowMore = () => {
    const lastShown = idsToRender[idsToRender.length - 1];
    if (lastShown <= 0) {
      return;
    }

    const newIdsToRender = [];
    for (let i = lastShown - 1; i >= 0 && newIdsToRender.length < 3; i--) {
      newIdsToRender.push(i);
    }
    setIdsToRender([...idsToRender, ...newIdsToRender]);
  };

  return (
    <div className="app-container">
      <NavBar />
      <Container
        sx={{
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <h1 style={{ marginBottom: '6px' }}>Backstop Bootstrapper</h1>
        {num_id !== undefined ? (
          <>
            <BootstrapData id={num_id} />
            <Actions id={num_id} />
          </>
        ) : (
          <Container
            sx={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <h2 style={{ marginBottom: '0px' }}>Select a Bootstrap</h2>
            {idsToRender.map((id) => (
              <BootstrapPreview key={id} id={id} />
            ))}
            {idsToRender.length !== 0 && idsToRender[idsToRender.length - 1] !== 0 && (
              <Container
                sx={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <button onClick={handleShowMore}>Show More</button>
              </Container>
            )}
          </Container>
        )}
        <TxStatusOverlay />
      </Container>
    </div>
  );
}

export default App;

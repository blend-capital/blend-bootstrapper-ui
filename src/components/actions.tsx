import { SelectableInput } from './common/SelectableInput';
import { useBootstrapper } from '../hooks/bootstrapContext';
import Box from './common/Box';
import { NewBootstrap } from './NewBootstrap';
import { JoinBootstrap } from './JoinBootstrap';
import { ExitBootstrap } from './ExitBootstrap';
import { ClaimBootstrap } from './ClaimBootstrap';
import { CloseBootstrap } from './CloseBootstrap';
import { RefundBootstrap } from './RefundBootstrap';

export function ActionOptions() {
  const { setBootstrapperId, bootstrapperId } = useBootstrapper();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px',
      }}
    >
      <Box sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <h3>Enter a Bootstrap Contract Address to Select an Action</h3>
        <div className="address">
          <input
            type="text"
            placeholder="Enter Bootstrapper Address"
            value={bootstrapperId}
            style={{
              display: 'flex',
              padding: '10px',
              width: '170px',
            }}
            onChange={(e) => setBootstrapperId(e.target.value)}
          />{' '}
        </div>
        <div
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '40px' }}
        >
          <SelectableInput inputName={'New Bootstrap'}></SelectableInput>
          <SelectableInput inputName={'Join Bootstrap'}></SelectableInput>
          <SelectableInput inputName={'Exit Bootstrap'}></SelectableInput>
          <SelectableInput inputName={'Close Bootstrap'}></SelectableInput>
          <SelectableInput inputName={'Claim Bootstrap'}></SelectableInput>
          <SelectableInput inputName={'Refund Bootstrap'}></SelectableInput>
        </div>
      </Box>
    </div>
  );
}

export function DisplayAction() {
  const { selectedOption, bootstrapperId } = useBootstrapper();
  if (bootstrapperId == undefined || bootstrapperId == '') {
    return <></>;
  } else if (selectedOption == 'New Bootstrap') {
    return (
      <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
        <NewBootstrap />
      </Box>
    );
  } else if (selectedOption == 'Join Bootstrap') {
    return (
      <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
        <JoinBootstrap />
      </Box>
    );
  } else if (selectedOption == 'Exit Bootstrap') {
    return (
      <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
        <ExitBootstrap />
      </Box>
    );
  } else if (selectedOption == 'Close Bootstrap') {
    return (
      <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
        <CloseBootstrap />
      </Box>
    );
  } else if (selectedOption == 'Claim Bootstrap') {
    return (
      <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
        <ClaimBootstrap />
      </Box>
    );
  } else if (selectedOption == 'Refund Bootstrap') {
    return (
      <Box sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
        <RefundBootstrap />
      </Box>
    );
  }
}

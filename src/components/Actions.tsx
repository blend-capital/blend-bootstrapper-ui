import { SelectableInput } from './common/SelectableInput';
import { useBootstrapper } from '../hooks/bootstrapContext';
import Box from './common/Box';
import { NewBootstrap } from './NewBootstrap';
import { JoinBootstrap } from './JoinBootstrap';
import { ExitBootstrap } from './ExitBootstrap';
import { ClaimBootstrap } from './ClaimBootstrap';
import { CloseBootstrap } from './CloseBootstrap';
import { RefundBootstrap } from './RefundBootstrap';
import Container from './common/Container';

export function ActionOptions() {
  const { setBootstrapperId, bootstrapperId } = useBootstrapper();
  return (
    <Container
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
      <Container
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexBasis: 'content',
        }}
      >
        <SelectableInput inputName={'Create'}></SelectableInput>
        <SelectableInput inputName={'Join'}></SelectableInput>
        <SelectableInput inputName={'Exit'}></SelectableInput>
        <SelectableInput inputName={'Close'}></SelectableInput>
        <SelectableInput inputName={'Claim'}></SelectableInput>
        <SelectableInput inputName={'Refund'}></SelectableInput>
      </Container>
    </Container>
  );
}

export function DisplayAction() {
  const { selectedOption, bootstrapperId } = useBootstrapper();
  if (bootstrapperId == undefined || bootstrapperId == '') {
    return <></>;
  } else if (selectedOption == 'Create') {
    return <NewBootstrap />;
  } else if (selectedOption == 'Join') {
    return <JoinBootstrap />;
  } else if (selectedOption == 'Exit') {
    return <ExitBootstrap />;
  } else if (selectedOption == 'Close') {
    return <CloseBootstrap />;
  } else if (selectedOption == 'Claim') {
    return <ClaimBootstrap />;
  } else if (selectedOption == 'Refund') {
    return <RefundBootstrap />;
  }
}

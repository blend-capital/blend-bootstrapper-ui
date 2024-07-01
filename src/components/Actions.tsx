import { SelectableInput } from './common/SelectableInput';
import { useBootstrapper } from '../hooks/bootstrapContext';
import { NewBootstrap } from './NewBootstrap';
import { JoinBootstrap } from './JoinBootstrap';
import { ExitBootstrap } from './ExitBootstrap';
import { ClaimBootstrap } from './ClaimBootstrap';
import { CloseBootstrap } from './CloseBootstrap';
import { RefundBootstrap } from './RefundBootstrap';
import Container from './common/Container';

export function ActionOptions() {
  return (
    <Container
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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

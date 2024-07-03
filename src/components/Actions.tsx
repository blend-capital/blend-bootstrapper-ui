import { useState } from 'react';
import { BootstrapProps } from '../types';
import { ClaimBootstrap } from './ClaimBootstrap';
import { CloseBootstrap } from './CloseBootstrap';
import { ExitBootstrap } from './ExitBootstrap';
import { JoinBootstrap } from './JoinBootstrap';
import { RefundBootstrap } from './RefundBootstrap';
import Container from './common/Container';
import { SelectableButton } from './common/SelectableInput';

export enum BootstrapActions {
  Create,
  Join,
  Exit,
  Close,
  Claim,
  Refund,
  None,
}

export function Actions({ id }: BootstrapProps) {
  const [option, setOption] = useState<BootstrapActions>(BootstrapActions.None);

  const Action = () => {
    if (option === BootstrapActions.Join) {
      return <JoinBootstrap id={id} />;
    } else if (option === BootstrapActions.Exit) {
      return <ExitBootstrap id={id} />;
    } else if (option === BootstrapActions.Close) {
      return <CloseBootstrap id={id} />;
    } else if (option === BootstrapActions.Claim) {
      return <ClaimBootstrap id={id} />;
    } else if (option === BootstrapActions.Refund) {
      return <RefundBootstrap id={id} />;
    } else {
      return <></>;
    }
  };

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
          gap: '12px',
        }}
      >
        <SelectableButton
          text={'Join'}
          selected={option === BootstrapActions.Join}
          onClick={() => setOption(BootstrapActions.Join)}
        />
        <SelectableButton
          text={'Exit'}
          selected={option === BootstrapActions.Exit}
          onClick={() => setOption(BootstrapActions.Exit)}
        />
        <SelectableButton
          text={'Close'}
          selected={option === BootstrapActions.Close}
          onClick={() => setOption(BootstrapActions.Close)}
        />
        <SelectableButton
          text={'Claim'}
          selected={option === BootstrapActions.Claim}
          onClick={() => setOption(BootstrapActions.Claim)}
        />
        <SelectableButton
          text={'Refund'}
          selected={option === BootstrapActions.Refund}
          onClick={() => setOption(BootstrapActions.Refund)}
        />
      </Container>
      <Action />
    </Container>
  );
}

import { Bootstrap, DepositData } from '../utils/bootstrapper';

export interface BootstrapState extends Bootstrap {
  id: number;
  pairTokenId: string;
  bootstrapTokenId: string;
  userDeposit: DepositData;
  userPairTokenBalance: bigint;
  fetchTimestamp: number;
  fetchLedger: number;
}

export interface BootstrapProps {
  id: number;
}

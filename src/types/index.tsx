export interface BootstrapParams {
  /// The amount of the bootstrap token to bootstrap
  amount: BigInt;
  /// The address creating the bootstrap
  bootstrapper: string;
  /// The ledger number at which the bootstrap will close
  close_ledger: number;
  /// The minimum amount of the pair token to bootstrap
  pair_min: BigInt;
  /// The address of the pool to bootstrap
  pool: string;
  /// The index of the comet underlying token being bootstrapped
  token_index: number;
}

export interface data {
  total_pair: BigInt;
  total_backstop_tokens: BigInt;
  bootstrap_amount: BigInt;
  pair_amount: BigInt;
}

export enum BootstrapStatus {
  Active = 0,
  Closing = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface Bootstrap {
  status: BootstrapStatus;
  data: data;
  config: BootstrapParams;
}

export interface CometTokenData {
  /// The address of the token
  address: string;
  /// The weight of the token
  weight: number;
}
export interface BootstrapperConfig {
  backstopId: string;
  backstopTokenId: string;
  cometTokenData: CometTokenData[];
}

export interface UserDeposit {
  amount: BigInt;
  claimed: BigInt;
  refunded: BigInt;
}

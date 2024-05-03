export interface BootstrapConfig {
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

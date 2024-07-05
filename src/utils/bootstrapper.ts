import { Contract, Operation, contract, xdr } from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import { BootstrapState } from '../types';
import { BackstopToken } from './backstopToken';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  standalone: {
    networkPassphrase: 'Standalone Network ; February 2017',
    contractId: 'CBWH54OKUK6U2J2A4J2REJEYB625NEFCHISWXLOPR2D2D6FTN63TJTWN',
  },
} as const;

export interface Bootstrap {
  config: BootstrapConfig;
  data: BootstrapData;
  id: number;
  status: BootstrapStatus;
}

/**
 * The error codes for the contract.
 */
export const Errors = {
  1: { message: '' },
  3: { message: '' },
  4: { message: '' },
  8: { message: '' },
  9: { message: '' },
  10: { message: '' },
  12: { message: '' },
  50: { message: '' },
  100: { message: '' },
  101: { message: '' },
  102: { message: '' },
  103: { message: '' },
  104: { message: '' },
  105: { message: '' },
  106: { message: '' },
  107: { message: '' },
  108: { message: '' },
};

export interface DepositKey {
  id: number;
  user: string;
}

export type BootstrapKey =
  | { tag: 'Config'; values: readonly [number] }
  | { tag: 'Data'; values: readonly [number] }
  | { tag: 'Claim'; values: readonly [number] }
  | { tag: 'Refund'; values: readonly [number] }
  | { tag: 'Deposit'; values: readonly [DepositKey] };

export enum BootstrapStatus {
  Active = 0,
  Closing = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface TokenInfo {
  address: string;
  weight: bigint;
}

export interface BootstrapConfig {
  /**
   * The amount of the bootstrap token to bootstrap
   */
  amount: bigint;
  /**
   * The address creating the bootstrap
   */
  bootstrapper: string;
  /**
   * The ledger number at which the bootstrap will close
   */
  close_ledger: number;
  /**
   * The minimum amount of the pair token to bootstrap
   */
  pair_min: bigint;
  /**
   * The address of the pool to bootstrap
   */
  pool: string;
  /**
   * The index of the comet underlying token being bootstrapped
   */
  token_index: number;
}

export interface BootstrapData {
  /**
   * The amount of the boostrapped token held by the contract for this boostrap
   */
  bootstrap_amount: bigint;
  /**
   * The amount of pair tokens held by the contract for this bootstrap
   */
  pair_amount: bigint;
  total_backstop_tokens: bigint;
  /**
   * The total number of pair tokens deposited for this bootstrap
   */
  total_pair: bigint;
}

export interface DepositData {
  amount: bigint;
  claimed: boolean;
  refunded: boolean;
}

export const BootstrapSpec = new contract.Spec([
  'AAAAAQAAAAAAAAAAAAAACUJvb3RzdHJhcAAAAAAAAAQAAAAAAAAABmNvbmZpZwAAAAAH0AAAAA9Cb290c3RyYXBDb25maWcAAAAAAAAAAARkYXRhAAAH0AAAAA1Cb290c3RyYXBEYXRhAAAAAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAD0Jvb3RzdHJhcFN0YXR1cwA=',
  'AAAAAAAAAQVJbml0aWFsaXplIHRoZSBjb250cmFjdAoKIyMjIEFyZ3VtZW50cwoqIGBiYWNrc3RvcGAgLSBUaGUgYmFja3N0b3AgYWRkcmVzcwoqIGBiYWNrc3RvcF90b2tlbmAgLSBUaGUgYmFja3N0b3AgdG9rZW4gYWRkcmVzcwoqIGBwb29sX2ZhY3RvcnlfYWRkcmVzc2AgLSBUaGUgcG9vbCBmYWN0b3J5IGFkZHJlc3MKCiMjIyBQYW5pY3MKKiBgQWxyZWFkeUluaXRpYWxpemVkRXJyb3JgIC0gSWYgdGhlIGNvbnRyYWN0IGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAIYmFja3N0b3AAAAATAAAAAAAAAA5iYWNrc3RvcF90b2tlbgAAAAAAEwAAAAAAAAAUcG9vbF9mYWN0b3J5X2FkZHJlc3MAAAATAAAAAA==',
  'AAAAAAAAAEpGZXRjaCBkYXRhIGZvciBhIGJvb3RzdHJhcAoKIyMjIEFyZ3VtZW50cwoqIGBpZGAgLSBUaGUgaWQgb2YgdGhlIGJvb3RzdHJhcAAAAAAADWdldF9ib290c3RyYXAAAAAAAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAfQAAAACUJvb3RzdHJhcAAAAA==',
  'AAAAAAAAAHpGZXRjaCB0aGUgbmV4dCBib290c3RyYXAncyBJRC4gVGhlIHByZXZpb3VzIChhbmQgbW9zdCByZWNlbnRseSBjcmVhdGVkKSBib290c3JhcCdzIElEIHdpbGwKYmUgdGhpcyB2YWx1ZSBkZWNyZW1lbnRlZCBieSAxLgAAAAAAC2dldF9uZXh0X2lkAAAAAAAAAAABAAAABA==',
  'AAAAAAAAAHxGZXRjaCBhIGRlcG9zaXQgZm9yIGEgdXNlciBpbiBhIGJvb3RzdHJhcAoKIyMjIEFyZ3VtZW50cwoqIGBpZGAgLSBUaGUgaWQgb2YgdGhlIGJvb3RzdHJhcAoqIGB1c2VyYCAtIFRoZSBhZGRyZXNzIG9mIHRoZSB1c2VyAAAAC2dldF9kZXBvc2l0AAAAAAIAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAfQAAAAC0RlcG9zaXREYXRhAA==',
  'AAAAAAAAAHRBZGQgYSBuZXcgYm9vdHN0cmFwCgpSZXR1cm5zIHRoZSBJRCBvZiB0aGUgYm9vdHN0cmFwCgojIyMgQXJndW1lbnRzCiogYGNvbmZpZ2AgLSBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGJvb3RzdHJhcAAAAAlib290c3RyYXAAAAAAAAABAAAAAAAAAAZjb25maWcAAAAAB9AAAAAPQm9vdHN0cmFwQ29uZmlnAAAAAAEAAAAE',
  'AAAAAAAAASRKb2luIGEgYm9vdHN0cmFwIGJ5IGRlcG9zaXRpbmcgYSBnaXZlbiBhbW91bnQgb2YgcGFpciB0b2tlbnMKClJldHVybnMgdGhlIHRvdGFsIGFtb3VudCBvZiBwYWlyIHRva2VucyBkZXBvc2l0ZWQgYnkgYGZyb21gIGluIHRoaXMgYm9vdHN0cmFwCgojIyMgQXJndW1lbnRzCiogYGZyb21gIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHVzZXIgam9pbmluZyB0aGUgYm9vdHN0cmFwCiogYGlkYCAtIFRoZSBib290c3RyYXAgaWQgdG8gam9pbgoqIGBhbW91bnRgIC0gVGhlIGFtb3VudCBvZiB0b2tlbnMgdG8gam9pbiB3aXRoAAAABGpvaW4AAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACaWQAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAAL',
  'AAAAAAAAASpFeGl0cyBhIGJvb3RzdHJhcCBieSB3aXRoZHJhd2luZyBhIGdpdmVuIGFtb3VudCBvZiBwYWlyIHRva2VucwoKUmV0dXJucyB0aGUgcmVtYWluaW5nIGFtb3VudCBvZiBwYWlyIHRva2VucyBkZXBvc2l0ZWQgYnkgYGZyb21gIGluIHRoaXMgYm9vdHN0cmFwCgojIyMgQXJndW1lbnRzCiogYGZyb21gIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHVzZXIgam9pbmluZyB0aGUgYm9vdHN0cmFwCiogYGlkYCAtIFRoZSBib290c3RyYXAgaWQgdG8gam9pbgoqIGBhbW91bnRgIC0gVGhlIGFtb3VudCBvZiB0b2tlbnMgdG8gam9pbiB3aXRoAAAAAAAEZXhpdAAAAAMAAAAAAAAABGZyb20AAAATAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAs=',
  'AAAAAAAAAHVDbG9zZSB0aGUgYm9vdHN0cmFwIGJ5IGRlcG9zaXRpbmcgYm9vdHN0cmFwcGluZyB0b2tlbnMgaW50byB0aGUgY29tZXQKCiMjIyBBcmd1bWVudHMKKiBgaWRgIC0gVGhlIGlkIG9mIHRoZSBib290c3RyYXAAAAAAAAAFY2xvc2UAAAAAAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAL',
  'AAAAAAAAAN1DbGFpbSBhbmQgZGVwb3NpdCBwb29sIHRva2VucyBpbnRvIGJhY2tzdG9wCgpSZXR1cm5zIHRoZSBhbW91bnQgb2YgYmFja3N0b3Agc2hhcmVzIG1pbnRlZAoKIyMjIEFyZ3VtZW50cwoqIGBmcm9tYCAtIFRoZSBhZGRyZXNzIG9mIHRoZSB1c2VyIGNsYWltaW5nIHRoZWlyIGJvb3RzdHJhcCBwcm9jZWVkcwoqIGBpZGAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgYm9vdHN0cmFwIGluaXRpYXRvcgAAAAAAAAVjbGFpbQAAAAAAAAIAAAAAAAAABGZyb20AAAATAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAL',
  'AAAAAAAAANFSZWZ1bmQgZnVuZHMgZnJvbSBhIGNhbmNlbGxlZCBib290c3RyYXAKClJldHVybnMgdGhlIGFtb3VudCBvZiBmdW5kcyByZXR1cm5lZAoKIyMjIEFyZ3VtZW50cwoqIGBmcm9tYCAtIFRoZSBhZGRyZXNzIG9mIHRoZSB1c2VyIGNsYWltaW5nIHRoZWlyIGJvb3RzdHJhcCBwcm9jZWVkcwoqIGBpZGAgLSBUaGUgYWRkcmVzcyBvZiB0aGUgYm9vdHN0cmFwIGluaXRpYXRvcgAAAAAAAAZyZWZ1bmQAAAAAAAIAAAAAAAAABGZyb20AAAATAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAL',
  'AAAABAAAACFUaGUgZXJyb3IgY29kZXMgZm9yIHRoZSBjb250cmFjdC4AAAAAAAAAAAAAGUJhY2tzdG9wQm9vdHN0cmFwcGVyRXJyb3IAAAAAAAARAAAAAAAAAA1JbnRlcm5hbEVycm9yAAAAAAAAAQAAAAAAAAAXQWxyZWFkeUluaXRpYWxpemVkRXJyb3IAAAAAAwAAAAAAAAARVW5hdXRob3JpemVkRXJyb3IAAAAAAAAEAAAAAAAAABNOZWdhdGl2ZUFtb3VudEVycm9yAAAAAAgAAAAAAAAADkFsbG93YW5jZUVycm9yAAAAAAAJAAAAAAAAAAxCYWxhbmNlRXJyb3IAAAAKAAAAAAAAAA1PdmVyZmxvd0Vycm9yAAAAAAAADAAAAAAAAAAKQmFkUmVxdWVzdAAAAAAAMgAAAAAAAAASSW52YWxpZENsb3NlTGVkZ2VyAAAAAABkAAAAAAAAABVJbnZhbGlkQm9vdHN0cmFwVG9rZW4AAAAAAABlAAAAAAAAABZJbnZhbGlkQm9vdHN0cmFwQW1vdW50AAAAAABmAAAAAAAAABdJbnZhbGlkUG9vbEFkZHJlc3NFcnJvcgAAAABnAAAAAAAAABZJbnZhbGlkQm9vdHN0cmFwU3RhdHVzAAAAAABoAAAAAAAAABNBbHJlYWR5Q2xhaW1lZEVycm9yAAAAAGkAAAAAAAAAGEluc3VmZmljaWVudERlcG9zaXRFcnJvcgAAAGoAAAAAAAAAGFJlY2VpdmVkTm9CYWNrc3RvcFRva2VucwAAAGsAAAAAAAAAFEFscmVhZHlSZWZ1bmRlZEVycm9yAAAAbA==',
  'AAAAAQAAAAAAAAAAAAAACkRlcG9zaXRLZXkAAAAAAAIAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAR1c2VyAAAAEw==',
  'AAAAAgAAAAAAAAAAAAAADEJvb3RzdHJhcEtleQAAAAUAAAABAAAAAAAAAAZDb25maWcAAAAAAAEAAAAEAAAAAQAAAAAAAAAERGF0YQAAAAEAAAAEAAAAAQAAAAAAAAAFQ2xhaW0AAAAAAAABAAAABAAAAAEAAAAAAAAABlJlZnVuZAAAAAAAAQAAAAQAAAABAAAAAAAAAAdEZXBvc2l0AAAAAAEAAAfQAAAACkRlcG9zaXRLZXkAAA==',
  'AAAAAwAAAAAAAAAAAAAAD0Jvb3RzdHJhcFN0YXR1cwAAAAAEAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAAB0Nsb3NpbmcAAAAAAQAAAAAAAAAJQ29tcGxldGVkAAAAAAAAAgAAAAAAAAAJQ2FuY2VsbGVkAAAAAAAAAw==',
  'AAAAAQAAAAAAAAAAAAAACVRva2VuSW5mbwAAAAAAAAIAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAGd2VpZ2h0AAAAAAAL',
  'AAAAAQAAAAAAAAAAAAAAD0Jvb3RzdHJhcENvbmZpZwAAAAAGAAAALlRoZSBhbW91bnQgb2YgdGhlIGJvb3RzdHJhcCB0b2tlbiB0byBib290c3RyYXAAAAAAAAZhbW91bnQAAAAAAAsAAAAiVGhlIGFkZHJlc3MgY3JlYXRpbmcgdGhlIGJvb3RzdHJhcAAAAAAADGJvb3RzdHJhcHBlcgAAABMAAAAzVGhlIGxlZGdlciBudW1iZXIgYXQgd2hpY2ggdGhlIGJvb3RzdHJhcCB3aWxsIGNsb3NlAAAAAAxjbG9zZV9sZWRnZXIAAAAEAAAAMVRoZSBtaW5pbXVtIGFtb3VudCBvZiB0aGUgcGFpciB0b2tlbiB0byBib290c3RyYXAAAAAAAAAIcGFpcl9taW4AAAALAAAAJFRoZSBhZGRyZXNzIG9mIHRoZSBwb29sIHRvIGJvb3RzdHJhcAAAAARwb29sAAAAEwAAADpUaGUgaW5kZXggb2YgdGhlIGNvbWV0IHVuZGVybHlpbmcgdG9rZW4gYmVpbmcgYm9vdHN0cmFwcGVkAAAAAAALdG9rZW5faW5kZXgAAAAABA==',
  'AAAAAQAAAAAAAAAAAAAADUJvb3RzdHJhcERhdGEAAAAAAAAEAAAASlRoZSBhbW91bnQgb2YgdGhlIGJvb3N0cmFwcGVkIHRva2VuIGhlbGQgYnkgdGhlIGNvbnRyYWN0IGZvciB0aGlzIGJvb3N0cmFwAAAAAAAQYm9vdHN0cmFwX2Ftb3VudAAAAAsAAABBVGhlIGFtb3VudCBvZiBwYWlyIHRva2VucyBoZWxkIGJ5IHRoZSBjb250cmFjdCBmb3IgdGhpcyBib290c3RyYXAAAAAAAAALcGFpcl9hbW91bnQAAAAACwAAAAAAAAAVdG90YWxfYmFja3N0b3BfdG9rZW5zAAAAAAAACwAAADxUaGUgdG90YWwgbnVtYmVyIG9mIHBhaXIgdG9rZW5zIGRlcG9zaXRlZCBmb3IgdGhpcyBib290c3RyYXAAAAAKdG90YWxfcGFpcgAAAAAACw==',
  'AAAAAQAAAAAAAAAAAAAAC0RlcG9zaXREYXRhAAAAAAMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAHY2xhaW1lZAAAAAABAAAAAAAAAAhyZWZ1bmRlZAAAAAE=',
]);

export const parsers = {
  initialize: () => {},
  get_bootstrap: (result: string | xdr.ScVal): Bootstrap => {
    return BootstrapSpec.funcResToNative('get_bootstrap', result);
  },
  get_next_id: (result: string | xdr.ScVal): number => {
    return BootstrapSpec.funcResToNative('get_next_id', result);
  },
  get_deposit: (result: string | xdr.ScVal): DepositData => {
    return BootstrapSpec.funcResToNative('get_deposit', result);
  },
  bootstrap: (result: string | xdr.ScVal): number => {
    return BootstrapSpec.funcResToNative('bootstrap', result);
  },
  join: (result: string | xdr.ScVal): bigint => {
    return BootstrapSpec.funcResToNative('join', result);
  },
  exit: (result: string | xdr.ScVal): bigint => {
    return BootstrapSpec.funcResToNative('exit', result);
  },
  close: (result: string | xdr.ScVal): bigint => {
    return BootstrapSpec.funcResToNative('close', result);
  },
  claim: (result: string | xdr.ScVal): bigint => {
    return BootstrapSpec.funcResToNative('claim', result);
  },
  refund: (result: string | xdr.ScVal): bigint => {
    return BootstrapSpec.funcResToNative('refund', result);
  },
};

export class BootstrapClient extends Contract {
  constructor(contractId: string) {
    super(contractId);
  }

  get_bootstrap(args: { id: number }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('get_bootstrap', ...BootstrapSpec.funcArgsToScVals('get_bootstrap', args));
  }

  get_next_id(): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('get_next_id', ...BootstrapSpec.funcArgsToScVals('get_next_id', {}));
  }

  get_deposit(args: { id: number; user: string }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('get_deposit', ...BootstrapSpec.funcArgsToScVals('get_deposit', args));
  }

  bootstrap(args: { config: BootstrapConfig }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('bootstrap', ...BootstrapSpec.funcArgsToScVals('bootstrap', args));
  }

  join(args: {
    from: string;
    id: number;
    amount: bigint;
  }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('join', ...BootstrapSpec.funcArgsToScVals('join', args));
  }

  exit(args: {
    from: string;
    id: number;
    amount: bigint;
  }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('exit', ...BootstrapSpec.funcArgsToScVals('exit', args));
  }

  close(args: { id: number }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('close', ...BootstrapSpec.funcArgsToScVals('close', args));
  }

  claim(args: { from: string; id: number }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('claim', ...BootstrapSpec.funcArgsToScVals('claim', args));
  }

  refund(args: { from: string; id: number }): xdr.Operation<Operation.InvokeHostFunction> {
    return this.call('refund', ...BootstrapSpec.funcArgsToScVals('refund', args));
  }
}

/***** Math ******/

export interface BootstrapOutput {
  claimAmount: number;
  refundAmount: number;
  claimInUSDC: number;
}

/**
 *
 * @param bootstrap The bootstrap to calculate the output for
 * @param backstopToken The backstop token to use
 * @param depositDelta Any change in the user's deposit amount (as a number in decimal form)
 * @param bootstrapper If the user is the bootstrapper
 * @returns BootstrapOutput
 */
export const calculateOutput = (
  bootstrap: BootstrapState | undefined,
  backstopToken: BackstopToken | undefined,
  depositDelta: number,
  bootstrapper: boolean
): BootstrapOutput => {
  if (bootstrap == undefined || backstopToken == undefined) {
    return {
      claimAmount: 0,
      refundAmount: 0,
      claimInUSDC: 0,
    };
  }
  const userDeposit = Number(bootstrap.userDeposit.amount) / 1e7 + depositDelta;
  const totalPair = Number(bootstrap.data.total_pair) / 1e7 + depositDelta;
  if (userDeposit <= 0) {
    return {
      claimAmount: 0,
      refundAmount: 0,
      claimInUSDC: 0,
    };
  }

  const { backstop_tokens, backstop_token_to_usdc } = calcBackstopTokens(
    bootstrap,
    backstopToken,
    depositDelta
  );

  const bootstrapIndex = bootstrap.config.token_index;
  const pairIndex = 1 ^ bootstrapIndex;
  const cometWeights = [0.8, 0.2];

  const userShare = bootstrapper
    ? cometWeights[bootstrapIndex]
    : (cometWeights[pairIndex] * userDeposit) / totalPair;
  const claimAmount = backstop_tokens * userShare;
  const claimInUSDC = claimAmount * backstop_token_to_usdc;

  let refundAmount = 0;
  if (bootstrap.status === BootstrapStatus.Cancelled) {
    if (bootstrapper) {
      refundAmount = Number(bootstrap.data.bootstrap_amount) / 1e7;
    } else {
      refundAmount = (Number(bootstrap.data.pair_amount) / 1e7) * userShare;
    }
  }

  return {
    claimAmount,
    refundAmount,
    claimInUSDC,
  };
};

const calcBackstopTokens = (
  bootstrap: BootstrapState,
  backstopToken: BackstopToken,
  depositDelta: number
): { backstop_tokens: number; backstop_token_to_usdc: number } => {
  const cur_backstop_tokens = Number(bootstrap.data.total_backstop_tokens) / 1e7;
  if (
    bootstrap.status === BootstrapStatus.Completed ||
    bootstrap.status === BootstrapStatus.Cancelled
  ) {
    return {
      backstop_tokens: cur_backstop_tokens,
      backstop_token_to_usdc: backstopToken.lpTokenPrice,
    };
  }

  // estimate LP tokens minted during close
  const bootstrapIndex = bootstrap.config.token_index;
  const pairIndex = 1 ^ bootstrapIndex;

  const cometBalances = [Number(backstopToken.blnd) / 1e7, Number(backstopToken.usdc) / 1e7];
  const cometWeights = [0.8, 0.2];
  const cometShares = Number(backstopToken.shares) / 1e7;

  const totalPairBalance = Number(bootstrap.data.pair_amount) / 1e7 + depositDelta;
  const totalBootstrapBalance = Number(bootstrap.data.bootstrap_amount) / 1e7;
  let pairBalance = totalPairBalance;
  let bootstrapBalance = totalBootstrapBalance;
  let mintedBackstopTokens = 0;

  // estimate join amount
  const pairJoinAmount = (pairBalance / cometBalances[pairIndex]) * cometShares;
  const bootstrapJoinAmount = (bootstrapBalance / cometBalances[bootstrapIndex]) * cometShares;

  if (pairJoinAmount > bootstrapJoinAmount) {
    // bootstrap side is the limiting factor
    mintedBackstopTokens += bootstrapJoinAmount;
    bootstrapBalance = 0;
    pairBalance = Math.max(
      pairBalance - (bootstrapJoinAmount / cometShares) * cometBalances[pairIndex],
      0
    );
    // single sided deposit the rest of the pair tokens
    mintedBackstopTokens += calcSingleSidedDeposit(
      pairIndex,
      pairBalance,
      cometBalances,
      cometWeights,
      cometShares
    );
    pairBalance = 0;
  } else {
    // pair side is the limiting factor
    mintedBackstopTokens += pairJoinAmount;
    pairBalance = 0;
    bootstrapBalance = Math.max(
      bootstrapBalance - (pairJoinAmount / cometShares) * cometBalances[bootstrapIndex],
      0
    );

    // single sided deposit the rest of the bootstrap tokens
    mintedBackstopTokens += calcSingleSidedDeposit(
      bootstrapIndex,
      bootstrapBalance,
      cometBalances,
      cometWeights,
      cometShares
    );
    bootstrapBalance = 0;
  }
  // index 1 is USDC
  const lpUSDCTotal =
    pairIndex === 1
      ? totalPairBalance + cometBalances[pairIndex]
      : totalBootstrapBalance + cometBalances[bootstrapIndex];
  const lpTokenToUSDC = (lpUSDCTotal * 5) / (cometShares + mintedBackstopTokens);
  return {
    backstop_tokens: cur_backstop_tokens + mintedBackstopTokens,
    backstop_token_to_usdc: lpTokenToUSDC,
  };
};

const calcSingleSidedDeposit = (
  tokenIndex: number,
  amount: number,
  cometBalances: number[],
  cometWeights: number[],
  cometShares: number
): number => {
  const weighted_fee = (1.0 - cometWeights[tokenIndex]) * 0.003;
  const amount_net_fees = amount * (1.0 - weighted_fee);

  const ratio = 1.0 + amount_net_fees / cometBalances[tokenIndex];
  const weighted_ratio = Math.pow(ratio, cometWeights[tokenIndex]) - 1.0;
  return cometShares * weighted_ratio;
};

/***** Display ******/

export const displayBootstrapStatus = (status: BootstrapStatus): string => {
  switch (status) {
    case BootstrapStatus.Active:
      return 'Active';
    case BootstrapStatus.Closing:
      return 'Closing';
    case BootstrapStatus.Completed:
      return 'Completed';
    case BootstrapStatus.Cancelled:
      return 'Cancelled';
  }
};

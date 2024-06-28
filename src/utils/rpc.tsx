import { Horizon, SorobanRpc } from '@stellar/stellar-sdk';

export interface Network {
  rpc: string;
  passphrase: string;
  maxConcurrentRequests?: number;
  opts?: Horizon.Server.Options;
}
const network: Network = {
  rpc: 'https://soroban-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015',
  opts: undefined,
};
const rpc = new SorobanRpc.Server(network.rpc, network.opts);

export function getRpc() {
  return rpc;
}

export function getNetwork() {
  return network;
}

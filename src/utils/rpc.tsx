import { Horizon, SorobanRpc } from '@stellar/stellar-sdk';

export interface Network {
  rpc: string;
  passphrase: string;
  maxConcurrentRequests?: number;
  opts?: Horizon.Server.Options;
}
const network: Network = {
  rpc: 'http://localhost:8000/soroban/rpc',
  passphrase: 'Standalone Network ; February 2017',
  opts: { allowHttp: true },
};
const rpc = new SorobanRpc.Server(network.rpc, network.opts);

export function getRpc() {
  return rpc;
}

export function getNetwork() {
  return network;
}

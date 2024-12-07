import { Horizon, rpc } from '@stellar/stellar-sdk';

export interface Network {
  rpc: string;
  passphrase: string;
  maxConcurrentRequests?: number;
  opts?: Horizon.Server.Options;
}
const network: Network = {
  rpc: import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org',
  passphrase: import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  opts: undefined,
};
const stellarRpc = new rpc.Server(network.rpc, network.opts);

export function getRpc() {
  return stellarRpc;
}

export function getNetwork() {
  return network;
}

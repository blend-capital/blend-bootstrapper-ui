import { Account, BASE_FEE, rpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { getNetwork, getRpc } from './rpc';

export async function simulateOperation(
  operation: xdr.Operation,
  account?: Account | undefined
): Promise<rpc.Api.SimulateTransactionResponse> {
  try {
    const stellarRpc = getRpc();
    const network = getNetwork();
    const sourceAccount =
      account ?? new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '1');
    const tx_builder = new TransactionBuilder(sourceAccount, {
      networkPassphrase: network.passphrase,
      fee: BASE_FEE,
      timebounds: {
        minTime: 0,
        maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
      },
    }).addOperation(operation);
    const transaction = tx_builder.build();
    const simulation = await stellarRpc.simulateTransaction(transaction);
    return simulation;
  } catch (e) {
    console.error('Unable to simulate operation: ', e);
    const temp_error: rpc.Api.SimulateTransactionErrorResponse = {
      error: 'Unkown',
      events: [],
      id: '0',
      latestLedger: 0,
      _parsed: false,
    };
    return temp_error;
  }
}

import {
  FreighterModule,
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
} from '@creit.tech/stellar-wallets-kit/build';
import { getNetworkDetails as getFreighterNetwork } from '@stellar/freighter-api';
import {
  BASE_FEE,
  Contract,
  Operation,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  scValToBigInt,
  xdr,
} from '@stellar/stellar-sdk';
import React, { useContext, useEffect, useState } from 'react';
import { useLocalStorageState } from './index';
import { ContractErrorType, parseError } from '../utils/responseParser';
import { BootstrapParams } from '../types';
import { Network, getNetwork, getRpc } from '../utils/rpc';

export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  txStatus: TxStatus;
  lastTxHash: string | undefined;
  lastTxFailure: string | undefined;
  txType: TxType;
  walletId: string | undefined;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearLastTx: () => void;
  restore: (sim: SorobanRpc.Api.SimulateTransactionRestoreResponse) => Promise<void>;
  simulateOperation: (
    operation: xdr.Operation
  ) => Promise<SorobanRpc.Api.SimulateTransactionResponse>;
  createBootstrap: (bootstrapperId: string, params: BootstrapParams) => void;
  joinBootstrap: (bootstrapperId: string, id: number, amount: bigint) => void;
  exitBootstrap: (bootstrapperId: string, id: number, amount: bigint) => void;
  closeBootstrap: (bootstrapperId: string, id: number) => void;
  claimBootstrap: (bootstrapperId: string, id: number) => void;
  refundBootstrap: (bootstrapperId: string, id: number) => void;
  fetchBalance: (tokenId: string, userId: string) => Promise<BigInt | undefined>;
  getNetworkDetails(): Promise<Network>;
}

export enum TxStatus {
  NONE,
  BUILDING,
  SIGNING,
  SUBMITTING,
  SUCCESS,
  FAIL,
}

export enum TxType {
  // Submit a contract invocation
  CONTRACT,
  // A transaction that is a pre-requisite for another transaction
  PREREQ,
}

export const WalletContext = React.createContext<IWalletContext | undefined>(undefined);

export const WalletProvider = ({ children = null as any }): JSX.Element => {
  const [connected, setConnected] = useState<boolean>(false);
  const [autoConnect, setAutoConnect] = useLocalStorageState('autoConnectWallet', 'false');
  const [loadingSim, setLoadingSim] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txFailure, setTxFailure] = useState<string | undefined>(undefined);
  const [txType, setTxType] = useState<TxType>(TxType.CONTRACT);
  // wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');

  const rpc = getRpc();
  const network = getNetwork();
  const walletKit: StellarWalletsKit = new StellarWalletsKit({
    network: network.passphrase as WalletNetwork,
    selectedWalletId: autoConnect !== undefined && autoConnect !== 'false' ? autoConnect : XBULL_ID,
    modules: [new xBullModule(), new FreighterModule()],
  });

  useEffect(() => {
    if (!connected && autoConnect !== 'false') {
      // @dev: timeout ensures chrome has the ability to load extensions
      setTimeout(() => {
        handleSetWalletAddress();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  function setFailureMessage(message: string | undefined) {
    console.log('Setting failure message: ', message);
    if (message) {
      // some contract failures include diagnostic information. If so, try and remove it.
      let substrings = message.split('Event log (newest first):');
      setTxFailure(substrings[0].trimEnd());
    }
  }

  /**
   * Connect a wallet to the application via the walletKit
   */
  async function handleSetWalletAddress() {
    try {
      const publicKey = await walletKit.getPublicKey();
      setWalletAddress(publicKey);
      setConnected(true);
    } catch (e: any) {
      console.error('Unable to load wallet information: ', e);
    }
  }

  /**
   * Open up a modal to connect the user's browser wallet
   */
  async function connect() {
    try {
      await walletKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          walletKit.setWallet(option.id);
          setAutoConnect(option.id);
          await handleSetWalletAddress();
        },
      });
    } catch (e: any) {
      console.error('Unable to connect wallet: ', e);
    }
  }

  function disconnect() {
    setWalletAddress('');
    setConnected(false);
    setAutoConnect('false');
  }

  /**
   * Sign an XDR string with the connected user's wallet
   * @param xdr - The XDR to sign
   * @param networkPassphrase - The network passphrase
   * @returns - The signed XDR as a base64 string
   */
  async function sign(xdr: string): Promise<string> {
    if (connected) {
      setTxStatus(TxStatus.SIGNING);
      try {
        let { result } = await walletKit.signTx({
          xdr: xdr,
          publicKeys: [walletAddress],
          network: network.passphrase as WalletNetwork,
        });
        setTxStatus(TxStatus.SUBMITTING);
        return result;
      } catch (e: any) {
        if (e === 'User declined access') {
          setTxFailure('Transaction rejected by wallet.');
        } else if (typeof e === 'string') {
          setTxFailure(e);
        }

        setTxStatus(TxStatus.FAIL);
        throw e;
      }
    } else {
      throw new Error('Not connected to a wallet');
    }
  }

  async function restore(sim: SorobanRpc.Api.SimulateTransactionRestoreResponse): Promise<void> {
    let account = await rpc.getAccount(walletAddress);
    setTxStatus(TxStatus.BUILDING);
    let fee = parseInt(sim.restorePreamble.minResourceFee) + parseInt(BASE_FEE);
    let restore_tx = new TransactionBuilder(account, { fee: fee.toString() })
      .setNetworkPassphrase(network.passphrase)
      .setTimeout(0)
      .setSorobanData(sim.restorePreamble.transactionData.build())
      .addOperation(Operation.restoreFootprint({}))
      .build();
    let signed_restore_tx = new Transaction(await sign(restore_tx.toXDR()), network.passphrase);
    setTxType(TxType.PREREQ);
    await sendTransaction(signed_restore_tx);
  }

  async function sendTransaction(transaction: Transaction): Promise<boolean> {
    let send_tx_response = await rpc.sendTransaction(transaction);
    let curr_time = Date.now();

    // Attempt to send the transaction and poll for the result
    while (send_tx_response.status !== 'PENDING' && Date.now() - curr_time < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      send_tx_response = await rpc.sendTransaction(transaction);
    }
    if (send_tx_response.status !== 'PENDING') {
      let error = parseError(send_tx_response);
      setFailureMessage(ContractErrorType[error.type]);
      setTxStatus(TxStatus.FAIL);
    }

    let get_tx_response = await rpc.getTransaction(send_tx_response.hash);
    while (get_tx_response.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get_tx_response = await rpc.getTransaction(send_tx_response.hash);
    }

    let hash = transaction.hash().toString('hex');
    setTxHash(hash);
    if (get_tx_response.status === 'SUCCESS') {
      console.log('Successfully submitted transaction: ', hash);
      setTxStatus(TxStatus.SUCCESS);
      return true;
    } else {
      console.log('Failed Transaction Hash: ', hash);
      let error = parseError(get_tx_response);
      setFailureMessage(ContractErrorType[error.type]);
      setTxStatus(TxStatus.FAIL);
      return false;
    }
  }

  async function simulateOperation(
    operation: xdr.Operation
  ): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
    try {
      setLoadingSim(true);
      const account = await rpc.getAccount(walletAddress);
      const tx_builder = new TransactionBuilder(account, {
        networkPassphrase: network.passphrase,
        fee: BASE_FEE,
        timebounds: {
          minTime: 0,
          maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
        },
      }).addOperation(operation);
      const transaction = tx_builder.build();
      const simulation = await rpc.simulateTransaction(transaction);
      setLoadingSim(false);
      return simulation;
    } catch (e) {
      setLoadingSim(false);
      throw e;
    }
  }

  async function invokeSorobanOperation(operation: xdr.Operation) {
    try {
      const account = await rpc.getAccount(walletAddress);
      const tx_builder = new TransactionBuilder(account, {
        networkPassphrase: network.passphrase,
        fee: BASE_FEE,
        timebounds: {
          minTime: 0,
          maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000,
        },
      }).addOperation(operation);
      const transaction = tx_builder.build();
      const simResponse = await simulateOperation(operation);
      if (SorobanRpc.Api.isSimulationError(simResponse)) {
        console.error('Failed simulating transaction: ', simResponse);
        let error = parseError(simResponse);
        setFailureMessage(ContractErrorType[error.type]);
        setTxStatus(TxStatus.FAIL);
        return;
      }
      const assembled_tx = SorobanRpc.assembleTransaction(transaction, simResponse).build();

      const signedTx = await sign(assembled_tx.toXDR());
      const tx = new Transaction(signedTx, network.passphrase);
      await sendTransaction(tx);
    } catch (e: any) {
      console.error('Failed submitting transaction: ', e);
      setFailureMessage(e?.message);
      setTxStatus(TxStatus.FAIL);
    }
  }

  function clearLastTx() {
    setTxStatus(TxStatus.NONE);
    setTxHash(undefined);
    setTxFailure(undefined);
  }

  async function getNetworkDetails() {
    try {
      const freighterDetails: any = await getFreighterNetwork();
      return {
        rpc: freighterDetails.sorobanRpcUrl,
        passphrase: freighterDetails.networkPassphrase,
        maxConcurrentRequests: network.maxConcurrentRequests,
        horizonUrl: freighterDetails.networkUrl,
      };
    } catch (e) {
      console.error('Failed to get network details from freighter', e);
      return network;
    }
  }

  async function createBootstrap(bootstrapId: string, params: BootstrapParams) {
    let bootstrapper = new Contract(bootstrapId);
    let op = bootstrapper.call(
      'bootstrap',
      ...[
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: nativeToScVal('amount', { type: 'symbol' }),
            val: nativeToScVal(params.amount, { type: 'i128' }),
          }),
          new xdr.ScMapEntry({
            key: nativeToScVal('bootstrapper', { type: 'symbol' }),
            val: nativeToScVal(params.bootstrapper, { type: 'address' }),
          }),
          new xdr.ScMapEntry({
            key: nativeToScVal('close_ledger', { type: 'symbol' }),
            val: nativeToScVal(params.close_ledger, { type: 'u32' }),
          }),
          new xdr.ScMapEntry({
            key: nativeToScVal('pair_min', { type: 'symbol' }),
            val: nativeToScVal(params.pair_min, { type: 'i128' }),
          }),
          new xdr.ScMapEntry({
            key: nativeToScVal('pool', { type: 'symbol' }),
            val: nativeToScVal(params.pool, { type: 'address' }),
          }),
          new xdr.ScMapEntry({
            key: nativeToScVal('token_index', { type: 'symbol' }),
            val: nativeToScVal(params.token_index, { type: 'u32' }),
          }),
        ]),
      ]
    );
    await invokeSorobanOperation(op);
  }

  async function joinBootstrap(bootstrapId: string, id: number, amount: bigint) {
    let bootstrapper = new Contract(bootstrapId);
    let op = bootstrapper.call(
      'join',
      ...[
        nativeToScVal(walletAddress, {
          type: 'address',
        }),
        nativeToScVal(id, { type: 'u32' }),
        nativeToScVal(amount, { type: 'i128' }),
      ]
    );
    await invokeSorobanOperation(op);
  }

  async function exitBootstrap(bootstrapId: string, id: number, amount: bigint) {
    let bootstrapper = new Contract(bootstrapId);
    let op = bootstrapper.call(
      'exit',
      ...[
        nativeToScVal(walletAddress, {
          type: 'address',
        }),
        nativeToScVal(id, { type: 'u32' }),
        nativeToScVal(amount, { type: 'i128' }),
      ]
    );
    await invokeSorobanOperation(op);
  }

  async function closeBootstrap(bootstrapId: string, id: number) {
    let bootstrapper = new Contract(bootstrapId);
    let op = bootstrapper.call('close', ...[nativeToScVal(id, { type: 'u32' })]);
    await invokeSorobanOperation(op);
  }

  async function claimBootstrap(bootstrapId: string, id: number) {
    let bootstrapper = new Contract(bootstrapId);
    let op = bootstrapper.call(
      'claim',
      ...[
        nativeToScVal(walletAddress, {
          type: 'address',
        }),
        nativeToScVal(id, { type: 'u32' }),
      ]
    );
    await invokeSorobanOperation(op);
  }

  async function refundBootstrap(bootstrapId: string, id: number) {
    let bootstrapper = new Contract(bootstrapId);
    let op = bootstrapper.call(
      'refund',
      ...[
        nativeToScVal(walletAddress, {
          type: 'address',
        }),
        nativeToScVal(id, { type: 'u32' }),
      ]
    );
    await invokeSorobanOperation(op);
  }

  async function fetchBalance(tokenId: string, userId: string): Promise<BigInt | undefined> {
    let contract = new Contract(tokenId);
    let op = contract.call('balance', ...[nativeToScVal(userId, { type: 'address' })]);
    let sim = await simulateOperation(op);
    if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
      let balance = scValToBigInt(sim.result.retval);
      return balance;
    } else {
      console.error('Failed to load balance: ', sim);
      return undefined;
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        txStatus,
        lastTxHash: txHash,
        lastTxFailure: txFailure,
        txType,
        walletId: autoConnect,
        isLoading: loadingSim,
        connect,
        disconnect,
        clearLastTx,
        restore,
        simulateOperation,
        createBootstrap,
        joinBootstrap,
        exitBootstrap,
        closeBootstrap,
        claimBootstrap,
        refundBootstrap,
        getNetworkDetails,
        fetchBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};

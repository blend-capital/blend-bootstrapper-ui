import {
  AlbedoModule,
  FreighterModule,
  ISupportedWallet,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
} from '@creit.tech/stellar-wallets-kit';
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
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { BootstrapClient, BootstrapConfig } from '../utils/bootstrapper';
import { ContractErrorType, parseError } from '../utils/responseParser';
import { Network, getNetwork, getRpc } from '../utils/rpc';
import { simulateOperation } from '../utils/stellar';
import { useLocalStorageState } from './index';

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
  submitCreateBootstrap: (config: BootstrapConfig) => Promise<boolean>;
  submitJoinBootstrap: (id: number, amount: bigint) => Promise<boolean>;
  submitExitBootstrap: (id: number, amount: bigint) => Promise<boolean>;
  submitCloseBootstrap: (id: number) => Promise<boolean>;
  submitClaimBootstrap: (id: number) => Promise<boolean>;
  submitRefundBootstrap: (id: number) => Promise<boolean>;
  fetchBalance: (tokenId: string, userId: string) => Promise<bigint | undefined>;
  getNetworkDetails(): Promise<Network>;
  getLatestLedger(): Promise<number>;
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

export interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps): JSX.Element => {
  const bootstrapId = import.meta.env.VITE_BOOTSTRAPPER_ADDRESS;

  const [connected, setConnected] = useState<boolean>(false);
  const [autoConnect, setAutoConnect] = useLocalStorageState('autoConnectWallet', 'false');
  // const [isLoading, setIsLoading] = useState<boolean>(false);
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
    modules: [new xBullModule(), new FreighterModule(), new LobstrModule(), new AlbedoModule()],
  });

  useEffect(() => {
    if (!connected && autoConnect !== 'false') {
      // @dev: timeout ensures chrome has the ability to load extensions
      setTimeout(() => {
        handleSetWalletAddress();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  function setFailureMessage(message: string | undefined) {
    console.log('Setting failure message: ', message);
    if (message) {
      // some contract failures include diagnostic information. If so, try and remove it.
      const substrings = message.split('Event log (newest first):');
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
        const { result } = await walletKit.signTx({
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
    const account = await rpc.getAccount(walletAddress);
    setTxStatus(TxStatus.BUILDING);
    const fee = parseInt(sim.restorePreamble.minResourceFee) + parseInt(BASE_FEE);
    const restore_tx = new TransactionBuilder(account, { fee: fee.toString() })
      .setNetworkPassphrase(network.passphrase)
      .setTimeout(0)
      .setSorobanData(sim.restorePreamble.transactionData.build())
      .addOperation(Operation.restoreFootprint({}))
      .build();
    const signed_restore_tx = new Transaction(await sign(restore_tx.toXDR()), network.passphrase);
    setTxType(TxType.PREREQ);
    await sendTransaction(signed_restore_tx);
  }

  async function sendTransaction(transaction: Transaction): Promise<boolean> {
    let send_tx_response = await rpc.sendTransaction(transaction);
    const curr_time = Date.now();

    // Attempt to send the transaction and poll for the result
    while (send_tx_response.status !== 'PENDING' && Date.now() - curr_time < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      send_tx_response = await rpc.sendTransaction(transaction);
    }
    if (send_tx_response.status !== 'PENDING') {
      const error = parseError(send_tx_response);
      setFailureMessage(ContractErrorType[error.type]);
      setTxStatus(TxStatus.FAIL);
    }

    let get_tx_response = await rpc.getTransaction(send_tx_response.hash);
    while (get_tx_response.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get_tx_response = await rpc.getTransaction(send_tx_response.hash);
    }

    const hash = transaction.hash().toString('hex');
    setTxHash(hash);
    if (get_tx_response.status === 'SUCCESS') {
      console.log('Successfully submitted transaction: ', hash);
      setTxStatus(TxStatus.SUCCESS);
      return true;
    } else {
      console.log('Failed Transaction Hash: ', hash);
      const error = parseError(get_tx_response);
      setFailureMessage(ContractErrorType[error.type]);
      setTxStatus(TxStatus.FAIL);
      return false;
    }
  }

  async function invokeSorobanOperation(operation: xdr.Operation): Promise<boolean> {
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
      const simResponse = await simulateOperation(operation, account);
      if (SorobanRpc.Api.isSimulationError(simResponse)) {
        console.error('Failed simulating transaction: ', simResponse);
        const error = parseError(simResponse);
        setFailureMessage(ContractErrorType[error.type]);
        setTxStatus(TxStatus.FAIL);
        return false;
      }
      const assembled_tx = SorobanRpc.assembleTransaction(transaction, simResponse).build();

      const signedTx = await sign(assembled_tx.toXDR());
      const tx = new Transaction(signedTx, network.passphrase);
      return await sendTransaction(tx);
    } catch (e: any) {
      console.error('Failed submitting transaction: ', e);
      setFailureMessage(e?.message);
      setTxStatus(TxStatus.FAIL);
      return false;
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

  async function getLatestLedger(): Promise<number> {
    return (await rpc.getLatestLedger()).sequence;
  }

  async function submitCreateBootstrap(config: BootstrapConfig): Promise<boolean> {
    if (connected && walletAddress !== '') {
      const bootstrapper = new BootstrapClient(bootstrapId);
      const op = bootstrapper.bootstrap({ config });
      return await invokeSorobanOperation(op);
    } else {
      return false;
    }
  }

  async function submitJoinBootstrap(id: number, amount: bigint): Promise<boolean> {
    if (connected && walletAddress !== '') {
      const bootstrapper = new BootstrapClient(bootstrapId);
      const op = bootstrapper.join({ from: walletAddress, id, amount });
      return await invokeSorobanOperation(op);
    } else {
      return false;
    }
  }

  async function submitExitBootstrap(id: number, amount: bigint): Promise<boolean> {
    if (connected && walletAddress !== '') {
      const bootstrapper = new BootstrapClient(bootstrapId);
      const op = bootstrapper.exit({ from: walletAddress, id, amount });
      return await invokeSorobanOperation(op);
    } else {
      return false;
    }
  }

  async function submitCloseBootstrap(id: number): Promise<boolean> {
    if (connected && walletAddress !== '') {
      const bootstrapper = new BootstrapClient(bootstrapId);
      const op = bootstrapper.close({ id });
      return await invokeSorobanOperation(op);
    } else {
      return false;
    }
  }

  async function submitClaimBootstrap(id: number): Promise<boolean> {
    if (connected && walletAddress !== '') {
      const bootstrapper = new BootstrapClient(bootstrapId);
      const op = bootstrapper.claim({ from: walletAddress, id });
      return await invokeSorobanOperation(op);
    } else {
      return false;
    }
  }

  async function submitRefundBootstrap(id: number): Promise<boolean> {
    if (connected && walletAddress !== '') {
      const bootstrapper = new BootstrapClient(bootstrapId);
      const op = bootstrapper.refund({ from: walletAddress, id });
      return await invokeSorobanOperation(op);
    } else {
      return false;
    }
  }

  async function fetchBalance(
    tokenId: string,
    userId: string | undefined
  ): Promise<bigint | undefined> {
    if (userId === undefined || userId === '') {
      return undefined;
    }
    const contract = new Contract(tokenId);
    const op = contract.call('balance', ...[nativeToScVal(userId, { type: 'address' })]);
    const sim = await simulateOperation(op);
    if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
      const balance = scValToBigInt(sim.result.retval);
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
        isLoading: false,
        connect,
        disconnect,
        clearLastTx,
        restore,
        submitCreateBootstrap,
        submitJoinBootstrap,
        submitExitBootstrap,
        submitCloseBootstrap,
        submitClaimBootstrap,
        submitRefundBootstrap,
        getNetworkDetails,
        getLatestLedger,
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

import {
  Address,
  Contract,
  SorobanRpc,
  nativeToScVal,
  scValToBigInt,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import React, { useContext, useEffect, useState } from 'react';

import { Bootstrap, BootstrapperConfig, CometTokenData, UserDeposit } from '../types';
import { useWallet } from './wallet';
import { getRpc } from '../utils/rpc';

export interface IBootstrapContext {
  bootstrapperId: string;
  selectedOption: string | undefined;
  bootstrapperConfig: BootstrapperConfig | undefined;
  bootstrap: Bootstrap | undefined;
  id: number | undefined;
  userDeposit: UserDeposit | undefined;
  cometBalances: bigint[] | undefined;
  cometTotalSupply: bigint | undefined;
  pairWalletBalance: number | undefined;
  setSelectedOption: (option: string) => void;
  setId: (id: number | undefined) => void;
  fetchBootstrapperConfig: () => Promise<BootstrapperConfig | undefined>;
  fetchBootstrap: (id: number) => Promise<Bootstrap | undefined>;
  fetchUserDeposit: (id: number, userId: string) => Promise<UserDeposit | undefined>;
  fetchCometBalances: (
    bootstrapperConfig: BootstrapperConfig,
    bootstrap: Bootstrap
  ) => Promise<bigint[] | undefined>;
  fetchCometTotalSupply: (cometId: string) => Promise<bigint | undefined>;
  calculateClaimAmount: (amount: number) => number | undefined;
}

const BootstrapContext = React.createContext<IBootstrapContext | undefined>(undefined);

export const BootstrapProvider = ({ children = null as any }): JSX.Element => {
  const { simulateOperation, fetchBalance, connected, walletAddress } = useWallet();
  const bootstrapperId = import.meta.env.VITE_BOOTSTRAPPER_ADDRESS;
  const [id, setId] = useState<number | undefined>(undefined);
  const [bootstrap, setBootstrap] = useState<Bootstrap | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [bootstrapperConfig, setBootstrapperConfig] = useState<BootstrapperConfig | undefined>(
    undefined
  );
  const [cometBalances, setCometBalances] = useState<bigint[] | undefined>(undefined);
  const [pairWalletBalance, setPairWalletBalance] = useState<number | undefined>(undefined);
  const [userDeposit, setUserDeposit] = useState<UserDeposit | undefined>(undefined);
  const [cometTotalSupply, setCometTotalSupply] = useState<bigint | undefined>(undefined);
  const rpc = getRpc();
  // wallet state

  useEffect(() => {
    if (id != undefined) {
      loadBootstrapData(id);
    }
  }, [id, connected]);

  const fetchBootstrapperConfig = async (): Promise<BootstrapperConfig | undefined> => {
    const configLedgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(bootstrapperId).toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
    const responseEntries = await rpc.getLedgerEntries(...[configLedgerKey]);

    let backstopId: string | undefined;
    let backstopTokenId: string | undefined;
    let cometTokenData: CometTokenData[] = [];
    for (const entry of responseEntries.entries) {
      const ledgerData = entry.val.contractData();
      if (ledgerData.key().switch() == xdr.ScValType.scvLedgerKeyContractInstance()) {
        ledgerData
          .val()
          .instance()
          .storage()
          ?.map((entry) => {
            const key = scValToNative(entry.key());
            const value = scValToNative(entry.val());
            if (key == 'Bstop') backstopId = value;
            else if (key == 'BstopTkn') backstopTokenId = value;
            else if (key == 'Comet') {
              value.map((tokenData: { address: string; weight: bigint }) => {
                cometTokenData.push({
                  address: tokenData.address,
                  weight: Number(tokenData.weight) / 100000,
                });
              });
            }
          });
        if (backstopId == undefined || backstopTokenId == undefined || cometTokenData.length == 0) {
          console.error('Unable to load bootstrapper config');
        } else {
          setBootstrapperConfig({ backstopId, backstopTokenId, cometTokenData });
          return { backstopId, backstopTokenId, cometTokenData } as BootstrapperConfig;
        }
      }
    }

    return undefined;
  };
  const fetchBootstrap = async (id: number): Promise<Bootstrap | undefined> => {
    let bootstrapper = new Contract(bootstrapperId);
    let bootstrapOp = bootstrapper.call('get_bootstrap', ...[nativeToScVal(id, { type: 'u32' })]);
    let sim = await simulateOperation(bootstrapOp);
    if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
      let bootstrap = scValToNative(sim.result.retval);
      setBootstrap(bootstrap as Bootstrap);
      return bootstrap as Bootstrap;
    } else {
      console.error('Failed to load bootstrap: ', sim);
      setBootstrap(undefined);
      return undefined;
    }
  };

  const fetchUserDeposit = async (id: number, userId: string): Promise<UserDeposit | undefined> => {
    if (bootstrapperId == undefined) {
      return undefined;
    }
    const configLedgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(bootstrapperId).toScAddress(),
        key: xdr.ScVal.scvVec([
          xdr.ScVal.scvSymbol('Deposit'),
          xdr.ScVal.scvMap([
            new xdr.ScMapEntry({
              key: nativeToScVal('id', { type: 'symbol' }),
              val: nativeToScVal(id, { type: 'u32' }),
            }),
            new xdr.ScMapEntry({
              key: nativeToScVal('user', { type: 'symbol' }),
              val: nativeToScVal(userId, { type: 'address' }),
            }),
          ]),
        ]),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
    const responseEntries = await rpc.getLedgerEntries(...[configLedgerKey]);
    let entry = responseEntries.entries[0];
    if (entry == undefined) {
      return undefined;
    }

    setUserDeposit(scValToNative(entry.val.contractData().val()) as UserDeposit);
    return scValToNative(entry.val.contractData().val());
  };

  const fetchCometBalances = async (
    bootstrapperConfig: BootstrapperConfig,
    bootstrap: Bootstrap
  ): Promise<[bigint, bigint] | undefined> => {
    let cometBootstrapBalance = await fetchBalance(
      bootstrapperConfig.cometTokenData[bootstrap.config.token_index].address,
      bootstrapperConfig.backstopTokenId
    );
    let cometPairBalance = await fetchBalance(
      bootstrapperConfig.cometTokenData[1 ^ bootstrap.config.token_index].address,
      bootstrapperConfig.backstopTokenId
    );
    if (cometBootstrapBalance == undefined || cometPairBalance == undefined) {
      return undefined;
    }
    setCometBalances([cometBootstrapBalance, cometPairBalance]);
    return [cometBootstrapBalance, cometPairBalance];
  };

  const fetchCometTotalSupply = async (cometId: string): Promise<bigint | undefined> => {
    let contract = new Contract(cometId);
    let op = contract.call('get_total_supply', ...[]);
    let sim = await simulateOperation(op);
    if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
      console.log();
      let balance = scValToBigInt(sim.result.retval);
      setCometTotalSupply(balance);
      return balance;
    } else {
      console.error('Failed to load balance: ', sim);
      return undefined;
    }
  };

  const calculateClaimAmount = (amount: number): number | undefined => {
    if (
      bootstrap == undefined ||
      bootstrapperConfig == undefined ||
      cometBalances == undefined ||
      cometTotalSupply == undefined
    ) {
      return undefined;
    }
    const bootstrapIndex = bootstrap.config.token_index;
    const pairTokenIndex = 1 ^ bootstrapIndex;
    const bootstrapTokenData = bootstrapperConfig.cometTokenData[bootstrapIndex];
    const pairTokenData = bootstrapperConfig.cometTokenData[pairTokenIndex];
    const newPairAmount = Number(bootstrap.data.total_pair) + amount;

    const bootstrapClaimAmount =
      (Number(bootstrap.data.bootstrap_amount) / Number(cometBalances[0])) *
      Number(cometTotalSupply);
    const pairClaimAmount = (newPairAmount / Number(cometBalances[1])) * Number(cometTotalSupply);

    let claimAmount =
      bootstrapClaimAmount < pairClaimAmount ? bootstrapClaimAmount : pairClaimAmount;
    const pairJoinAmount = (Number(cometBalances[1]) / Number(cometTotalSupply)) * claimAmount;
    const pairAmountLeft = Number(bootstrap.data.pair_amount) + amount - pairJoinAmount;
    const newCometPairBalance = Number(cometBalances[1]) + pairJoinAmount;
    let pairSingleSide =
      ((pairAmountLeft + Number(newCometPairBalance)) / Number(newCometPairBalance)) **
        (pairTokenData.weight / 100) *
        Number(cometTotalSupply) -
      Number(cometTotalSupply);
    claimAmount += pairSingleSide;

    const bootstrapJoinAmount = (Number(cometBalances[0]) / Number(cometTotalSupply)) * claimAmount;
    const bootstrapAmountLeft = Number(bootstrap.data.bootstrap_amount) - bootstrapJoinAmount;
    const newCometBootstrapBalance = Number(cometBalances[0]) + bootstrapJoinAmount;
    let bootstrapSingleSide =
      ((bootstrapAmountLeft + Number(newCometBootstrapBalance)) /
        Number(newCometBootstrapBalance)) **
        (bootstrapTokenData.weight / 100) *
        Number(cometTotalSupply) -
      Number(cometTotalSupply);

    claimAmount += bootstrapSingleSide;
    claimAmount += Number(bootstrap.data.total_backstop_tokens);

    if (walletAddress == bootstrap.config.bootstrapper) {
      return Math.round((claimAmount * bootstrapTokenData.weight) / 100);
    } else {
      if (newPairAmount <= 0) return 0;
      return Math.round(
        (((claimAmount * (Number(userDeposit?.amount ?? 0n) + amount)) / newPairAmount) *
          pairTokenData.weight) /
          100
      );
    }
  };

  async function loadBootstrapData(id: number) {
    let bootstrapperConfig = await fetchBootstrapperConfig();
    if (bootstrapperConfig) {
      await fetchCometTotalSupply(bootstrapperConfig?.backstopTokenId);

      if (id !== undefined) {
        let bootstrap = await fetchBootstrap(id);
        if (bootstrap) {
          await fetchCometBalances(bootstrapperConfig, bootstrap);
          if (connected) {
            await fetchUserDeposit(id, walletAddress);

            let pairTokenId =
              bootstrapperConfig.cometTokenData[1 ^ bootstrap.config.token_index].address;
            let pairWalletBal = await fetchBalance(pairTokenId, walletAddress);
            setPairWalletBalance(Number(pairWalletBal));
          }
        }
      }
    }
  }

  return (
    <BootstrapContext.Provider
      value={{
        bootstrapperId,
        selectedOption,
        bootstrapperConfig,
        id,
        bootstrap,
        userDeposit,
        cometBalances,
        cometTotalSupply,
        pairWalletBalance,
        setId,
        setSelectedOption,
        fetchBootstrapperConfig,
        fetchBootstrap,
        fetchUserDeposit,
        fetchCometBalances,
        fetchCometTotalSupply,
        calculateClaimAmount,
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
};

export const useBootstrapper = () => {
  const context = useContext(BootstrapContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};

import { SorobanRpc } from '@stellar/stellar-sdk';
import React, { ReactNode, useContext, useState } from 'react';

import { BootstrapState } from '../types';
import { BackstopToken } from '../utils/backstopToken';
import { BootstrapClient, DepositData, parsers } from '../utils/bootstrapper';
import { getNetwork } from '../utils/rpc';
import { simulateOperation } from '../utils/stellar';
import { useWallet } from './wallet';

export interface IBootstrapContext {
  bootstrapperId: string;
  backstopTokenId: string;
  backstopToken: BackstopToken | undefined;
  lastId: number | undefined;
  bootstraps: Map<number, BootstrapState>;
  loadLastId: () => Promise<number>;
  loadBootstrap: (id: number, refreshToken?: boolean) => Promise<BootstrapState | undefined>;
  fetchBootstrap: (id: number) => Promise<BootstrapState | undefined>;
}

const BootstrapContext = React.createContext<IBootstrapContext | undefined>(undefined);

export interface BootstrapProviderProps {
  children: ReactNode;
}

export const BootstrapProvider = ({ children }: BootstrapProviderProps) => {
  const { fetchBalance, walletAddress } = useWallet();

  const bootstrapperId = import.meta.env.VITE_BOOTSTRAPPER_ADDRESS;
  const backstopTokenId = import.meta.env.VITE_BACKSTOP_TOKEN_ADDRESS;
  const blndId = import.meta.env.VITE_BLND_TOKEN_ADDRESS;
  const usdcId = import.meta.env.VITE_USDC_TOKEN_ADDRESS;

  const [lastId, setLastId] = useState<number | undefined>(undefined);
  const [backstopToken, setBackstopToken] = useState<BackstopToken | undefined>(undefined);
  const [bootstraps, setBootstraps] = useState<Map<number, BootstrapState>>(new Map());

  // ********** Loaders **********

  const loadLastId = async (): Promise<number> => {
    const bootstrapper = new BootstrapClient(bootstrapperId);
    const lastIdOp = bootstrapper.get_next_id();
    const sim = await simulateOperation(lastIdOp);
    if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
      const lastId = parsers.get_next_id(sim.result.retval) - 1;
      setLastId(lastId);
      return lastId;
    } else {
      console.error('Failed to load last id: ', sim);
      return -1;
    }
  };

  const loadBootstrap = async (
    id: number,
    refreshToken?: boolean
  ): Promise<BootstrapState | undefined> => {
    try {
      if (refreshToken || backstopToken === undefined) {
        const backstopToken = await BackstopToken.load(
          getNetwork(),
          backstopTokenId,
          blndId,
          usdcId
        );
        setBackstopToken(backstopToken);
      }
      const bootstrapper = new BootstrapClient(bootstrapperId);
      const bootstrapOp = bootstrapper.get_bootstrap({ id: id });
      const sim = await simulateOperation(bootstrapOp);
      if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
        const bootstrap = parsers.get_bootstrap(sim.result.retval);
        const pairTokenId = bootstrap.config.token_index === 0 ? usdcId : blndId;
        const [userDeposit, userPairBalance] = await Promise.all([
          fetchUserDeposit(id, walletAddress),
          fetchBalance(pairTokenId, walletAddress),
        ]);

        const fetchTimestamp = Date.now();
        const bootstrapState: BootstrapState = {
          ...bootstrap,
          id: id,
          pairTokenId: pairTokenId,
          bootstrapTokenId: bootstrap.config.token_index === 0 ? blndId : usdcId,
          userDeposit: userDeposit ?? { amount: 0n, claimed: false, refunded: false },
          userPairTokenBalance: userPairBalance ?? 0n,
          fetchTimestamp: fetchTimestamp,
          fetchLedger: sim.latestLedger,
        };
        const new_map = new Map(bootstraps);
        setBootstraps(new_map.set(id, bootstrapState));
        return bootstrapState;
      } else {
        console.error('Failed to bootstrap: ', id, sim);
        return undefined;
      }
    } catch (e: any) {
      console.error('Unkown error during load bootstrap: ', e);
      return undefined;
    }
  };

  const fetchUserDeposit = async (id: number, userId: string): Promise<DepositData | undefined> => {
    if (walletAddress === undefined || walletAddress === '') {
      return undefined;
    }

    try {
      const bootstrapper = new BootstrapClient(bootstrapperId);
      const bootstrapOp = bootstrapper.get_deposit({ id: id, user: userId });
      const sim = await simulateOperation(bootstrapOp);
      if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval != undefined) {
        const deposit = parsers.get_deposit(sim.result.retval);
        return deposit;
      } else {
        console.error('Failed to load bootstrap: ', sim);
        return undefined;
      }
    } catch (e: any) {
      console.error('Unkown error during load user deposit: ', e);
      return undefined;
    }
  };

  const fetchBootstrap = async (id: number): Promise<BootstrapState | undefined> => {
    const from_cache = bootstraps.get(id);
    if (from_cache !== undefined && from_cache.fetchTimestamp + 60000 < Date.now()) {
      return from_cache;
    }
    return loadBootstrap(id, true);
  };

  return (
    <BootstrapContext.Provider
      value={{
        bootstrapperId,
        backstopTokenId,
        backstopToken,
        lastId,
        bootstraps,
        loadLastId,
        loadBootstrap,
        fetchBootstrap,
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

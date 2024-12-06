import { Address, rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { Network } from './rpc';

function decodeEntryKey(entryKey: xdr.ScVal): string {
  let key: string | undefined;
  switch (entryKey.switch()) {
    // Key is a ScVec[ScvSym, ScVal]
    case xdr.ScValType.scvVec():
      key = entryKey.vec()?.at(0)?.sym().toString();
      break;
    case xdr.ScValType.scvSymbol():
      key = entryKey.sym().toString();
      break;
    case xdr.ScValType.scvLedgerKeyContractInstance():
      key = 'ContractInstance';
      break;
    default:
      throw Error(`Invalid ledger entry key type: should not contain type ${entryKey.switch()}`);
  }
  if (key === undefined) {
    throw Error('Invalid ledger entry key');
  }
  return key;
}

export interface Q4W {
  amount: bigint;
  exp: bigint;
}

/**
 * Ledger data for the Comet BLND/USDC LP
 */
export class BackstopToken {
  constructor(
    /// The address of the comet pool
    public id: string,
    /// The amount of BLND in the comet LP
    public blnd: bigint,
    /// The amount of USDC in the comet LP
    public usdc: bigint,
    /// The number of shares in the comet LP
    public shares: bigint,
    /// The amount of BLND per LP token
    public blndPerLpToken: number,
    /// The amount of USDC per LP token
    public usdcPerLpToken: number,
    /// The price of the LP token in USDC
    public lpTokenPrice: number
  ) {}

  /**
   * Load the backstop token data from the ledger
   * @param network - The network information to load the backstop from
   * @param id - The contract address of the backstop
   * @returns - The backstop token object
   */
  public static async load(
    network: Network,
    id: string,
    blndTkn: string,
    usdcTkn: string
  ): Promise<BackstopToken> {
    const stellarRpc = new rpc.Server(network.rpc, network.opts);
    const recordDataKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(id).toScAddress(),
        key: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('AllRecordData')]),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
    const totalSharesKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(id).toScAddress(),
        key: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('TotalShares')]),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
    const ledgerEntriesResp = await stellarRpc.getLedgerEntries(recordDataKey, totalSharesKey);
    let blnd: bigint | undefined;
    let usdc: bigint | undefined;
    let totalShares: bigint | undefined;
    for (const entry of ledgerEntriesResp.entries) {
      const ledgerData = entry.val;
      const key = decodeEntryKey(ledgerData.contractData().key());
      switch (key) {
        case 'AllRecordData': {
          const records = scValToNative(ledgerData.contractData().val());
          if (records != undefined) {
            blnd = records[blndTkn]?.balance;
            usdc = records[usdcTkn]?.balance;
          }
          break;
        }
        case 'TotalShares':
          totalShares = scValToNative(ledgerData.contractData().val());
          break;
        default:
          throw new Error(`Invalid backstop pool key: should not contain ${key}`);
      }
    }

    if (blnd === undefined || usdc === undefined || totalShares === undefined) {
      throw new Error('Invalid backstop token data');
    }

    const blndPerLpToken = Number(blnd) / Number(totalShares);
    const usdcPerLpToken = Number(usdc) / Number(totalShares);
    const lpTokenPrice = (Number(usdc) * 5) / Number(totalShares);

    return new BackstopToken(
      id,
      blnd,
      usdc,
      totalShares,
      blndPerLpToken,
      usdcPerLpToken,
      lpTokenPrice
    );
  }
}

export class UserBalance {
  constructor(
    public shares: bigint,
    public q4w: Q4W[],
    public unlockedQ4W: bigint,
    public totalQ4W: bigint
  ) {}

  public static async load(
    network: Network,
    backstopId: string,
    poolId: string,
    userId: string
  ): Promise<UserBalance> {
    const stellarRpc = new rpc.Server(network.rpc, network.opts);

    const ledgerKey = UserBalance.ledgerKey(backstopId, poolId, userId);
    const ledgerEntryData = await stellarRpc.getLedgerEntries(ledgerKey);
    if (ledgerEntryData.entries.length == 0) {
      return new UserBalance(0n, [], 0n, 0n);
    }
    return UserBalance.fromLedgerEntryData(
      ledgerEntryData.entries[0].val,
      Math.floor(Date.now() / 1000)
    );
  }

  static ledgerKey(backstopId: string, poolId: string, userId: string): xdr.LedgerKey {
    return xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(backstopId).toScAddress(),
        key: xdr.ScVal.scvVec([
          xdr.ScVal.scvSymbol('UserBalance'),
          xdr.ScVal.scvMap([
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol('pool'),
              val: Address.fromString(poolId).toScVal(),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol('user'),
              val: Address.fromString(userId).toScVal(),
            }),
          ]),
        ]),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
  }

  static fromLedgerEntryData(
    ledger_entry_data: xdr.LedgerEntryData | string,
    timestamp: number
  ): UserBalance {
    if (typeof ledger_entry_data == 'string') {
      ledger_entry_data = xdr.LedgerEntryData.fromXDR(ledger_entry_data, 'base64');
    }

    const data_entry_map = ledger_entry_data.contractData().val().map();
    if (data_entry_map == undefined) {
      throw Error('UserBalance contract data value is not a map');
    }

    let shares: bigint | undefined;
    const q4w: Q4W[] = [];
    let unlockedQ4W = BigInt(0);
    let totalQ4W = BigInt(0);
    for (const map_entry of data_entry_map) {
      const key = decodeEntryKey(map_entry.key());
      switch (key) {
        case 'shares':
          shares = scValToNative(map_entry.val());
          break;
        case 'q4w':
          map_entry
            .val()
            .vec()
            ?.map((entry) => {
              const q4w_array = entry.map();
              let amount: bigint | undefined;
              let exp: bigint | undefined;
              for (const q4wEntry of q4w_array ?? []) {
                const q4wKey = q4wEntry.key().sym().toString();
                switch (q4wKey) {
                  case 'amount':
                    amount = scValToNative(q4wEntry.val());
                    break;
                  case 'exp':
                    exp = scValToNative(q4wEntry.val());
                    break;
                  default:
                    throw Error(`Invalid Q4W key: should not contain ${q4wKey}`);
                }
              }
              if (amount == undefined || exp == undefined) {
                throw Error(`Malformed Q4W scvMap`);
              }
              totalQ4W += amount;
              if (BigInt(timestamp) > exp) {
                unlockedQ4W += amount;
              } else {
                q4w.push({ amount, exp });
              }
            });
          break;
        default:
          throw Error(`Invalid backstop UserBalance key: should not contain ${key}`);
      }
    }
    if (shares == undefined) {
      throw Error("Invalid UserBalance: should contain 'shares'");
    }
    return new UserBalance(shares, q4w, unlockedQ4W, totalQ4W);
  }
}

export class PoolBalance {
  constructor(
    public shares: bigint,
    public tokens: bigint,
    public q4w: bigint
  ) {}

  public static async load(
    network: Network,
    backstopId: string,
    poolId: string
  ): Promise<PoolBalance> {
    const stellarRpc = new rpc.Server(network.rpc, network.opts);

    const ledgerKey = PoolBalance.ledgerKey(backstopId, poolId);
    const ledgerEntryData = await stellarRpc.getLedgerEntries(ledgerKey);
    if (ledgerEntryData.entries.length == 0) {
      return new PoolBalance(0n, 0n, 0n);
    }
    return PoolBalance.fromLedgerEntryData(ledgerEntryData.entries[0].val);
  }

  static ledgerKey(backstopId: string, poolId: string): xdr.LedgerKey {
    return xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(backstopId).toScAddress(),
        key: xdr.ScVal.scvVec([
          xdr.ScVal.scvSymbol('PoolBalance'),
          Address.fromString(poolId).toScVal(),
        ]),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
  }

  static fromLedgerEntryData(ledger_entry_data: xdr.LedgerEntryData | string): PoolBalance {
    if (typeof ledger_entry_data == 'string') {
      ledger_entry_data = xdr.LedgerEntryData.fromXDR(ledger_entry_data, 'base64');
    }

    const data_entry_map = ledger_entry_data.contractData().val().map();
    if (data_entry_map == undefined) {
      throw Error('PoolBalance contract data value is not a map');
    }
    let shares: bigint | undefined;
    let tokens: bigint | undefined;
    let q4w: bigint | undefined;
    for (const map_entry of data_entry_map) {
      const key = decodeEntryKey(map_entry.key());
      switch (key) {
        case 'shares':
          shares = scValToNative(map_entry.val());
          break;
        case 'tokens':
          tokens = scValToNative(map_entry.val());
          break;
        case 'q4w':
          q4w = scValToNative(map_entry.val());
          break;
        default:
          throw Error(`Invalid PoolBalance key: should not contain ${key}`);
      }
    }

    if (shares == undefined || tokens == undefined || q4w == undefined) {
      throw Error(`Malformed PoolBalance scvMap `);
    }
    return new PoolBalance(shares, tokens, q4w);
  }
}

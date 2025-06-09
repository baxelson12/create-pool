import { execSync } from 'node:child_process';
import { type Log, decodeEventLog, getEventSelector } from 'viem';
import {
  priceToSqrtPriceX96,
  sqrtPriceX96ToPrice,
} from './utils/price-to-sqrtX96';
import { sortAddresses } from './utils/sort-addresses';
import type { PoolCreationConfig } from './validation';
import { INITIALIZE_EVENT_ABI } from './constants/events';

type SortedCurrencies = {
  sortedC0Address: string;
  sortedC1Address: string;
};

export const sortCurrencies = async (
  c0Addr: string,
  c1Addr: string
): Promise<SortedCurrencies> => {
  const [sortedC0Address, sortedC1Address] = sortAddresses(c0Addr, c1Addr);
  return { sortedC0Address, sortedC1Address };
};

export const calculatePrice = async (
  c0Price: number,
  c1Price: number
): Promise<number> => {
  return c0Price / c1Price;
};

export const getSqrtPriceX96 = async (
  price: number,
  token0Decimals: number,
  token1Decimals: number
): Promise<bigint> => {
  return priceToSqrtPriceX96(price, token0Decimals, token1Decimals);
};

export const reverseAndConfirmPrice = async (
  originalPriceRatio: number,
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number
): Promise<boolean> => {
  const inversePriceRatio = sqrtPriceX96ToPrice(
    sqrtPriceX96,
    token0Decimals,
    token1Decimals
  );
  return Math.abs(originalPriceRatio - inversePriceRatio) < 0.1;
};

export const runFoundryScript = async (config: PoolCreationConfig) => {
  const sig =
    'run(address, (address, address, uint160, uint24, int24, address))';
  const args = [
    config.poolManager,
    `"(${config.sortedC0Address},${config.sortedC1Address},${config.sqrtPriceX96},${config.fee},${config.tickSpacing},${config.hooksAddress})"`,
  ].join(' ');

  const output = execSync(
    `forge script ./script/CreatePool.s.sol:CreatePool --broadcast --json --rpc-url ${config.rpc} --private-key ${config.privateKey} --sig "${sig}" ${args}`,
    { cwd: './contracts', encoding: 'utf-8' }
  );

  const jsonOutput = JSON.parse(output) as {
    logs: Log[];
    receipts: { transactionHash: string }[];
  };
  const initializeEventSelector = getEventSelector(INITIALIZE_EVENT_ABI[0]);
  const log = jsonOutput.logs.find(
    (log) => log.topics[0] === initializeEventSelector
  );
  if (!log)
    throw new Error('Initialize event log not found in transaction receipt.');
  const decoded = decodeEventLog({
    abi: INITIALIZE_EVENT_ABI,
    data: log.data,
    topics: log.topics,
  });

  return { ...decoded.args, hash: jsonOutput.receipts[0]!.transactionHash };
};

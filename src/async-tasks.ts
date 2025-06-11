import { execSync } from 'node:child_process';
import Decimal from 'decimal.js';
import { type Log, decodeEventLog, getEventSelector } from 'viem';
import {
  priceToSqrtPriceX96,
  sqrtPriceX96ToPrice,
} from './utils/price-to-sqrtX96';
import { sortAddresses } from './utils/sort-addresses';
import type { PoolCreationConfig } from './validation';
import { parseForgeOutput } from './utils/parse-output';

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
): Promise<string> => {
  Decimal.set({ precision: 50, toExpNeg: -100, toExpPos: 100 });
  return Decimal(c0Price).div(c1Price).toString();
};

export const getSqrtPriceX96 = async (
  price: string,
  token0Decimals: number,
  token1Decimals: number
): Promise<bigint> => {
  return priceToSqrtPriceX96(price, token0Decimals, token1Decimals);
};

export const reverseAndConfirmPrice = async (
  originalPriceRatio: string,
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number
): Promise<boolean> => {
  const inversePriceRatio = sqrtPriceX96ToPrice(
    sqrtPriceX96,
    token0Decimals,
    token1Decimals
  );
  return Decimal.abs(Decimal(originalPriceRatio).minus(inversePriceRatio)).lt(
    0.1
  );
};

export const runFoundryScript = async (config: PoolCreationConfig) => {
  const sig =
    'run(address, (address, address, uint160, uint24, int24, address))';
  const args = [
    config.poolManager,
    `"(${config.currency0Address},${config.currency1Address},${config.sqrtPriceX96},${config.fee},${config.tickSpacing},${config.hooksAddress})"`,
  ].join(' ');

  const output = execSync(
    `forge script ./script/CreatePool.s.sol:CreatePool --broadcast --json --rpc-url ${config.rpc} --private-key ${config.privateKey} --sig "${sig}" ${args}`,
    { cwd: './contracts', encoding: 'utf-8' }
  );

  const parsed = parseForgeOutput(output);
  if (!parsed)
    throw new Error('Failed to parse successful transaction output.');
  const { transactionHash, decodedLog } = parsed;
  return { ...decodedLog.args, hash: transactionHash };
};

import {
  priceToSqrtPriceX96,
  sqrtPriceX96ToPrice,
} from './utils/price-to-sqrtX96';
import { sortAddresses } from './utils/sort-addresses';

/**
 * Simulates a time-consuming asynchronous operation.
 * @param {number} duration - The duration to wait in milliseconds.
 * @param {boolean} shouldFail - Whether the task should simulate a failure.
 * @returns {Promise<void>}
 */
const simulateAsyncTask = (
  duration: number = 1500,
  shouldFail: boolean = false
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Simulated task failure.'));
      } else {
        resolve();
      }
    }, duration);
  });
};

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

export const runFoundryScript = async (config: unknown): Promise<string> => {
  await simulateAsyncTask(2500);
  // Real implementation: execute a foundry script with the config
  // and return the new pool address
  const mockPoolAddress =
    '0x' +
    Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  return mockPoolAddress;
};

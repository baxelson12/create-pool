import Decimal from 'decimal.js';

const Q96 = 2n ** 96n;

/**
 * Converts a human-readable price to a BigInt representation of sqrtPriceX96.
 * This function uses BigInt for all intermediate calculations to avoid floating-point
 * precision errors.
 *
 * @param price The human-readable price (e.g., 1850.55). This should be the price of token0 in terms of token1.
 * @param token0Decimals The number of decimals for token0.
 * @param token1Decimals The number of decimals for token1.
 * @returns The sqrtPriceX96 value as a BigInt.
 */
export function priceToSqrtPriceX96(
  price: string,
  token0Decimals: number,
  token1Decimals: number
): bigint {
  Decimal.set({ precision: 50, toExpNeg: -100, toExpPos: 100 });

  const priceRatio = Decimal(price).mul(
    Decimal(10).pow(token1Decimals - token0Decimals)
  );
  const sqrtPrice = Decimal(priceRatio).sqrt();
  return BigInt(Decimal.round(sqrtPrice.mul(Number(Q96))).toString());
}

/**
 * Converts a sqrtPriceX96 value back to a human-readable price.
 * This is the inverse of `priceToSqrtPriceX96`.
 * @param sqrtPriceX96 The sqrtPriceX96 value as a BigInt.
 * @param token0Decimals The number of decimals for token0.
 * @param token1Decimals The number of decimals for token1.
 * @returns The human-readable price as a number.
 */
export function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number
): string {
  Decimal.set({ precision: 50, toExpNeg: -100, toExpPos: 100 });
  const sqrtPrice = new Decimal(sqrtPriceX96.toString()).div(Q96.toString());
  const priceRatio = sqrtPrice.pow(2);
  const factor = new Decimal(10).pow(token1Decimals - token0Decimals);
  const price = priceRatio.div(factor);

  return price.toString();
}

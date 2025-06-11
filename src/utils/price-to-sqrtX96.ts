// The Q96 constant (2^96) as a BigInt
const Q96 = 2n ** 96n;

/**
 * Computes the integer square root of a BigInt.
 * This function is required because there is no native `BigInt.sqrt`.
 * @param value The BigInt value to compute the square root of.
 * @returns The integer square root of the value.
 */
function sqrt(value: bigint): bigint {
  if (value < 0n) {
    throw new Error('Square root of negative numbers is not supported.');
  }
  if (value === 0n) {
    return 0n;
  }
  // Use Newton's method for integer square root.
  let x = value;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + value / x) / 2n;
  }
  return x;
}

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
  // 1. Represent the price as a fraction (numerator/denominator) to handle decimals.
  //    This avoids using floating-point numbers for the core calculation.
  const decimalIndex = price.indexOf('.');

  let priceNumerator: bigint;
  let priceDenominator: bigint;

  if (decimalIndex === -1) {
    // It's an integer
    priceNumerator = BigInt(price);
    priceDenominator = 1n;
  } else {
    const decimalPlaces = price.length - decimalIndex - 1;
    priceNumerator = BigInt(price.replace('.', ''));
    priceDenominator = 10n ** BigInt(decimalPlaces);
  }

  // 2. Calculate the decimal adjustment factor.
  //    This is 10^(token0Decimals) / 10^(token1Decimals).
  const decimalAdjustment = 10n ** BigInt(token0Decimals - token1Decimals);

  // 3. Combine the price and decimal adjustment.
  //    The raw price ratio is price * (10^token0 / 10^token1).
  const rawPriceRatioNumerator = priceNumerator * decimalAdjustment;
  const rawPriceRatioDenominator = priceDenominator;

  // 4. Calculate the sqrtPriceX96.
  //    The formula is sqrt(rawPriceRatio) * 2^96.
  //    To maintain precision during the division and square root, we use the identity:
  //    sqrt(A/B) * C = sqrt(A * C^2 / B)
  //    So, sqrt(num/den) * Q96 = sqrt(num * Q96^2 / den)
  const numeratorWithQ96 = rawPriceRatioNumerator * (Q96 * Q96);
  const sqrtPriceX96 = sqrt(numeratorWithQ96 / rawPriceRatioDenominator);

  return sqrtPriceX96;
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
): number {
  // The formula is: price = (sqrtPriceX96 / 2^96)^2 * (10^token1Decimals / 10^token0Decimals)
  // We perform calculations with BigInt to maintain precision.
  const numerator = sqrtPriceX96 * sqrtPriceX96 * 10n ** BigInt(token1Decimals);
  const denominator = Q96 * Q96 * 10n ** BigInt(token0Decimals);

  // Convert to number at the very end for the final division.
  return Number(numerator) / Number(denominator);
}

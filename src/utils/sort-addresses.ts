/**
 * Sorts two token addresses in the same manner as Uniswap V4.
 * @param tokenA The first token address string.
 *
 * @param tokenB The second token address string.
 * @returns An array of [token0, token1] sorted correctly.
 */
export function sortAddresses(
  tokenA: string,
  tokenB: string
): [string, string] {
  // We're checking this upstream but nbd
  if (
    !/^0x[a-fA-F0-9]{40}$/.test(tokenA) ||
    !/^0x[a-fA-F0-9]{40}$/.test(tokenB)
  ) {
    throw new Error('Invalid Ethereum address format');
  }

  const bigA = BigInt(tokenA);
  const bigB = BigInt(tokenB);

  return bigA < bigB ? [tokenA, tokenB] : [tokenB, tokenA];
}

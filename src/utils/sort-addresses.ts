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
  // Ensure the addresses are valid hex strings (optional but good practice)
  if (
    !/^0x[a-fA-F0-9]{40}$/.test(tokenA) ||
    !/^0x[a-fA-F0-9]{40}$/.test(tokenB)
  ) {
    throw new Error('Invalid Ethereum address format');
  }

  // Convert the hex address strings to BigInts for numerical comparison
  const bigA = BigInt(tokenA);
  const bigB = BigInt(tokenB);

  // Compare the BigInts and return the sorted addresses
  return bigA < bigB ? [tokenA, tokenB] : [tokenB, tokenA];
}

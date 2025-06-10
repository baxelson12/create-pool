import {
  runFoundryScript,
  calculatePrice,
  getSqrtPriceX96,
  sortCurrencies,
} from './async-tasks';
import type { PoolCreationConfig } from './validation';

export default async function inline(config: PoolCreationConfig) {
  const { sortedC1Address } = await sortCurrencies(
    config.currency0Address,
    config.currency1Address
  );
  const hasFlipped = config.currency0Address === sortedC1Address;
  config.currency0Address = hasFlipped
    ? config.currency1Address
    : config.currency0Address;
  config.currency1Address = hasFlipped
    ? config.currency0Address
    : config.currency1Address;
  config.currency0Decimals = hasFlipped
    ? config.currency1Decimals
    : config.currency0Decimals;
  config.currency1Decimals = hasFlipped
    ? config.currency0Decimals
    : config.currency1Decimals;
  config.currency0Price = hasFlipped
    ? config.currency1Price
    : config.currency0Price;
  config.currency1Price = hasFlipped
    ? config.currency0Price
    : config.currency1Price;
  const priceRatio = await calculatePrice(
    config.currency0Price,
    config.currency1Price
  );

  config.sqrtPriceX96 = await getSqrtPriceX96(
    priceRatio,
    config.currency0Decimals,
    config.currency1Decimals
  );

  try {
    console.log(JSON.stringify(await runFoundryScript(config)));
  } catch (e) {
    console.error(`Foundry script failed: ${e}`);
  }
}

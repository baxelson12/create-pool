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
  const configOld = { ...config };
  config.currency0Address = hasFlipped
    ? configOld.currency1Address
    : configOld.currency0Address;
  config.currency1Address = hasFlipped
    ? configOld.currency0Address
    : configOld.currency1Address;
  config.currency0Decimals = hasFlipped
    ? configOld.currency1Decimals
    : configOld.currency0Decimals;
  config.currency1Decimals = hasFlipped
    ? configOld.currency0Decimals
    : configOld.currency1Decimals;
  config.currency0Price = hasFlipped
    ? configOld.currency1Price
    : configOld.currency0Price;
  config.currency1Price = hasFlipped
    ? configOld.currency0Price
    : configOld.currency1Price;
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

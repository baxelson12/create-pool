import * as p from '@clack/prompts';
import color from 'picocolors';
import { z } from 'zod';
import { poolCreationSchema, type PoolCreationConfig } from './validation.js';
import {
  sortCurrencies,
  calculatePrice,
  getSqrtPriceX96,
  reverseAndConfirmPrice,
  runFoundryScript,
} from './async-tasks.js';

// Helper for Zod validation within Clack prompts
const validateWithZod = (schema: z.ZodType<any, any>) => (value: any) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.issues.map(v => v.message).join("\n")
  }
};

export default async function main() {
  console.clear();
  p.intro(color.bgCyan(color.black(' Uniswap v4 Pool Creator ')));

  // Use Partial to allow building the config object incrementally
  const config: Partial<PoolCreationConfig & { sortedC0Address: string; sortedC1Address: string; }> = {};

  // --- Group 1: Addresses and Prices ---
  const initialDetails = await p.group(
    {
      privateKey: () =>
        p.password({
          message: 'Enter the private key for the executing wallet:',
          validate: validateWithZod(poolCreationSchema.shape.privateKey),
        }),
      currency0Address: () =>
        p.text({
          message: 'Enter the contract address for the first token (Currency0):',
          placeholder: '0x...',
          validate: validateWithZod(poolCreationSchema.shape.currency0Address),
        }),
      currency0Price: () =>
        p.text({
          message: 'Enter the current USD price for Currency0:',
          placeholder: 'e.g., 1850.55',
          validate: (val) => {
            const numVal = Number(val);
            if (isNaN(numVal)) return 'Please enter a valid number.';
            return validateWithZod(poolCreationSchema.shape.currency0Price)(numVal);
          },
        }),
      currency1Address: () =>
        p.text({
          message: 'Enter the contract address for the second token (Currency1):',
          placeholder: '0x...',
          validate: validateWithZod(poolCreationSchema.shape.currency1Address),
        }),
      currency1Price: () =>
        p.text({
          message: 'Enter the current USD price for Currency1:',
          placeholder: 'e.g., 1.00',
          validate: (val) => {
            const numVal = Number(val);
            if (isNaN(numVal)) return 'Please enter a valid number.';
            return validateWithZod(poolCreationSchema.shape.currency1Price)(numVal);
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );
  Object.assign(config, initialDetails);

  const s = p.spinner();

  // --- Processing Steps ---
  try {
    s.start('1. Sorting currencies by address...');
    const { sortedC0Address, sortedC1Address } = await sortCurrencies(config.currency0Address!, config.currency1Address!);
    config.sortedC0Address = sortedC0Address;
    config.sortedC1Address = sortedC1Address;
    s.stop('Currencies sorted.');

    s.start('2. Calculating price ratio...');
    const priceRatio = await calculatePrice(config.currency0Price!, config.currency1Price!);
    s.stop(`Price ratio calculated: ${priceRatio.toFixed(4)}`);

    s.start('3. Calculating SqrtPriceX96...');
    const sqrtPriceX96 = await getSqrtPriceX96(priceRatio);
    s.stop('SqrtPriceX96 calculated.');

    s.start('4. Verifying price conversion...');
    const reversedPrice = await reverseAndConfirmPrice(sqrtPriceX96);
    s.stop(`Price verified. Reversed: ~${reversedPrice.toFixed(4)}`);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    p.cancel(`An error occurred during processing: ${message}`);
    process.exit(1);
  }

  // --- Group 2: Pool Parameters ---
  const poolParams = await p.group({
    fee: async () => {
      let otherFee: string | symbol;
      let fee = await p.select({
        message: 'Select the pool fee:',
        options: [
          { value: "100", label: '0.01%' },
          { value: "500", label: '0.05%' },
          { value: "3000", label: '0.30%' },
          { value: "10000", label: '1.00%' },
          { value: 'other', label: 'Other...' },
        ],
      });
      if (fee === 'other') {
        otherFee = await p.text({
          message: 'Enter a custom fee value (e.g., 5% = 50000):',
          placeholder: 'e.g., 50000',
          validate: (val) => {
            const numVal = Number(val);
            if (isNaN(numVal)) return 'Please enter a valid number.';
            return validateWithZod(poolCreationSchema.shape.fee)(numVal);
          },
        });
        return otherFee;
      }
      return fee;
    },
    tickSpacing: async () => {
      let otherTick: string | symbol;
      let tick = await p.select({
        message: 'Select the tick spacing:',
        options: [
          { value: "1", label: '1' },
          { value: "10", label: '10' },
          { value: "60", label: '60' },
          { value: "200", label: '200' },
          { value: 'other', label: 'Other...' },
        ],
      });
      if (tick === 'other') {
        otherTick = await p.text({
          message: 'Enter a custom tick spacing value:',
          placeholder: 'e.g., 100',
          validate: (val) => {
            const numVal = Number(val);
            if (isNaN(numVal)) return 'Please enter a valid number.';
            return validateWithZod(poolCreationSchema.shape.tickSpacing)(numVal);
          },
        });
        return otherTick;
      }
      return tick;
    },
    hooksAddress: () => p.text({
      message: 'Enter the hooks contract address (or leave for none):',
      initialValue: '0x0000000000000000000000000000000000000000',
      validate: validateWithZod(poolCreationSchema.shape.hooksAddress),
    }),
  }, {
    onCancel: () => {
      p.cancel('Operation cancelled.');
      process.exit(0);
    },
  });
  Object.assign(config, poolParams);


  // --- Final Confirmation ---
  p.note(`
    --- Review Your Pool Configuration ---
    Wallet Key:     ${color.dim('****' + config.privateKey!.slice(-4))}
    Token 0 Addr:   ${color.yellow(config.sortedC0Address!)}
    Token 0 Price:  ${color.yellow(config.currency0Price!)}
    Token 1 Addr:   ${color.yellow(config.sortedC1Address!)}
    Token 1 Price:  ${color.yellow(config.currency1Price!)}
    Pool Fee:       ${color.green(config.fee!)}
    Tick Spacing:   ${color.green(config.tickSpacing!)}
    Hooks Address:  ${color.cyan(config.hooksAddress!)}
  `);

  const shouldContinue = await p.confirm({
    message: 'Is all this information correct?',
  });

  if (!shouldContinue || p.isCancel(shouldContinue)) {
    p.cancel('Pool creation aborted.');
    process.exit(0);
  }

  // --- Execute Foundry Script ---
  s.start('Executing Foundry script to create the pool...');
  try {
    const poolAddress = await runFoundryScript(config as PoolCreationConfig);
    s.stop('Foundry script executed successfully!');
    p.outro(color.green(`🎉 Pool created! Address: ${color.underline(color.yellow(poolAddress))}`));
  } catch (error) {
    s.stop('Failed to create pool.', 1);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    p.cancel(`An error occurred: ${message}`);
  }
}

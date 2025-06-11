import yargs from 'yargs';
import clackInteractive from './src/interactive';
import inline from './src/inline';
import { poolCreationSchema } from './src/validation';

const argv = yargs(process.argv.splice(2))
  .command(
    ['interactive', '$0'],
    'Use interactive parameter collection',
    () => {},
    clackInteractive
  )
  .command(
    'inline',
    'Use inline parameters',
    (yargs) => {
      return yargs
        .option('privateKey', {
          alias: 'p',
          describe:
            'Private key for the wallet which will execute the transaction',
          type: 'string',
          demandOption: true,
        })
        .option('currency0Address', {
          alias: 'c0',
          describe:
            'Contract address for the first token in the liquidity pool',
          type: 'string',
          demandOption: true,
        })
        .option('currency1Address', {
          alias: 'c1',
          describe:
            'Contract address for the second token in the liquidity pool',
          type: 'string',
          demandOption: true,
        })
        .option('currency0Price', {
          alias: 'p0',
          describe: 'USD price for currency0 (e.g., 150.50)',
          type: 'number',
          demandOption: true,
        })
        .option('currency1Price', {
          alias: 'p1',
          describe: 'USD price for currency1 (e.g., 0.99)',
          type: 'number',
          demandOption: true,
        })
        .option('currency0Decimals', {
          describe: 'The number of decimals for currency0',
          type: 'number',
          demandOption: true,
        })
        .option('currency1Decimals', {
          describe: 'The number of decimals for currency1',
          type: 'number',
          demandOption: true,
        })
        .option('fee', {
          alias: 'f',
          describe:
            'The pool fee, represented as an integer (e.g., 1% = 10000)',
          type: 'number',
          demandOption: true,
        })
        .option('tickSpacing', {
          alias: 't',
          describe: 'The space between ticks (e.g., 200 for a 1% fee)',
          type: 'number',
          demandOption: true,
        })
        .option('hooksAddress', {
          alias: 'H',
          describe: 'Optional: Contract address for hooks',
          type: 'string',
          // It's optional, so no demandOption. We can add a default.
          default: '0x0000000000000000000000000000000000000000',
        })
        .option('rpc', {
          describe: 'The RPC URL for the target network',
          type: 'string',
          demandOption: true,
        })
        .option('etherscanRoot', {
          describe:
            'The root URL for the block explorer (e.g., "https://etherscan.io")',
          type: 'string',
          demandOption: true,
        })
        .option('poolManager', {
          describe: 'Address of the Uniswap V4 PoolManager contract',
          type: 'string',
          demandOption: true,
        })
        .help()
        .alias('help', 'h')
        .wrap(process.stdout.columns);
    },
    (val) => inline(poolCreationSchema.parse(val))
  )
  .strict()
  .help('h')
  .parse();

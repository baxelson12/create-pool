import yargs from 'yargs'
import clackInput from './src/interactive';

/**
 * Things we need to make this run:
 * - private key
 * - currency0 (address)
 * - currency1 (address)
 * - currency0price (USD) (current price or starting price)
 * - currency1price (USD) (current price or starting price) 
 * - fee (provide standard options, option for other)
 * - tickSpacing (provide standard options, option for other)
 * - hooks (address)
 *
 * Order of operations 
 * - Collect the addresses for pair and their respective USD prices
 * - Sort them
 * - Calculate price (sorted c0 / c1) 
 * - Run code to get sqrtX96 price
 * - Reverse sqrtX96 and confirm USD price is correct
 * - Show fee options or other
 * - Show tick spacing options or other
 * - Show hooks address prompt (0 address if none)
 * - Confirm information is correct
 * - Run foundry script
 * - Output created pool address
 */

const sing = () => console.log('🎵 Oy oy oy');

const argv = yargs(process.argv.splice(2))
  .command(['interactive', '$0'], 'Use interactive parameter collection', () => { }, clackInput)
  .command('inline', 'Use inline parameters', (yargs) => {
    return yargs
      .option('privateKey', {
        alias: 'p',
        describe: 'Private key for the wallet which will execute the transaction',
        type: 'string',
        demandOption: true,
      })
      .option('currency0Address', {
        alias: 'c0',
        describe: 'Contract address for the first token in the liquidity pool',
        type: 'string',
        demandOption: true,
      })
      .option('currency1Address', {
        alias: 'c1',
        describe: 'Contract address for the second token in the liquidity pool',
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
      .option('fee', {
        alias: 'f',
        describe: 'The pool fee, represented as an integer (e.g., 1% = 10000)',
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
        // No `demandOption: true` because it is optional
      })
      .help()
      .alias('help', 'h')
      .wrap(process.stdout.columns)
  }, sing)
  .strict()
  .help('h')
  .parse();


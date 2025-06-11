# create-pool

Uniswap V4 CLI to create a new pool

## Overview

`create-pool` is a command-line tool for creating new liquidity pools on Uniswap V4. It provides both interactive and inline modes for configuration and execution. This tool leverages [Bun](https://bun.sh).

## Features

- **Interactive Mode**: Guided prompts help you enter all required pool parameters, validate input, and preview your configuration before execution.
- **Inline Mode**: Quickly create pools by passing all required parameters as CLI flags—good for automation and scripting.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.2.15 or higher (for running and dependency management)
- Node.js compatible environment (if running outside Bun, adapt commands accordingly)
- Access to an Ethereum-compatible wallet private key
- RPC endpoint and Uniswap V4 PoolManager contract address for your target network

### Installation

First, install dependencies:

```bash
bun install
```

### Usage

#### Interactive Mode

Launch guided setup:

```bash
bun run index.ts
# or
bun run index.ts interactive
```

You'll be prompted for:
- Wallet private key
- RPC URL
- Block explorer root URL (e.g., `https://etherscan.io/tx`)
- Uniswap V4's PoolManager contract address
- Token addresses, decimals, and prices
- Pool fee and tick spacing
- Optional hooks contract address

#### Inline Mode

If you prefer or need automation, you can pass all parameters directly:

```bash
bun run index.ts inline \
  --privateKey <YOUR_PRIVATE_KEY> \
  --currency0Address <TOKEN0_ADDRESS> \
  --currency1Address <TOKEN1_ADDRESS> \
  --currency0Price <PRICE0> \
  --currency1Price <PRICE1> \
  --currency0Decimals <DECIMALS0> \
  --currency1Decimals <DECIMALS1> \
  --fee <FEE> \
  --tickSpacing <SPACING> \
  --poolManager <POOL_MANAGER_ADDRESS> \
  --rpc <RPC_URL> \
  --etherscanRoot <EXPLORER_URL_ROOT> \
  [--hooksAddress <HOOKS_ADDRESS>]
```

All parameters are required except `hooksAddress`, which defaults to `0x0000000000000000000000000000000000000000`.

#### Example

```bash
bun run index.ts inline \
  --privateKey '0xabc123...' \
  --currency0Address '0xToken0...' \
  --currency1Address '0xToken1...' \
  --currency0Price 1850.55 \
  --currency1Price 1.00 \
  --currency0Decimals 18 \
  --currency1Decimals 6 \
  --fee 10000 \
  --tickSpacing 200 \
  --poolManager '0xPoolManager...' \
  --rpc 'https://mainnet.infura.io/v3/YOUR_KEY' \
  --etherscanRoot 'https://etherscan.io/tx'
```

## Parameters Reference

| Flag                | Description                                                 | Required | Example                      |
|---------------------|-------------------------------------------------------------|----------|------------------------------|
| `--privateKey, -p`  | Wallet private key (for transaction signing)                | Yes      | `0xabc123...`                |
| `--currency0Address, -c0` | Address for token 0                              | Yes      | `0xToken0...`                |
| `--currency1Address, -c1` | Address for token 1                              | Yes      | `0xToken1...`                |
| `--currency0Price, -p0`   | Price for token 0 (USD)                           | Yes      | `1850.55`                    |
| `--currency1Price, -p1`   | Price for token 1 (USD)                           | Yes      | `1.00`                       |
| `--currency0Decimals`     | Decimals for token 0                              | Yes      | `18`                         |
| `--currency1Decimals`     | Decimals for token 1                              | Yes      | `6`                          |
| `--fee, -f`               | Pool fee (e.g., 1% = 10000)                       | Yes      | `10000`                      |
| `--tickSpacing, -t`       | Tick spacing (e.g., 200 for 1% fee)               | Yes      | `200`                        |
| `--poolManager`           | Uniswap V4 PoolManager contract address            | Yes      | `0xPoolManager...`           |
| `--rpc`                   | RPC URL for network                               | Yes      | `https://mainnet.infura.io`  |
| `--etherscanRoot`         | Block explorer root URL                           | Yes      | `https://etherscan.io/tx`    |
| `--hooksAddress, -H`      | Hooks contract address (optional)                 | No       | `0x000...000`                |

## Developer Notes

- This project was created using `bun init` in bun v1.2.15.
- Core logic is in `index.ts`, with supporting modules in `src/`.
- Interactive mode uses [@clack/prompts](https://www.npmjs.com/package/@clack/prompts).
- Input validation is done with [Zod](https://github.com/colinhacks/zod).

## Contributing

Pull requests and issues are welcome. Please ensure your changes are well-tested and documented.

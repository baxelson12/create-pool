// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import { PoolKey } from "v4-core/src/types/PoolKey.sol";
import { IPoolManager } from "v4-core/src/interfaces/IPoolManager.sol";
import { Currency } from "v4-core/src/types/Currency.sol";
import { IHooks } from "v4-core/src/interfaces/IHooks.sol";

contract CreatePool is Script {
  /// @dev Structured pool data
  struct PoolData {
    /// Address for the first currency in the pair
    address currency0;
    /// Address for the second currency in the pair
    address currency1;
    /// sqrtX96 starting price
    uint160 startingPrice;
    /// Pool fee e.g 1% == 10_000
    uint24 fee;
    /// Space between ticks.  1% pool uses 200
    int24 tickSpacing;
    /// Address for a compliant v4 hooks contract
    address hooks;
  }

  /// @notice Script entry point
  /// @dev Ensure currencies are properly sorted.
  /// @param _pm Pool Manager address for your deployment network. REF: https://docs.uniswap.org/contracts/v4/deployments
  /// @param _data Data necessary to initialize pool
  function run(address _pm, PoolData memory _data) external {
    require(
      uint160(_data.currency0) < uint160(_data.currency1),
      "Addresses must be sorted such that uint160(currency0) < uint160(currency1)."
    );

    // Create pool identifier key
    PoolKey memory pool = PoolKey(
      Currency.wrap(_data.currency0),
      Currency.wrap(_data.currency1),
      _data.fee,
      _data.tickSpacing,
      IHooks(_data.hooks)
    );

    // Transmit data
    vm.broadcast();
    IPoolManager(_pm).initialize(pool, _data.startingPrice);
  }
}

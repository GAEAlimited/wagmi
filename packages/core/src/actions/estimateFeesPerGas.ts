import {
  type Chain,
  type FeeValuesEIP1559,
  type FeeValuesLegacy,
  type FeeValuesType,
  formatUnits,
} from 'viem'
import {
  type EstimateFeesPerGasErrorType as viem_EstimateFeesPerGasErrorType,
  type EstimateFeesPerGasParameters as viem_EstimateFeesPerGasParameters,
  type EstimateFeesPerGasReturnType as viem_EstimateFeesPerGasReturnType,
  estimateFeesPerGas as viem_estimateFeesPerGas,
} from 'viem/actions'

import { type Config } from '../createConfig.js'
import type { ChainIdParameter } from '../types/properties.js'
import type { Unit } from '../types/unit.js'
import type { Evaluate } from '../types/utils.js'
import type { UnionEvaluate, UnionLooseOmit } from '../types/utils.js'
import { getUnit } from '../utils/getUnit.js'

export type EstimateFeesPerGasParameters<
  type extends FeeValuesType = FeeValuesType,
  config extends Config = Config,
> = UnionEvaluate<
  UnionLooseOmit<
    viem_EstimateFeesPerGasParameters<Chain, Chain, type>,
    'chain'
  > &
    ChainIdParameter<config> & {
      formatUnits?: Unit | undefined
    }
>

export type EstimateFeesPerGasReturnType<
  type extends FeeValuesType = FeeValuesType,
> = Evaluate<
  viem_EstimateFeesPerGasReturnType<type> & {
    formatted: UnionEvaluate<
      | (type extends 'legacy' ? FeeValuesLegacy<string> : never)
      | (type extends 'eip1559' ? FeeValuesEIP1559<string> : never)
    >
  }
>

export type EstimateFeesPerGasErrorType = viem_EstimateFeesPerGasErrorType

export async function estimateFeesPerGas<
  config extends Config,
  type extends FeeValuesType = 'eip1559',
>(
  config: config,
  parameters: EstimateFeesPerGasParameters<type, config> = {},
): Promise<EstimateFeesPerGasReturnType<type>> {
  const { chainId, formatUnits: units = 'gwei', ...rest } = parameters

  const client = config.getClient({ chainId })

  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
    await viem_estimateFeesPerGas(client, rest)

  const unit = getUnit(units)
  const formatted = {
    gasPrice: gasPrice ? formatUnits(gasPrice, unit) : undefined,
    maxFeePerGas: maxFeePerGas ? formatUnits(maxFeePerGas, unit) : undefined,
    maxPriorityFeePerGas: maxPriorityFeePerGas
      ? formatUnits(maxPriorityFeePerGas, unit)
      : undefined,
  }

  return {
    formatted,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } as EstimateFeesPerGasReturnType<type>
}

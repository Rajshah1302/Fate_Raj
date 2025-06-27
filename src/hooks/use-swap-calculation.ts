"use client"

import { useMemo } from "react"
import type { TokenType, SwapDetails } from "../app/usePool/[id]/types/token-pool"

interface UseSwapCalculationProps {
  amount: number
  fromToken: TokenType
  toToken: TokenType
  bullPrice: number
  bearPrice: number
  swapFee: number
}

export function useSwapCalculation({
  amount,
  fromToken,
  toToken,
  bullPrice,
  bearPrice,
  swapFee,
}: UseSwapCalculationProps): SwapDetails {
  return useMemo(() => {
    if (!amount || amount <= 0) {
      return {
        exchangeRate: 0,
        swapFee,
        swapFeeAmount: 0,
        expectedOutput: 0,
        priceImpact: 0,
      }
    }

    let outputAmount = 0
    let exchangeRate = 0

    if (fromToken === "sui") {
      const targetPrice = toToken === "bull" ? bullPrice : bearPrice
      outputAmount = amount / targetPrice
      exchangeRate = 1 / targetPrice
    } else if (toToken === "sui") {
      const fromPrice = fromToken === "bull" ? bullPrice : bearPrice
      outputAmount = amount * fromPrice
      exchangeRate = fromPrice
    } else {
      // Token to token swap (bull <-> bear)
      const fromPrice = fromToken === "bull" ? bullPrice : bearPrice
      const toPrice = toToken === "bull" ? bullPrice : bearPrice
      outputAmount = (amount * fromPrice) / toPrice
      exchangeRate = fromPrice / toPrice
    }

    const swapFeeAmount = outputAmount * swapFee
    const finalOutput = outputAmount * (1 - swapFee)

    return {
      exchangeRate,
      swapFee,
      swapFeeAmount,
      expectedOutput: finalOutput,
      priceImpact: 0, // Could be calculated based on liquidity
    }
  }, [amount, fromToken, toToken, bullPrice, bearPrice, swapFee])
}

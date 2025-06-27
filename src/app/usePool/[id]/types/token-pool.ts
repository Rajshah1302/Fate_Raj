export interface Token {
  id: string
  symbol: string
  name: string
  price: number
  balance: number
  decimals?: number
  icon?: string
}

export type TokenType = "sui" | "bull" | "bear"

export interface SwapDetails {
  exchangeRate: number
  swapFee: number
  swapFeeAmount: number
  expectedOutput: number
  priceImpact?: number
}

export interface TokenPoolCardProps {
  amount?: number
  setAmount: (amount: number) => void
  onBuy: (tokenId: string, amount: number) => Promise<void>
  onSell: (tokenId: string, amount: number) => Promise<void>
  bullPrice?: number
  bearPrice?: number
  swapFee?: number
  bullToken: Token
  bearToken: Token
  isLoading?: boolean
  userBalances?: Record<TokenType, number>
}

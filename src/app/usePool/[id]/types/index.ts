export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  vault_creator: string;
  vault_fee: number;
  vault_creator_fee: number;
  treasury_fee: number;
  asset_balance: number;
  supply: number;
  prediction_pool: string;
  other_token: string;
}

export interface Vault {
  id: string;
  bullToken: Token;
  bearToken: Token;
  bullPercentage: number;
  bearPercentage: number;
  totalValue: number;
  previous_price: number;
  vault_creator: string;
  fees: {
    entry: number;
    exit: number;
    performance: number;
  };
}

export interface DualTokenVaultProps {
  tokens: {
    bullToken: Token;
    bearToken: Token;
  };
  vault: Vault;
}